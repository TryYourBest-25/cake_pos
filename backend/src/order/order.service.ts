import { Injectable, NotFoundException, BadRequestException, ConflictException, InternalServerErrorException, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, order, order_status_enum, product_price, discount as DiscountModel } from '../generated/prisma/client';
import { CreateOrderDto, OrderStatusEnum as OrderStatusDtoEnum } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  // ==================================
  // CREATE ORDER
  // ==================================
  async create(createOrderDto: CreateOrderDto): Promise<order> {
    const { employee_id, customer_id, products, discounts, customize_note, status } = createOrderDto;

    // 1. Validate Employee
    const employee = await this.prisma.employee.findUnique({ where: { employee_id } });
    if (!employee) throw new NotFoundException(`Employee with ID ${employee_id} not found.`);

    // 2. Validate Customer (if provided)
    if (customer_id) {
      const customer = await this.prisma.customer.findUnique({ where: { customer_id } });
      if (!customer) throw new NotFoundException(`Customer with ID ${customer_id} not found.`);
    }

    // 3. Process Products and Calculate total_amount
    let calculatedTotalAmount = new Decimal(0);
    const orderProductCreateInputs: Prisma.order_productCreateWithoutOrderInput[] = [];

    if (!products || products.length === 0) {
      throw new BadRequestException('Order must contain at least one product.');
    }

    for (const productDto of products) {
      const productPriceInfo = await this.prisma.product_price.findUnique({
        where: { product_price_id: productDto.product_price_id },
      });
      if (!productPriceInfo) {
        throw new NotFoundException(`ProductPrice with ID ${productDto.product_price_id} not found.`);
      }
      if (!productPriceInfo.is_active) {
        throw new UnprocessableEntityException(`ProductPrice with ID ${productDto.product_price_id} is not active.`);
      }
      calculatedTotalAmount = calculatedTotalAmount.plus(new Decimal(productPriceInfo.price).times(productDto.quantity));
      orderProductCreateInputs.push({
        quantity: productDto.quantity,
        option: productDto.option,
        product_price: { connect: { product_price_id: productDto.product_price_id } },
      });
    }

    // 4. Process Discounts and Calculate final_amount
    // Đây là phần phức tạp, cần logic chi tiết về cách áp dụng discount (thứ tự, loại, điều kiện)
    // Tạm thời, giả sử discount_value là số tiền giảm trực tiếp trên total_amount
    let calculatedFinalAmount = new Decimal(calculatedTotalAmount);
    const orderDiscountCreateInputs: Prisma.order_discountCreateWithoutOrderInput[] = [];
    let totalDiscountApplied = new Decimal(0);

    if (discounts && discounts.length > 0) {
      for (const discountDto of discounts) {
        const discountInfo = await this.prisma.discount.findUnique({
          where: { discount_id: discountDto.discount_id },
        });
        if (!discountInfo) {
          throw new NotFoundException(`Discount with ID ${discountDto.discount_id} not found.`);
        }
        if (!discountInfo.is_active || new Date() > new Date(discountInfo.valid_until) || (discountInfo.valid_from && new Date() < new Date(discountInfo.valid_from))){
            throw new UnprocessableEntityException(`Discount ID ${discountInfo.discount_id} ('${discountInfo.name}') is not valid or active at this time.`);
        }
        if (calculatedTotalAmount.lessThan(discountInfo.min_required_order_value)) {
            throw new UnprocessableEntityException(`Order total (${calculatedTotalAmount}) does not meet minimum required value (${discountInfo.min_required_order_value}) for discount '${discountInfo.name}'.`);
        }

        // Logic tính discount_amount cho percentage
        // discountInfo.discount_value là Decimal(4,1) ví dụ 10.5 (nghĩa là 10.5%)
        const discountPercentage = new Decimal(discountInfo.discount_value).dividedBy(100); // ví dụ: 10.5 -> 0.105
        let currentDiscountAmount = calculatedTotalAmount.times(discountPercentage);

        // Áp dụng max_discount_amount
        const maxDiscount = new Decimal(discountInfo.max_discount_amount);
        if (currentDiscountAmount.greaterThan(maxDiscount)) {
          currentDiscountAmount = maxDiscount;
        }
        
        calculatedFinalAmount = calculatedFinalAmount.minus(currentDiscountAmount);
        totalDiscountApplied = totalDiscountApplied.plus(currentDiscountAmount);

        orderDiscountCreateInputs.push({
          discount_amount: currentDiscountAmount.toNumber(), // Prisma schema order_discount.discount_amount là Int
          discount: { connect: { discount_id: discountDto.discount_id } },
        });
      }
    }
    if (calculatedFinalAmount.lessThan(0)) calculatedFinalAmount = new Decimal(0);

    // 5. Create Order data
    const orderData: Prisma.orderCreateInput = {
      order_time: new Date(),
      total_amount: calculatedTotalAmount.toNumber(), // Prisma schema là Int
      final_amount: calculatedFinalAmount.toNumber(), // Prisma schema là Int
      status: (status as order_status_enum) || order_status_enum.PROCESSING,
      customize_note: customize_note,
      employee: { connect: { employee_id } },
      ...(customer_id && { customer: { connect: { customer_id } } }),
      order_product: { create: orderProductCreateInputs },
      ...(orderDiscountCreateInputs.length > 0 && { order_discount: { create: orderDiscountCreateInputs } }),
    };

    try {
      return await this.prisma.order.create({
        data: orderData,
        include: { 
            customer: true, 
            employee: true, 
            order_product: { include: { product_price: {include: {product_size: true, product:true}} } }, 
            order_discount: { include: { discount: true } },
            payment: true 
        }
      });
    } catch (error) {
      console.error("Error creating order:", error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Handle specific Prisma errors if necessary
      }
      throw new InternalServerErrorException('Could not create order.');
    }
  }

  // ==================================
  // FIND ORDERS
  // ==================================
  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.orderWhereUniqueInput;
    where?: Prisma.orderWhereInput;
    orderBy?: Prisma.orderOrderByWithRelationInput;
    include?: Prisma.orderInclude; 
  }): Promise<order[]> {
    const { skip, take, cursor, where, orderBy, include } = params;
    return this.prisma.order.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: include || { 
        customer: true, 
        employee: true, 
        order_product: { include: { product_price: {include: {product_size: true, product:true}} } }, 
        order_discount: { include: { discount: true } },
        payment: true 
      },
    });
  }

  async findOne(id: number, include?: Prisma.orderInclude): Promise<order> {
    const order = await this.prisma.order.findUnique({
      where: { order_id: id },
      include: include || {
        customer: true, 
        employee: true, 
        order_product: { include: { product_price: {include: {product_size: true, product:true}} } }, 
        order_discount: { include: { discount: true } },
        payment: true 
      },
    });
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found.`);
    }
    return order;
  }

  // ==================================
  // UPDATE ORDER
  // ==================================
  async update(id: number, updateOrderDto: UpdateOrderDto): Promise<order> {
    const existingOrder = await this.findOne(id); // Checks existence and fetches current state

    const { employee_id, customer_id, products, discounts, customize_note, status } = updateOrderDto;
    
    // Start with data that can be directly updated
    const dataToUpdate: Prisma.orderUpdateInput = {
      ...(employee_id && { employee: { connect: { employee_id } } }),
      ...(customer_id !== undefined && { 
          customer: customer_id ? { connect: { customer_id } } : { disconnect: true } 
      }), // Allow setting customer_id to null
      ...(customize_note !== undefined && { customize_note }),
      ...(status && { status: status as order_status_enum }),
    };

    // Transaction for product/discount updates and final amount recalculation
    return this.prisma.$transaction(async (tx) => {
        let newTotalAmount = new Decimal(existingOrder.total_amount || 0);
        let newFinalAmount = new Decimal(existingOrder.final_amount || 0);

        // Handle product updates: Delete existing and create new if `products` array is provided
        if (products !== undefined) {
            await tx.order_product.deleteMany({ where: { order_id: id } });
            newTotalAmount = new Decimal(0);
            if (products.length > 0) {
                const newOrderProductCreateInputs: Prisma.order_productCreateWithoutOrderInput[] = [];
                for (const productDto of products) {
                    const productPriceInfo = await tx.product_price.findUnique({ 
                        where: { product_price_id: productDto.product_price_id }
                    });
                    if (!productPriceInfo) throw new NotFoundException(`ProductPrice with ID ${productDto.product_price_id} not found.`);
                    if (!productPriceInfo.is_active) throw new UnprocessableEntityException(`ProductPrice ID ${productDto.product_price_id} is not active.`);
                    newTotalAmount = newTotalAmount.plus(new Decimal(productPriceInfo.price).times(productDto.quantity));
                    newOrderProductCreateInputs.push({
                        quantity: productDto.quantity, 
                        option: productDto.option,
                        product_price: { connect: { product_price_id: productDto.product_price_id } }
                    });
                }
                dataToUpdate.order_product = { create: newOrderProductCreateInputs };
            } else {
                 dataToUpdate.order_product = { deleteMany: {} }; // Remove all products if empty array sent
            }
            dataToUpdate.total_amount = newTotalAmount.toNumber();
        } else {
            // If products not in DTO, total amount remains as is (or could be recalculated from existing products if needed)
            newTotalAmount = new Decimal(existingOrder.total_amount || 0); 
        }

        // Handle discount updates: Delete existing and create new if `discounts` array is provided
        // This also means recalculating final_amount based on newTotalAmount and new discounts
        newFinalAmount = new Decimal(newTotalAmount); // Start final amount from potentially new total amount
        if (discounts !== undefined) {
            await tx.order_discount.deleteMany({ where: { order_id: id } });
            let totalDiscountAppliedOnUpdate = new Decimal(0);
            if (discounts.length > 0) {
                const newOrderDiscountCreateInputs: Prisma.order_discountCreateWithoutOrderInput[] = [];
                for (const discountDto of discounts) {
                    const discountInfo = await tx.discount.findUnique({ 
                        where: { discount_id: discountDto.discount_id }
                    });
                    if (!discountInfo) throw new NotFoundException(`Discount with ID ${discountDto.discount_id} not found.`);
                    if (!discountInfo.is_active || new Date() > new Date(discountInfo.valid_until) || (discountInfo.valid_from && new Date() < new Date(discountInfo.valid_from))){
                        throw new UnprocessableEntityException(`Discount ID ${discountInfo.discount_id} ('${discountInfo.name}') is not valid or active at this time.`);
                    }
                    if (newTotalAmount.lessThan(discountInfo.min_required_order_value)) {
                        throw new UnprocessableEntityException(`Order total (${newTotalAmount}) does not meet minimum required value (${discountInfo.min_required_order_value}) for discount '${discountInfo.name}'.`);
                    }
                    
                    // Logic tính discount_amount cho percentage (trong update)
                    const discountPercentageUpdate = new Decimal(discountInfo.discount_value).dividedBy(100);
                    let currentDiscountAmountUpdate = newTotalAmount.times(discountPercentageUpdate);

                    const maxDiscountUpdate = new Decimal(discountInfo.max_discount_amount);
                    if (currentDiscountAmountUpdate.greaterThan(maxDiscountUpdate)) {
                        currentDiscountAmountUpdate = maxDiscountUpdate;
                    }

                    newFinalAmount = newFinalAmount.minus(currentDiscountAmountUpdate);
                    totalDiscountAppliedOnUpdate = totalDiscountAppliedOnUpdate.plus(currentDiscountAmountUpdate);
                    newOrderDiscountCreateInputs.push({
                        discount_amount: currentDiscountAmountUpdate.toNumber(),
                        discount: { connect: { discount_id: discountDto.discount_id } }
                    });
                }
                dataToUpdate.order_discount = { create: newOrderDiscountCreateInputs };
            } else {
                 dataToUpdate.order_discount = { deleteMany: {} }; // Remove all discounts if empty array sent
            }
        } else {
            // If discounts not in DTO, recalculate final amount from newTotalAmount and existing discounts
            const existingDiscounts = await tx.order_discount.findMany({ 
                where: { order_id: id }, 
                include: { discount: true }
            });
            for (const od of existingDiscounts) {
                // Simplified recalculation, assumes discount_amount stored is still valid.
                // Realistically, should re-evaluate each discount based on newTotalAmount and its rules.
                newFinalAmount = newFinalAmount.minus(od.discount_amount);
            }
        }
        if (newFinalAmount.lessThan(0)) newFinalAmount = new Decimal(0);
        dataToUpdate.final_amount = newFinalAmount.toNumber();

        // Update the order itself
        return tx.order.update({
            where: { order_id: id },
            data: dataToUpdate,
            include: { 
                customer: true, 
                employee: true, 
                order_product: { include: { product_price: {include: {product_size: true, product: true}} } }, 
                order_discount: { include: { discount: true } },
                payment: true
            }
        });
    });
  }

  // ==================================
  // DELETE ORDER
  // ==================================
  async remove(id: number): Promise<order> {
    const orderToDelete = await this.findOne(id); // Ensure order exists and get details before deletion
    // Prisma onDelete: Cascade should handle related order_product, order_discount, payment
    // If status is COMPLETED or has payments, may prevent deletion based on business rules.
    if (orderToDelete.status === order_status_enum.COMPLETED) {
        // throw new BadRequestException("Cannot delete a completed order.");
    }
    // Check for payments might be needed here depending on rules.

    await this.prisma.order.delete({ where: { order_id: id } });
    return orderToDelete; 
  }
} 