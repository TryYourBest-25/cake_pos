import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { coupon, Prisma } from '../generated/prisma/client'; // Adjusted import path based on user feedback
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

@Injectable()
export class CouponService {
  constructor(private prisma: PrismaService) {}

  async create(createCouponDto: CreateCouponDto): Promise<coupon> {
    try {
      return await this.prisma.coupon.create({
        data: createCouponDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') { // Unique constraint violation (field: coupon)
          throw new ConflictException(`Mã coupon '${createCouponDto.coupon}' đã tồn tại.`);
        }
      }
      throw error;
    }
  }

  async findAll(): Promise<coupon[]> {
    return this.prisma.coupon.findMany();
  }

  async findOne(id: number): Promise<coupon | null> {
    const coupon = await this.prisma.coupon.findUnique({
      where: { coupon_id: id },
    });
    if (!coupon) {
      throw new NotFoundException(`Coupon với ID ${id} không tồn tại`);
    }
    return coupon;
  }

  async update(id: number, updateCouponDto: UpdateCouponDto): Promise<coupon> {
    try {
      return await this.prisma.coupon.update({
        where: { coupon_id: id },
        data: updateCouponDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') { // Record to update not found
          throw new NotFoundException(`Coupon với ID ${id} không tồn tại`);
        }
        if (error.code === 'P2002' && updateCouponDto.coupon) { // Unique constraint violation for coupon code
          throw new ConflictException(`Mã coupon '${updateCouponDto.coupon}' đã tồn tại.`);
        }
      }
      throw error;
    }
  }

  async remove(id: number): Promise<coupon> {
    try {
      return await this.prisma.coupon.delete({
        where: { coupon_id: id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') { // Record to delete not found
          throw new NotFoundException(`Coupon với ID ${id} không tồn tại`);
        }
        // P2003: Foreign key constraint failed. This coupon might be linked to a discount.
        if (error.code === 'P2003') {
            throw new ConflictException(`Coupon with ID ${id} cannot be deleted as it is currently associated with a discount.`);
        }
      }
      throw error;
    }
  }
} 