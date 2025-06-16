import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { membership_type, Prisma } from '../generated/prisma/client';
import { CreateMembershipTypeDto } from './dto/create-membership-type.dto';
import { UpdateMembershipTypeDto } from './dto/update-membership-type.dto';
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';
import { Decimal } from '@prisma/client/runtime/library'; // Import Decimal

@Injectable()
export class MembershipTypeService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateMembershipTypeDto): Promise<membership_type> {
    const { type, discount_value, required_point, valid_until, ...rest } = createDto;

    const data: Prisma.membership_typeCreateInput = {
      ...rest,
      type,
      discount_value: new Decimal(discount_value), // Chuyển đổi sang Decimal
      required_point,
      ...(valid_until && { valid_until: new Date(valid_until) }),
    };

    try {
      return await this.prisma.membership_type.create({
        data,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        if ((error.meta?.target as string[])?.includes('type')) {
          throw new ConflictException(`Loại thành viên '${type}' đã tồn tại.`);
        }
        throw new ConflictException('A unique constraint violation occurred.');
      }
      throw error;
    }
  }

  async findAll(paginationDto: PaginationDto, includeCustomers: boolean = false): Promise<PaginatedResult<membership_type>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.membership_type.findMany({
        skip,
        take: limit,
        orderBy: { required_point: 'desc' },
      }),
      this.prisma.membership_type.count(),
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

  async findOne(id: number, includeCustomers: boolean = false): Promise<membership_type | null> {
    const membershipType = await this.prisma.membership_type.findUnique({
      where: { membership_type_id: id },
      include: { customer: includeCustomers },
    });
    if (!membershipType) {
      throw new NotFoundException(`Loại thành viên với ID ${id} không tồn tại.`);
    }
    return membershipType;
  }
  
  async findByType(type: string, includeCustomers: boolean = false): Promise<membership_type | null> {
    const membershipType = await this.prisma.membership_type.findUnique({
      where: { type: type },
      include: { customer: includeCustomers },
    });
    if (!membershipType) {
      throw new NotFoundException(`Loại thành viên với loại '${type}' không tồn tại.`);
    }
    return membershipType;
  }

  async update(id: number, updateDto: UpdateMembershipTypeDto): Promise<membership_type> {
    await this.findOne(id); // Check for existence
    const { type, discount_value, valid_until, ...rest } = updateDto;

    const data: Prisma.membership_typeUpdateInput = { ...rest };
    if (type) data.type = type;
    if (discount_value !== undefined) data.discount_value = new Decimal(discount_value);
    if (valid_until) data.valid_until = new Date(valid_until);
    // Nếu valid_until được gửi là null, thì cũng cần xử lý để xóa ngày hết hạn
    else if (updateDto.hasOwnProperty('valid_until') && valid_until === null) {
        data.valid_until = null;
    }


    try {
      return await this.prisma.membership_type.update({
        where: { membership_type_id: id },
        data,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        if ((error.meta?.target as string[])?.includes('type') && type) {
          throw new ConflictException(`Loại thành viên '${type}' đã tồn tại.`);
        }
        throw new ConflictException('A unique constraint violation occurred during update.');
      }
      throw error;
    }
  }

  async remove(id: number): Promise<membership_type> {
    await this.findOne(id); // Check for existence
    try {
      return await this.prisma.membership_type.delete({
        where: { membership_type_id: id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        throw new ConflictException(
          `Cannot delete membership type with ID ${id} as it is associated with existing customers.`,
        );
      }
      throw error;
    }
  }
} 