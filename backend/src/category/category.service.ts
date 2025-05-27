import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { category, Prisma } from '../generated/prisma/client'; // Adjusted import path
// PrismaClientKnownRequestError should be available via Prisma namespace
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

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
          throw new ConflictException(`Category with name '${createCategoryDto.name}' already exists.`);
        }
      }
      throw error;
    }
  }

  async findAll(): Promise<category[]> {
    return this.prisma.category.findMany();
  }

  async findOne(id: number): Promise<category | null> {
    const category = await this.prisma.category.findUnique({
      where: { category_id: id },
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
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
          throw new NotFoundException(`Category with ID ${id} not found`);
        }
        if (error.code === 'P2002' && updateCategoryDto.name) { // Unique constraint violation for name
          throw new ConflictException(`Category with name '${updateCategoryDto.name}' already exists.`);
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
          throw new NotFoundException(`Category with ID ${id} not found`);
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