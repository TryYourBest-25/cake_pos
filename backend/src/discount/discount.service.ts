import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { discount, Prisma, coupon as CouponModel } from '../generated/prisma/client';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class DiscountService {
  constructor(private prisma: PrismaService) {}

  async create(createDiscountDto: CreateDiscountDto): Promise<discount> {
    const { coupon_code, valid_from, valid_until, ...restOfDto } = createDiscountDto;

    const existingDiscountWithCouponCode = await this.prisma.discount.findFirst({
        where: {
            coupon: {
                coupon: coupon_code
            }
        }
    });

    if (existingDiscountWithCouponCode) {
        throw new ConflictException(`Coupon code '${coupon_code}' is already associated with another discount.`);
    }
    
    const data: Prisma.discountCreateInput = {
      ...restOfDto,
      discount_value: new Decimal(createDiscountDto.discount_value),
      min_required_order_value: createDiscountDto.min_required_order_value,
      max_discount_amount: createDiscountDto.max_discount_amount,
      is_active: createDiscountDto.is_active !== undefined ? createDiscountDto.is_active : true,
      ...(valid_from && { valid_from: new Date(valid_from) }),
      valid_until: new Date(valid_until),
      coupon: {
        connectOrCreate: {
          where: { coupon: coupon_code },
          create: { coupon: coupon_code },
        },
      },
    };

    try {
      return await this.prisma.discount.create({ 
        data,
        include: { coupon: true }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002' && error.meta?.target) {
          const targetFields = error.meta.target as string[];
          if (targetFields.includes('name') && createDiscountDto.name) {
            throw new ConflictException(`Giảm giá với tên '${createDiscountDto.name}' đã tồn tại.`);
          }
          throw new ConflictException(`A unique constraint violation occurred on: ${targetFields.join(', ')}.`);
        }
      }
      console.error("Error creating discount:", error);
      throw error;
    }
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResult<discount>> {
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

  async findOne(discount_id: number, include?: Prisma.discountInclude): Promise<discount | null> {
    const discountDetails = await this.prisma.discount.findUnique({
      where: { discount_id },
      include: include || { coupon: true },
    });
    if (!discountDetails) {
      throw new NotFoundException(`Giảm giá với ID ${discount_id} không tồn tại`);
    }
    return discountDetails;
  }

  async findByCouponCode(couponCode: string, include?: Prisma.discountInclude): Promise<discount | null> {
    const couponRecord = await this.prisma.coupon.findUnique({
      where: { coupon: couponCode },
      include: { 
        discount: { 
          include: include?.coupon ? { coupon: true } : undefined 
        } 
      }, 
    });

    if (!couponRecord || !couponRecord.discount) {
      throw new NotFoundException(`Giảm giá liên kết với mã coupon '${couponCode}' không tồn tại.`);
    }
    return couponRecord.discount as (discount & { coupon?: CouponModel | null }) ;
  }

  async update(discount_id: number, updateDiscountDto: UpdateDiscountDto): Promise<discount> {
    const { coupon_code, valid_from, valid_until, discount_value, ...restOfData } = updateDiscountDto;

    const existingDiscount = await this.prisma.discount.findUnique({
        where: { discount_id },
        include: { coupon: true }
    });

    if (!existingDiscount) {
        throw new NotFoundException(`Giảm giá với ID ${discount_id} không tồn tại.`);
    }

    let couponData: Prisma.couponUpdateOneRequiredWithoutDiscountNestedInput | undefined = undefined;
    if (coupon_code && coupon_code !== existingDiscount.coupon?.coupon) {
        const conflictingDiscountWithNewCoupon = await this.prisma.discount.findFirst({
            where: {
                coupon: { coupon: coupon_code },
                NOT: { discount_id }
            }
        });
        if (conflictingDiscountWithNewCoupon) {
            throw new ConflictException(`Coupon code '${coupon_code}' is already in use by another discount.`);
        }
        
        couponData = {
            connectOrCreate: {
                where: { coupon: coupon_code },
                create: { coupon: coupon_code }
            }
        };
    }

    const data: Prisma.discountUpdateInput = {
      ...restOfData,
      ...(discount_value !== undefined && { discount_value: new Decimal(discount_value) }),
      ...(valid_from && { valid_from: new Date(valid_from) }),
      ...(valid_until && { valid_until: new Date(valid_until) }),
      ...(couponData && { coupon: couponData }),
    };
    
    try {
      return await this.prisma.discount.update({
        where: { discount_id },
        data,
        include: { coupon: true }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Giảm giá với ID ${discount_id} không tồn tại.`);
        }
        if (error.code === 'P2002' && error.meta?.target) {
            const targetFields = error.meta.target as string[];
            let fieldName = targetFields.join(', ');
            if (targetFields.includes('name') && updateDiscountDto.name) fieldName = `name '${updateDiscountDto.name}'`;
            else if (targetFields.includes('coupon_id') && coupon_code) fieldName = `coupon code '${coupon_code}' association`;
            
            throw new ConflictException(`The value for ${fieldName} is already in use or a conflict occurred.`);
        }
      }
      console.error(`Error updating discount ${discount_id}:`, error);
      throw error;
    }
  }

  async remove(discount_id: number): Promise<discount> {
    const discountToDelete = await this.prisma.discount.findUnique({
        where: { discount_id },
        select: { coupon_id: true }
    });

    if (!discountToDelete) {
        throw new NotFoundException(`Giảm giá với ID ${discount_id} không tồn tại`);
    }

    try {
      const deletedDiscount = await this.prisma.discount.delete({
        where: { discount_id },
      });
      
      if (discountToDelete.coupon_id) {
        const otherDiscountsWithThisCoupon = await this.prisma.discount.count({
            where: { coupon_id: discountToDelete.coupon_id }
        });
        if (otherDiscountsWithThisCoupon === 0) {
            try {
                await this.prisma.coupon.delete({
                    where: { coupon_id: discountToDelete.coupon_id }
                });
                console.log(`Coupon with ID ${discountToDelete.coupon_id} also deleted as it was no longer in use.`);
            } catch (couponDeleteError) {
                console.error(`Failed to delete orphaned coupon with ID ${discountToDelete.coupon_id}:`, couponDeleteError);
            }
        }
      }
      return deletedDiscount;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Giảm giá với ID ${discount_id} không tồn tại`);
        }
        if (error.code === 'P2003') { 
            throw new ConflictException(`Discount with ID ${discount_id} cannot be deleted as it is currently associated with other records (e.g., orders).`);
        }
      }
      console.error(`Error removing discount ${discount_id}:`, error);
      throw error;
    }
  }
} 