import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  Prisma,
  order,
  order_status_enum,
  product_price,
  discount as DiscountModel,
} from '../generated/prisma/client';
import {
  CreateOrderDto,
  OrderStatusEnum as OrderStatusDtoEnum,
} from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ValidateDiscountDto } from './dto/validate-discount.dto';
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  // ==================================
  // CREATE ORDER
  // ==================================
  async create(createOrderDto: CreateOrderDto): Promise<order> {
    const { employee_id, customer_id, products, discounts, customize_note } =
      createOrderDto;

    // 1. Validate Employee
    const employee = await this.prisma.employee.findUnique({
      where: { employee_id },
    });
    if (!employee)
      throw new NotFoundException(
        `Nhân viên với ID ${employee_id} không tồn tại.`,
      );

    // 2. Validate Customer (if provided) and get membership info
    let customerWithMembership: any = null;
    if (customer_id) {
      customerWithMembership = await this.prisma.customer.findUnique({
        where: { customer_id },
        include: {
          membership_type: true,
        },
      });
      if (!customerWithMembership)
        throw new NotFoundException(
          `Khách hàng với ID ${customer_id} không tồn tại.`,
        );
    }

    // 3. Process Products and Calculate total_amount
    let calculatedTotalAmount = new Decimal(0);
    const orderProductCreateInputs: Prisma.order_productCreateWithoutOrderInput[] =
      [];

    if (!products || products.length === 0) {
      throw new BadRequestException('Order must contain at least one product.');
    }

    for (const productDto of products) {
      const productPriceInfo = await this.prisma.product_price.findUnique({
        where: { product_price_id: productDto.product_price_id },
      });
      if (!productPriceInfo) {
        throw new NotFoundException(
          `Giá sản phẩm với ID ${productDto.product_price_id} không tồn tại.`,
        );
      }
      if (!productPriceInfo.is_active) {
        throw new UnprocessableEntityException(
          `ProductPrice with ID ${productDto.product_price_id} is not active.`,
        );
      }
      calculatedTotalAmount = calculatedTotalAmount.plus(
        new Decimal(productPriceInfo.price).times(productDto.quantity),
      );
      orderProductCreateInputs.push({
        quantity: productDto.quantity,
        option: productDto.option,
        product_price: {
          connect: { product_price_id: productDto.product_price_id },
        },
      });
    }

    // 4. Process Discounts and Calculate final_amount
    let calculatedFinalAmount = new Decimal(calculatedTotalAmount);
    const orderDiscountCreateInputs: Prisma.order_discountCreateWithoutOrderInput[] =
      [];
    let totalDiscountApplied = new Decimal(0);

    // 4.1. Apply Membership Discount first (if customer has membership)
    if (customerWithMembership && customerWithMembership.membership_type) {
      const membershipType = customerWithMembership.membership_type;
      
      // Check if membership is active and valid
      if (membershipType.is_active && 
          (!membershipType.valid_until || new Date() <= new Date(membershipType.valid_until))) {
        
        // Calculate membership discount (percentage-based)
        const membershipDiscountAmount = calculatedTotalAmount
          .times(new Decimal(membershipType.discount_value))
          .dividedBy(100);
        
        calculatedFinalAmount = calculatedFinalAmount.minus(membershipDiscountAmount);
        totalDiscountApplied = totalDiscountApplied.plus(membershipDiscountAmount);
        
        console.log(`Áp dụng giảm giá membership ${membershipType.type}: ${membershipDiscountAmount.toNumber()} VND (${membershipType.discount_value}%)`);
      }
    }

    // 4.2. Apply Coupon/Discount codes (after membership discount)
    if (discounts && discounts.length > 0) {
      for (const discountDto of discounts) {
        const validationResult = await this.validateSingleDiscount(
          discountDto.discount_id,
          calculatedTotalAmount.toNumber(),
          products.length,
          customer_id,
        );

        if (!validationResult.is_valid) {
          throw new UnprocessableEntityException(validationResult.reason);
        }

        const currentDiscountAmount = new Decimal(validationResult.discount_amount);
        calculatedFinalAmount = calculatedFinalAmount.minus(currentDiscountAmount);
        totalDiscountApplied = totalDiscountApplied.plus(currentDiscountAmount);

        orderDiscountCreateInputs.push({
          discount_amount: currentDiscountAmount.toNumber(),
          discount: { connect: { discount_id: discountDto.discount_id } },
        });
      }
    }
    if (calculatedFinalAmount.lessThan(0))
      calculatedFinalAmount = new Decimal(0);

    // 5. Create Order data
    const orderData: Prisma.orderCreateInput = {
      order_time: new Date(),
      total_amount: calculatedTotalAmount.toNumber(), // Prisma schema là Int
      final_amount: calculatedFinalAmount.toNumber(), // Prisma schema là Int
      status: order_status_enum.PROCESSING, // Mặc định là PROCESSING
      customize_note: customize_note,
      employee: { connect: { employee_id } },
      ...(customer_id && { customer: { connect: { customer_id } } }),
      order_product: { create: orderProductCreateInputs },
      ...(orderDiscountCreateInputs.length > 0 && {
        order_discount: { create: orderDiscountCreateInputs },
      }),
    };

    try {
      return await this.prisma.order.create({
        data: orderData,
        include: {
          customer: true,
          employee: true,
          order_product: {
            include: {
              product_price: { include: { product_size: true, product: true } },
            },
          },
          order_discount: { include: { discount: true } },
          payment: true,
        },
      });
    } catch (error) {
      console.error('Error creating order:', error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Handle specific Prisma errors if necessary
      }
      throw new InternalServerErrorException('Could not create order.');
    }
  }

  // ==================================
  // FIND ORDERS
  // ==================================
  async findAll(
    paginationDto: PaginationDto,
    filters?: {
      customerId?: number;
      employeeId?: number;
      status?: OrderStatusDtoEnum;
    },
  ): Promise<PaginatedResult<order>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const where: Prisma.orderWhereInput = {};
    if (filters?.customerId) where.customer_id = filters.customerId;
    if (filters?.employeeId) where.employee_id = filters.employeeId;
    if (filters?.status) where.status = filters.status as order_status_enum;

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        skip,
        take: limit,
        where,
        orderBy: { order_id: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async findOne(id: number, include?: Prisma.orderInclude): Promise<order> {
    const order = await this.prisma.order.findUnique({
      where: { order_id: id },
      include: include || {
        customer: true,
        employee: true,
        order_product: {
          include: {
            product_price: { include: { product_size: true, product: true } },
          },
        },
        order_discount: { include: { discount: true } },
        payment: true,
      },
    });
    if (!order) {
      throw new NotFoundException(`Đơn hàng với ID ${id} không tồn tại.`);
    }
    return order;
  }

  // ==================================
  // UPDATE ORDER
  // ==================================
  async update(id: number, updateOrderDto: UpdateOrderDto): Promise<order> {
    const existingOrder = await this.findOne(id); // Checks existence and fetches current state

    const { employee_id, customer_id, products, discounts, customize_note } =
      updateOrderDto;

    // Start with data that can be directly updated
    const dataToUpdate: Prisma.orderUpdateInput = {
      ...(employee_id && { employee: { connect: { employee_id } } }),
      ...(customer_id !== undefined && {
        customer: customer_id
          ? { connect: { customer_id } }
          : { disconnect: true },
      }), // Allow setting customer_id to null
      ...(customize_note !== undefined && { customize_note }),
    };

    return this.prisma.$transaction(async (tx) => {
      let newTotalAmount = new Decimal(existingOrder.total_amount || 0);
      let newFinalAmount = new Decimal(existingOrder.final_amount || 0);

      if (products !== undefined) {
        await tx.order_product.deleteMany({ where: { order_id: id } });
        newTotalAmount = new Decimal(0);
        if (products.length > 0) {
          const newOrderProductCreateInputs: Prisma.order_productCreateWithoutOrderInput[] =
            [];
          for (const productDto of products) {
            const productPriceInfo = await tx.product_price.findUnique({
              where: { product_price_id: productDto.product_price_id },
            });
            if (!productPriceInfo)
              throw new NotFoundException(
                `Giá sản phẩm với ID ${productDto.product_price_id} không tồn tại.`,
              );
            if (!productPriceInfo.is_active)
              throw new UnprocessableEntityException(
                `ProductPrice ID ${productDto.product_price_id} is not active.`,
              );
            newTotalAmount = newTotalAmount.plus(
              new Decimal(productPriceInfo.price).times(productDto.quantity),
            );
            newOrderProductCreateInputs.push({
              quantity: productDto.quantity,
              option: productDto.option,
              product_price: {
                connect: { product_price_id: productDto.product_price_id },
              },
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
          const newOrderDiscountCreateInputs: Prisma.order_discountCreateWithoutOrderInput[] =
            [];
          for (const discountDto of discounts) {
            const discountInfo = await tx.discount.findUnique({
              where: { discount_id: discountDto.discount_id },
            });
            if (!discountInfo)
              throw new NotFoundException(
                `Giảm giá với ID ${discountDto.discount_id} không tồn tại.`,
              );
            if (
              !discountInfo.is_active ||
              new Date() > new Date(discountInfo.valid_until) ||
              (discountInfo.valid_from &&
                new Date() < new Date(discountInfo.valid_from))
            ) {
              throw new UnprocessableEntityException(
                `Discount ID ${discountInfo.discount_id} ('${discountInfo.name}') is not valid or active at this time.`,
              );
            }
            if (
              newTotalAmount.lessThan(discountInfo.min_required_order_value)
            ) {
              throw new UnprocessableEntityException(
                `Order total (${newTotalAmount}) does not meet minimum required value (${discountInfo.min_required_order_value}) for discount '${discountInfo.name}'.`,
              );
            }

            // Logic tính discount_amount cho percentage (trong update)
            const discountPercentageUpdate = new Decimal(
              discountInfo.discount_value,
            ).dividedBy(100);
            let currentDiscountAmountUpdate = newTotalAmount.times(
              discountPercentageUpdate,
            );

            const maxDiscountUpdate = new Decimal(
              discountInfo.max_discount_amount,
            );
            if (currentDiscountAmountUpdate.greaterThan(maxDiscountUpdate)) {
              currentDiscountAmountUpdate = maxDiscountUpdate;
            }

            newFinalAmount = newFinalAmount.minus(currentDiscountAmountUpdate);
            totalDiscountAppliedOnUpdate = totalDiscountAppliedOnUpdate.plus(
              currentDiscountAmountUpdate,
            );
            newOrderDiscountCreateInputs.push({
              discount_amount: currentDiscountAmountUpdate.toNumber(),
              discount: { connect: { discount_id: discountDto.discount_id } },
            });
          }
          dataToUpdate.order_discount = {
            create: newOrderDiscountCreateInputs,
          };
        } else {
          dataToUpdate.order_discount = { deleteMany: {} }; // Remove all discounts if empty array sent
        }
      } else {
        // If discounts not in DTO, recalculate final amount from newTotalAmount and existing discounts
        const existingDiscounts = await tx.order_discount.findMany({
          where: { order_id: id },
          include: { discount: true },
        });
        for (const od of existingDiscounts) {
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
          order_product: {
            include: {
              product_price: { include: { product_size: true, product: true } },
            },
          },
          order_discount: { include: { discount: true } },
          payment: true,
        },
      });
    });
  }

  // ==================================
  // CANCEL ORDER
  // ==================================
  async cancelOrder(id: number): Promise<order> {
    const existingOrder = await this.findOne(id);

    // Kiểm tra trạng thái hiện tại có thể hủy không
    if (existingOrder.status === order_status_enum.CANCELLED) {
      throw new BadRequestException('Đơn hàng đã được hủy trước đó');
    }

    if (existingOrder.status === order_status_enum.COMPLETED) {
      throw new BadRequestException('Không thể hủy đơn hàng đã hoàn thành');
    }

    // Cập nhật trạng thái thành CANCELLED
    return this.prisma.order.update({
      where: { order_id: id },
      data: { status: order_status_enum.CANCELLED },
      include: {
        customer: true,
        employee: true,
        order_product: {
          include: {
            product_price: { include: { product_size: true, product: true } },
          },
        },
        order_discount: { include: { discount: true } },
        payment: true,
      },
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

  async findByEmployee(
    employee_id: number,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<order>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { employee_id },
        skip,
        take: limit,
        orderBy: { order_id: 'desc' },
      }),
      this.prisma.order.count({
        where: { employee_id },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async findByCustomer(
    customer_id: number,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<order>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { customer_id },
        skip,
        take: limit,
        orderBy: { order_id: 'desc' },
      }),
      this.prisma.order.count({
        where: { customer_id },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async findByStatus(
    status: OrderStatusDtoEnum,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<order>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { status: status as order_status_enum },
        skip,
        take: limit,
        orderBy: { order_id: 'desc' },
      }),
      this.prisma.order.count({
        where: { status: status as order_status_enum },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  // ==================================
  // DISCOUNT VALIDATION
  // ==================================
  async validateDiscounts(validateDiscountDto: ValidateDiscountDto): Promise<{
    valid_discounts: Array<{
      discount_id: number;
      discount_name: string;
      discount_amount: number;
      reason: string;
    }>;
    invalid_discounts: Array<{
      discount_id: number;
      discount_name: string;
      reason: string;
    }>;
    summary: {
      total_checked: number;
      valid_count: number;
      invalid_count: number;
      total_discount_amount: number;
    };
  }> {
    const { customer_id, discount_ids, total_amount, product_count } = validateDiscountDto;
    
    const valid_discounts: Array<{
      discount_id: number;
      discount_name: string;
      discount_amount: number;
      reason: string;
    }> = [];
    const invalid_discounts: Array<{
      discount_id: number;
      discount_name: string;
      reason: string;
    }> = [];
    let total_discount_amount = 0;

    for (const discount_id of discount_ids) {
      const validationResult = await this.validateSingleDiscount(
        discount_id,
        total_amount,
        product_count,
        customer_id,
      );

      if (validationResult.is_valid) {
        valid_discounts.push({
          discount_id,
          discount_name: validationResult.discount_name,
          discount_amount: validationResult.discount_amount,
          reason: validationResult.reason,
        });
        total_discount_amount += validationResult.discount_amount;
      } else {
        invalid_discounts.push({
          discount_id,
          discount_name: validationResult.discount_name,
          reason: validationResult.reason,
        });
      }
    }

    return {
      valid_discounts,
      invalid_discounts,
      summary: {
        total_checked: discount_ids.length,
        valid_count: valid_discounts.length,
        invalid_count: invalid_discounts.length,
        total_discount_amount,
      },
    };
  }

  private async validateSingleDiscount(
    discount_id: number,
    total_amount: number,
    product_count: number,
    customer_id?: number,
  ): Promise<{
    is_valid: boolean;
    discount_name: string;
    discount_amount: number;
    reason: string;
  }> {
    // 1. Kiểm tra discount tồn tại
    const discountInfo = await this.prisma.discount.findUnique({
      where: { discount_id },
    });

    if (!discountInfo) {
      return {
        is_valid: false,
        discount_name: '',
        discount_amount: 0,
        reason: `Giảm giá với ID ${discount_id} không tồn tại.`,
      };
    }

    // 2. Kiểm tra discount có active và trong thời hạn không
    const currentDate = new Date();
    if (
      !discountInfo.is_active ||
      currentDate > new Date(discountInfo.valid_until) ||
      (discountInfo.valid_from && currentDate < new Date(discountInfo.valid_from))
    ) {
      return {
        is_valid: false,
        discount_name: discountInfo.name,
        discount_amount: 0,
        reason: `Discount '${discountInfo.name}' không còn hiệu lực hoặc chưa đến thời gian áp dụng.`,
      };
    }

    // 3. Kiểm tra tổng tiền đơn hàng có đạt yêu cầu tối thiểu không
    if (total_amount < discountInfo.min_required_order_value) {
      return {
        is_valid: false,
        discount_name: discountInfo.name,
        discount_amount: 0,
        reason: `Đơn hàng (${total_amount.toLocaleString('vi-VN')}đ) chưa đạt giá trị tối thiểu (${discountInfo.min_required_order_value.toLocaleString('vi-VN')}đ) để áp dụng discount '${discountInfo.name}'.`,
      };
    }

    // 4. Kiểm tra số lượng sản phẩm tối thiểu (nếu có)
    if (discountInfo.min_required_product && product_count < discountInfo.min_required_product) {
      return {
        is_valid: false,
        discount_name: discountInfo.name,
        discount_amount: 0,
        reason: `Đơn hàng có ${product_count} sản phẩm, cần tối thiểu ${discountInfo.min_required_product} sản phẩm để áp dụng discount '${discountInfo.name}'.`,
      };
    }

    // 5. Kiểm tra giới hạn sử dụng tổng thể (nếu có)
    if (discountInfo.max_uses && discountInfo.current_uses && discountInfo.current_uses >= discountInfo.max_uses) {
      return {
        is_valid: false,
        discount_name: discountInfo.name,
        discount_amount: 0,
        reason: `Discount '${discountInfo.name}' đã đạt giới hạn sử dụng tối đa (${discountInfo.max_uses} lần).`,
      };
    }

    // 6. Kiểm tra giới hạn sử dụng per customer (nếu có khách hàng và có giới hạn)
    if (customer_id && discountInfo.max_uses_per_customer) {
      const customerUsageCount = await this.prisma.order_discount.count({
        where: {
          discount_id,
          order: {
            customer_id,
            status: {
              in: [order_status_enum.PROCESSING, order_status_enum.COMPLETED],
            },
          },
        },
      });

      if (customerUsageCount >= discountInfo.max_uses_per_customer) {
        return {
          is_valid: false,
          discount_name: discountInfo.name,
          discount_amount: 0,
          reason: `Khách hàng đã sử dụng discount '${discountInfo.name}' đạt giới hạn tối đa (${discountInfo.max_uses_per_customer} lần).`,
        };
      }
    }

    // 7. Kiểm tra membership type của customer (nếu có)
    // Nếu membership hết hạn, chỉ đơn giản không áp dụng lợi ích membership
    // nhưng vẫn có thể áp dụng discount thông thường

    // 8. Tính toán số tiền giảm giá
    const discountPercentage = new Decimal(discountInfo.discount_value).dividedBy(100);
    let discountAmount = new Decimal(total_amount).times(discountPercentage);

    // Áp dụng giới hạn max_discount_amount
    const maxDiscountAmount = new Decimal(discountInfo.max_discount_amount);
    if (discountAmount.greaterThan(maxDiscountAmount)) {
      discountAmount = maxDiscountAmount;
    }

    return {
      is_valid: true,
      discount_name: discountInfo.name,
      discount_amount: discountAmount.toNumber(),
      reason: `Có thể áp dụng discount '${discountInfo.name}' với số tiền giảm ${discountAmount.toNumber().toLocaleString('vi-VN')}đ.`,
    };
  }
}
