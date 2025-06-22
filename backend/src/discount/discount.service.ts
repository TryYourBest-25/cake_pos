import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { discount, Prisma } from '../generated/prisma/client';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { BulkDeleteDiscountDto } from './dto/bulk-delete-discount.dto';
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class DiscountService {
  constructor(private prisma: PrismaService) {}

  async create(createDiscountDto: CreateDiscountDto): Promise<discount> {
    const { coupon_code, valid_from, valid_until, ...restOfDto } =
      createDiscountDto;

    // Kiểm tra coupon_code đã tồn tại chưa
    const existingDiscountWithCouponCode = await this.prisma.discount.findFirst(
      {
        where: {
          coupon_code: coupon_code,
        },
      },
    );

    if (existingDiscountWithCouponCode) {
      throw new ConflictException(
        `Mã coupon '${coupon_code}' đã được sử dụng cho chương trình khuyến mãi khác.`,
      );
    }

    const data: Prisma.discountCreateInput = {
      ...restOfDto,
      coupon_code,
      discount_value: new Decimal(createDiscountDto.discount_value),
      min_required_order_value: createDiscountDto.min_required_order_value,
      max_discount_amount: createDiscountDto.max_discount_amount,
      is_active:
        createDiscountDto.is_active !== undefined
          ? createDiscountDto.is_active
          : true,
      ...(valid_from && { valid_from: new Date(valid_from) }),
      valid_until: new Date(valid_until),
    };

    try {
      return await this.prisma.discount.create({
        data,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002' && error.meta?.target) {
          const targetFields = error.meta.target as string[];
          if (targetFields.includes('name') && createDiscountDto.name) {
            throw new ConflictException(
              `Giảm giá với tên '${createDiscountDto.name}' đã tồn tại.`,
            );
          }
          if (targetFields.includes('coupon_code') && coupon_code) {
            throw new ConflictException(
              `Mã coupon '${coupon_code}' đã tồn tại.`,
            );
          }
          throw new ConflictException(
            `Vi phạm ràng buộc duy nhất trên: ${targetFields.join(', ')}.`,
          );
        }
      }
      console.error('Lỗi khi tạo chương trình giảm giá:', error);
      throw error;
    }
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<discount>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.discount.findMany({
        skip,
        take: limit,
        orderBy: { discount_id: 'desc' },
      }),
      this.prisma.discount.count(),
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

  async findOne(discount_id: number): Promise<discount | null> {
    const discountDetails = await this.prisma.discount.findUnique({
      where: { discount_id },
    });
    if (!discountDetails) {
      throw new NotFoundException(
        `Giảm giá với ID ${discount_id} không tồn tại`,
      );
    }
    return discountDetails;
  }

  async findByCouponCode(couponCode: string): Promise<discount | null> {
    const discountDetails = await this.prisma.discount.findFirst({
      where: { coupon_code: couponCode },
    });

    if (!discountDetails) {
      throw new NotFoundException(
        `Giảm giá với mã coupon '${couponCode}' không tồn tại.`,
      );
    }
    return discountDetails;
  }

  async update(
    discount_id: number,
    updateDiscountDto: UpdateDiscountDto,
  ): Promise<discount> {
    const {
      coupon_code,
      valid_from,
      valid_until,
      discount_value,
      ...restOfData
    } = updateDiscountDto;

    const existingDiscount = await this.prisma.discount.findUnique({
      where: { discount_id },
    });

    if (!existingDiscount) {
      throw new NotFoundException(
        `Giảm giá với ID ${discount_id} không tồn tại.`,
      );
    }

    // Kiểm tra coupon_code mới có bị trùng không (nếu có thay đổi)
    if (coupon_code && coupon_code !== existingDiscount.coupon_code) {
      const conflictingDiscountWithNewCoupon =
        await this.prisma.discount.findFirst({
          where: {
            coupon_code: coupon_code,
            NOT: { discount_id },
          },
        });
      if (conflictingDiscountWithNewCoupon) {
        throw new ConflictException(
          `Mã coupon '${coupon_code}' đã được sử dụng bởi chương trình khuyến mãi khác.`,
        );
      }
    }

    const data: Prisma.discountUpdateInput = {
      ...restOfData,
      ...(coupon_code && { coupon_code }),
      ...(discount_value !== undefined && {
        discount_value: new Decimal(discount_value),
      }),
      ...(valid_from && { valid_from: new Date(valid_from) }),
      ...(valid_until && { valid_until: new Date(valid_until) }),
    };

    try {
      return await this.prisma.discount.update({
        where: { discount_id },
        data,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(
            `Giảm giá với ID ${discount_id} không tồn tại.`,
          );
        }
        if (error.code === 'P2002' && error.meta?.target) {
          const targetFields = error.meta.target as string[];
          let fieldName = targetFields.join(', ');
          if (targetFields.includes('name') && updateDiscountDto.name)
            fieldName = `tên '${updateDiscountDto.name}'`;
          else if (targetFields.includes('coupon_code') && coupon_code)
            fieldName = `mã coupon '${coupon_code}'`;

          throw new ConflictException(
            `Giá trị cho ${fieldName} đã được sử dụng hoặc xảy ra xung đột.`,
          );
        }
      }
      console.error(`Lỗi khi cập nhật giảm giá ${discount_id}:`, error);
      throw error;
    }
  }

  async remove(discount_id: number): Promise<discount> {
    const existingDiscount = await this.prisma.discount.findUnique({
      where: { discount_id },
    });

    if (!existingDiscount) {
      throw new NotFoundException(
        `Giảm giá với ID ${discount_id} không tồn tại`,
      );
    }

    try {
      return await this.prisma.discount.delete({
        where: { discount_id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(
            `Giảm giá với ID ${discount_id} không tồn tại`,
          );
        }
        if (error.code === 'P2003') {
          throw new ConflictException(
            `Giảm giá với ID ${discount_id} không thể xóa vì đang được sử dụng trong các đơn hàng khác.`,
          );
        }
      }
      console.error(`Lỗi khi xóa giảm giá ${discount_id}:`, error);
      throw error;
    }
  }

  async bulkDelete(bulkDeleteDto: BulkDeleteDiscountDto): Promise<{
    deleted: number[];
    failed: { id: number; reason: string }[];
    summary: { total: number; success: number; failed: number };
  }> {
    const { ids } = bulkDeleteDto;

    try {
      const deleteResult = await this.prisma.discount.deleteMany({
        where: { discount_id: { in: ids } },
      });

      return {
        deleted: ids,
        failed: [],
        summary: {
          total: ids.length,
          success: ids.length,
          failed: 0,
        },
      };
    } catch (error) {
      return {
        deleted: [],
        failed: ids.map((id) => ({
          id,
          reason: `Lỗi khi xóa chương trình giảm giá: ${error.message}`,
        })),
        summary: {
          total: ids.length,
          success: 0,
          failed: ids.length,
        },
      };
    }
  }
}
