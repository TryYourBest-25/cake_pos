import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { category, Prisma } from '../generated/prisma/client'; // Adjusted import path
// PrismaClientKnownRequestError should be available via Prisma namespace
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<category> {
    try {
      return await this.prisma.category.create({
        data: createCategoryDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) { // Use Prisma.PrismaClientKnownRequestError
        if (error.code === 'P2002') { // Unique constraint violation
          throw new ConflictException(`Danh mục với tên '${createCategoryDto.name}' đã tồn tại.`);
        }
      }
      throw error;
    }
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResult<category>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.category.findMany({
        skip,
        take: limit,
        orderBy: { category_id: 'desc' },
      }),
      this.prisma.category.count(),
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

  async findOne(id: number): Promise<category | null> {
    const category = await this.prisma.category.findUnique({
      where: { category_id: id },
    });
    if (!category) {
      throw new NotFoundException(`Danh mục với ID ${id} không tồn tại`);
    }
    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<category> {
    try {
      return await this.prisma.category.update({
        where: { category_id: id },
        data: updateCategoryDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) { // Use Prisma.PrismaClientKnownRequestError
        if (error.code === 'P2025') { // Record to update not found
          throw new NotFoundException(`Danh mục với ID ${id} không tồn tại`);
        }
        if (error.code === 'P2002' && updateCategoryDto.name) { // Unique constraint violation for name
          throw new ConflictException(`Danh mục với tên '${updateCategoryDto.name}' đã tồn tại.`);
        }
      }
      throw error;
    }
  }

  async remove(id: number): Promise<category> {
    try {
      return await this.prisma.category.delete({
        where: { category_id: id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) { // Use Prisma.PrismaClientKnownRequestError
        if (error.code === 'P2025') { // Record to delete not found
          throw new NotFoundException(`Danh mục với ID ${id} không tồn tại`);
        }
        // P2003 for foreign key constraints if category is in use by products
        if (error.code === 'P2003') {
            throw new ConflictException(`Category with ID ${id} cannot be deleted because it is associated with existing products.`);
        }
      }
      throw error;
    }
  }
} 