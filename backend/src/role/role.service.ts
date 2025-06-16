import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';
import { role } from '../generated/prisma/client';

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) {}

  async create(createRoleDto: CreateRoleDto): Promise<role> {
    return this.prisma.role.create({
      data: createRoleDto,
    });
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResult<role>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.role.findMany({
        skip,
        take: limit,
        orderBy: { role_id: 'asc' },
      }),
      this.prisma.role.count(),
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

  async findOne(id: number): Promise<role | null> {
    return this.prisma.role.findUnique({
      where: { role_id: id },
    });
  }

  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<role> {
    return this.prisma.role.update({
      where: { role_id: id },
      data: updateRoleDto,
    });
  }

  async remove(id: number): Promise<role> {
    return this.prisma.role.delete({
      where: { role_id: id },
    });
  }
} 