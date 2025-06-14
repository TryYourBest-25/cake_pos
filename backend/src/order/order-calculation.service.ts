import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
import { CalculateOrderDto, OrderCalculationResult, CalculateOrderProductDto, CalculateOrderDiscountDto } from './dto/calculate-order.dto';

@Injectable()
export class OrderCalculationService {
  constructor(private prisma: PrismaService) {}

  /**
   * Tính toán chi tiết giá tiền cho order mà không tạo order thực sự
   */
  async calculateOrder(calculateOrderDto: CalculateOrderDto): Promise<OrderCalculationResult> {
    const { products, discounts } = calculateOrderDto;

    // 1. Tính tổng tiền từ products
    const productCalculation = await this.calculateProductsTotal(products);
    
    // 2. Tính discount
    const discountCalculation = await this.calculateDiscounts(
      discounts || [], 
      productCalculation.total_amount
    );

    // 3. Tính final amount
    const final_amount = Math.max(0, productCalculation.total_amount - discountCalculation.total_discount_applied);

    return {
      total_amount: productCalculation.total_amount,
      final_amount,
      total_discount_applied: discountCalculation.total_discount_applied,
      products: productCalculation.products,
      discounts: discountCalculation.discounts,
    };
  }

  /**
   * Tính tổng tiền từ danh sách products
   */
  async calculateProductsTotal(products: CalculateOrderProductDto[]) {
    if (!products || products.length === 0) {
      throw new UnprocessableEntityException('Order must contain at least one product.');
    }

    let total_amount = 0;
    const productDetails: Array<{
      product_price_id: number;
      quantity: number;
      unit_price: number;
      subtotal: number;
      product_name: string;
      size_name: string;
    }> = [];

    for (const productDto of products) {
      const productPriceInfo = await this.prisma.product_price.findUnique({
        where: { product_price_id: productDto.product_price_id },
        include: {
          product: true,
          product_size: true,
        },
      });

      if (!productPriceInfo) {
        throw new NotFoundException(`Giá sản phẩm với ID ${productDto.product_price_id} không tồn tại.`);
      }

      if (!productPriceInfo.is_active) {
        throw new UnprocessableEntityException(`Giá sản phẩm với ID ${productDto.product_price_id} is not active.`);
      }

      const unit_price = Number(productPriceInfo.price);
      const subtotal = unit_price * productDto.quantity;
      total_amount += subtotal;

      productDetails.push({
        product_price_id: productDto.product_price_id,
        quantity: productDto.quantity,
        unit_price,
        subtotal,
        product_name: productPriceInfo.product.name,
        size_name: productPriceInfo.product_size.name,
      });
    }

    return {
      total_amount,
      products: productDetails,
    };
  }

  /**
   * Tính tổng discount áp dụng
   */
  async calculateDiscounts(discounts: CalculateOrderDiscountDto[], total_amount: number) {
    let total_discount_applied = 0;
    const discountDetails: Array<{
      discount_id: number;
      discount_name: string;
      discount_value: number;
      discount_amount: number;
      max_discount_amount: number;
    }> = [];

    if (!discounts || discounts.length === 0) {
      return {
        total_discount_applied,
        discounts: discountDetails,
      };
    }

    const totalAmountDecimal = new Decimal(total_amount);

    for (const discountDto of discounts) {
      const discountInfo = await this.prisma.discount.findUnique({
        where: { discount_id: discountDto.discount_id },
      });

      if (!discountInfo) {
        throw new NotFoundException(`Giảm giá với ID ${discountDto.discount_id} không tồn tại.`);
      }

      // Kiểm tra tính hợp lệ của discount
      if (!discountInfo.is_active) {
        throw new UnprocessableEntityException(`Discount '${discountInfo.name}' is not active.`);
      }

      const now = new Date();
      if (now > new Date(discountInfo.valid_until)) {
        throw new UnprocessableEntityException(`Discount '${discountInfo.name}' has expired.`);
      }

      if (discountInfo.valid_from && now < new Date(discountInfo.valid_from)) {
        throw new UnprocessableEntityException(`Discount '${discountInfo.name}' is not yet valid.`);
      }

      if (totalAmountDecimal.lessThan(discountInfo.min_required_order_value)) {
        throw new UnprocessableEntityException(
          `Tổng đơn hàng (${total_amount}) không đạt giá trị tối thiểu yêu cầu (${discountInfo.min_required_order_value}) cho giảm giá '${discountInfo.name}'.`
        );
      }

      // Tính discount amount
      const discountPercentage = new Decimal(discountInfo.discount_value).dividedBy(100);
      let discountAmount = totalAmountDecimal.times(discountPercentage);

      // Áp dụng max discount amount
      const maxDiscount = new Decimal(discountInfo.max_discount_amount);
      if (discountAmount.greaterThan(maxDiscount)) {
        discountAmount = maxDiscount;
      }

      const discountAmountNumber = discountAmount.toNumber();
      total_discount_applied += discountAmountNumber;

      discountDetails.push({
        discount_id: discountDto.discount_id,
        discount_name: discountInfo.name,
        discount_value: Number(discountInfo.discount_value),
        discount_amount: discountAmountNumber,
        max_discount_amount: Number(discountInfo.max_discount_amount),
      });
    }

    return {
      total_discount_applied,
      discounts: discountDetails,
    };
  }

  /**
   * Tính lại giá cho order hiện có (dùng cho update)
   */
  async recalculateExistingOrder(orderId: number): Promise<OrderCalculationResult> {
    const order = await this.prisma.order.findUnique({
      where: { order_id: orderId },
      include: {
        order_product: {
          include: {
            product_price: {
              include: {
                product: true,
                product_size: true,
              },
            },
          },
        },
        order_discount: {
          include: {
            discount: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Đơn hàng với ID ${orderId} không tồn tại.`);
    }

    // Chuyển đổi dữ liệu order hiện có thành DTO
    const products: CalculateOrderProductDto[] = order.order_product.map(op => ({
      product_price_id: op.product_price_id,
      quantity: op.quantity,
      option: op.option || undefined,
    }));

    const discounts: CalculateOrderDiscountDto[] = order.order_discount.map(od => ({
      discount_id: od.discount_id,
    }));

    return this.calculateOrder({ products, discounts });
  }
} 