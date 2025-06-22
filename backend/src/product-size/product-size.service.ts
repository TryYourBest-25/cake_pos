import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  product_size,
  product_price,
  Prisma,
} from '../generated/prisma/client';
import { CreateProductSizeDto } from './dto/create-product-size.dto';
import { UpdateProductSizeDto } from './dto/update-product-size.dto';
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';

@Injectable()
export class ProductSizeService {
  constructor(private prisma: PrismaService) {}

  async create(
    createProductSizeDto: CreateProductSizeDto,
  ): Promise<product_size> {
    try {
      return await this.prisma.product_size.create({
        data: createProductSizeDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            `Kích thước sản phẩm với tên '${createProductSizeDto.name}' và đơn vị '${createProductSizeDto.unit}' đã tồn tại.`,
          );
        }
      }
      throw error;
    }
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<product_size>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.product_size.findMany({
        skip,
        take: limit,
        orderBy: { size_id: 'desc' },
      }),
      this.prisma.product_size.count(),
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

  async findOne(size_id: number): Promise<product_size | null> {
    const productSize = await this.prisma.product_size.findUnique({
      where: { size_id },
    });
    if (!productSize) {
      throw new NotFoundException(
        `Kích thước sản phẩm với ID ${size_id} không tồn tại`,
      );
    }
    return productSize;
  }

  async update(
    size_id: number,
    updateProductSizeDto: UpdateProductSizeDto,
  ): Promise<product_size> {
    try {
      return await this.prisma.product_size.update({
        where: { size_id },
        data: updateProductSizeDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(
            `Kích thước sản phẩm với ID ${size_id} không tồn tại`,
          );
        }
        if (error.code === 'P2002') {
          throw new ConflictException(
            `Kích thước sản phẩm với tên '${updateProductSizeDto.name}' và đơn vị '${updateProductSizeDto.unit}' đã tồn tại.`,
          );
        }
      }
      throw error;
    }
  }

  async remove(size_id: number): Promise<product_size> {
    try {
      return await this.prisma.product_size.delete({
        where: { size_id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(
            `Kích thước sản phẩm với ID ${size_id} không tồn tại`,
          );
        }
        if (error.code === 'P2003') {
          throw new ConflictException(
            `Kích thước sản phẩm với ID ${size_id} không thể xóa vì đang được sử dụng trong giá sản phẩm.`,
          );
        }
      }
      throw error;
    }
  }

  // Method để lấy danh sách product_price theo size (quan hệ 1-nhiều)
  async getProductPricesBySize(
    size_id: number,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<product_price>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    // Kiểm tra size có tồn tại không
    await this.findOne(size_id);

    const [data, total] = await Promise.all([
      this.prisma.product_price.findMany({
        where: { size_id },
        skip,
        take: limit,
        orderBy: { product_price_id: 'desc' },
      }),
      this.prisma.product_price.count({
        where: { size_id },
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
}
