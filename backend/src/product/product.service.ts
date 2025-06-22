import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  Prisma,
  product,
  product_price,
  product_size,
  category,
} from '../generated/prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductPriceDto } from './dto/create-product-price.dto';
import { UpdateProductPriceDto } from './dto/update-product-price.dto';
import { BulkDeleteProductPriceDto } from './dto/bulk-delete-product-price.dto';
import { BulkDeleteProductDto } from './dto/bulk-delete-product.dto';
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto): Promise<product> {
    const { name, category_id, prices, ...restProductData } = createProductDto;

    // Kiểm tra Category tồn tại nếu category_id được cung cấp
    if (category_id) {
      const categoryExists = await this.prisma.category.findUnique({
        where: { category_id },
      });
      if (!categoryExists) {
        throw new NotFoundException(
          `Danh mục với ID ${category_id} không tồn tại.`,
        );
      }
    }

    const productData: Prisma.productCreateInput = {
      name,
      ...restProductData,
      category: { connect: { category_id } },
      product_price: {
        create: [], // Sẽ điền vào dưới đây
      },
    };

    for (const priceDto of prices) {
      const { size_id, size_data, price, is_active } = priceDto;
      let productSizeId: number;

      if (!size_id && !size_data) {
        throw new BadRequestException(
          'Each price must have either a size_id or size_data.',
        );
      }
      if (size_id && size_data) {
        throw new BadRequestException(
          'Each price cannot have both size_id and size_data. Provide one.',
        );
      }

      if (size_data) {
        const {
          name: sizeName,
          unit: sizeUnit,
          quantity: sizeQuantity,
          description: sizeDescription,
        } = size_data;
        try {
          const upsertedSize = await this.prisma.product_size.upsert({
            where: { unit_name: { unit: sizeUnit, name: sizeName } }, // Unique constraint
            create: {
              name: sizeName,
              unit: sizeUnit,
              quantity: sizeQuantity,
              description: sizeDescription,
            },
            update: { quantity: sizeQuantity, description: sizeDescription }, // Có thể không cần update gì nếu chỉ muốn connect or create
          });
          productSizeId = upsertedSize.size_id;
        } catch (e) {
          if (
            e instanceof Prisma.PrismaClientKnownRequestError &&
            e.code === 'P2002'
          ) {
            // Nếu upsert thất bại do unique constraint, thử tìm lại size đó
            const existingSize = await this.prisma.product_size.findUnique({
              where: { unit_name: { unit: sizeUnit, name: sizeName } },
            });
            if (!existingSize) {
              throw new InternalServerErrorException(
                `Thất bại khi tạo hoặc tìm kích thước sản phẩm: ${sizeName} (${sizeUnit}) sau khi thử upsert.`,
              );
            }
            productSizeId = existingSize.size_id;
          } else {
            console.error('Error upserting product size:', e);
            throw new InternalServerErrorException(
              'Lỗi khi xử lý dữ liệu kích thước sản phẩm.',
            );
          }
        }
      } else if (size_id) {
        const existingSize = await this.prisma.product_size.findUnique({
          where: { size_id },
        });
        if (!existingSize) {
          throw new NotFoundException(
            `Kích thước sản phẩm với ID ${size_id} không tồn tại.`,
          );
        }
        productSizeId = existingSize.size_id;
      } else {
        throw new BadRequestException(
          'Thiếu size_id hoặc size_data cho mục giá.',
        ); // Should not happen due to earlier checks
      }

      (
        productData.product_price!
          .create as Prisma.product_priceCreateWithoutProductInput[]
      ).push({
        price: price,
        is_active: is_active !== undefined ? is_active : true,
        product_size: {
          connect: { size_id: productSizeId },
        },
      });
    }

    try {
      return await this.prisma.product.create({
        data: productData,
        include: {
          category: true,
          product_price: { include: { product_size: true } },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (
          error.code === 'P2002' &&
          (error.meta?.target as string[])?.includes('name')
        ) {
          throw new ConflictException(`Sản phẩm với tên '${name}' đã tồn tại.`);
        }
        // Xử lý các lỗi P2002 khác từ product_price (product_id_size_id_key)
        if (
          error.code === 'P2002' &&
          (error.meta?.target as string[])?.includes('product_id') &&
          (error.meta?.target as string[])?.includes('size_id')
        ) {
          throw new ConflictException(
            'A product cannot have duplicate prices for the same size.',
          );
        }
      }
      console.error('Error creating product:', error);
      throw error;
    }
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<product>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        skip,
        take: limit,
        orderBy: { product_id: 'desc' },
        include: {
          category: true,
          product_price: {
            orderBy: { price: 'asc' },
          },
        },
      }),
      this.prisma.product.count(),
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

  async findOne(product_id: number): Promise<product | null> {
    const product = await this.prisma.product.findUnique({
      where: { product_id },
      include: {
        category: true,
        product_price: true,
      },
    });
    if (!product) {
      throw new NotFoundException(
        `Sản phẩm với ID ${product_id} không tồn tại`,
      );
    }
    return product;
  }

  async update(
    product_id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<product> {
    const { name, category_id, ...restProductData } = updateProductDto;

    const existingProduct = await this.prisma.product.findUnique({
      where: { product_id },
    });
    if (!existingProduct) {
      throw new NotFoundException(
        `Sản phẩm với ID ${product_id} không tồn tại.`,
      );
    }

    if (category_id) {
      const categoryExists = await this.prisma.category.findUnique({
        where: { category_id },
      });
      if (!categoryExists) {
        throw new NotFoundException(
          `Danh mục với ID ${category_id} không tồn tại.`,
        );
      }
    }

    const productUpdateData: Prisma.productUpdateInput = {
      ...restProductData,
      ...(name && { name }),
      ...(category_id && { category: { connect: { category_id } } }),
    };

    try {
      return await this.prisma.product.update({
        where: { product_id },
        data: productUpdateData,
        include: {
          category: true,
          product_price: { include: { product_size: true } },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (
          error.code === 'P2002' &&
          (error.meta?.target as string[])?.includes('name')
        ) {
          throw new ConflictException(`Sản phẩm với tên '${name}' đã tồn tại.`);
        }
        if (error.code === 'P2025') {
          throw new NotFoundException(
            `Product with ID ${product_id} not found during update operation.`,
          );
        }
      }
      console.error(`Error updating product ${product_id}:`, error);
      throw error;
    }
  }

  async bulkDelete(bulkDeleteDto: BulkDeleteProductDto): Promise<{
    deleted: number[];
    failed: { id: number; reason: string }[];
    summary: { total: number; success: number; failed: number };
  }> {
    const { ids } = bulkDeleteDto;

    try {
      await this.prisma.$transaction(async (tx) => {
        // Xóa tất cả product_price trước
        await tx.product_price.deleteMany({
          where: { product_id: { in: ids } },
        });

        // Xóa tất cả sản phẩm
        await tx.product.deleteMany({
          where: { product_id: { in: ids } },
        });
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
          reason: `Lỗi khi xóa sản phẩm: ${error.message}`,
        })),
        summary: {
          total: ids.length,
          success: 0,
          failed: ids.length,
        },
      };
    }
  }

  async remove(product_id: number): Promise<product> {
    const product = await this.prisma.product.findUnique({
      where: { product_id },
    });
    if (!product) {
      throw new NotFoundException(
        `Sản phẩm với ID ${product_id} không tồn tại.`,
      );
    }

    // Xóa các product_price liên quan trước, sau đó xóa product
    // Điều này cần thiết nếu không có onDelete: Cascade trong schema
    // Prisma sẽ thực hiện các thao tác này trong một transaction
    try {
      return await this.prisma.$transaction(async (tx) => {
        await tx.product_price.deleteMany({ where: { product_id } });
        return tx.product.delete({
          where: { product_id },
          include: { product_price: true }, // Trả về product đã xóa cùng các price (lúc này sẽ rỗng)
        });
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(
            `Product with ID ${product_id} not found during delete operation.`,
          );
        }
        // P2003: Foreign key constraint failed on the field: `...` (ví dụ nếu product_price vẫn còn liên kết đến order_item)
        // Hiện tại product_price có liên kết với order_product, nên nếu không xóa order_product trước thì không xóa được product_price.
        // Logic này đang giả định là việc xóa product_price không bị cản trở bởi order_product.
        // Nếu có, cần phải xử lý phức tạp hơn hoặc không cho phép xóa product nếu đã có order.
        if (error.code === 'P2003') {
          throw new ConflictException(
            `Product with ID ${product_id} cannot be deleted as its associated prices might be in use (e.g., in orders).`,
          );
        }
      }
      console.error(`Error removing product ${product_id}:`, error);
      throw error;
    }
  }

  async findByCategory(
    category_id: number,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<product>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where: { category_id },
        skip,
        take: limit,
        orderBy: { product_id: 'desc' },
        include: {
          category: true,
          product_price: {
            orderBy: { price: 'asc' },
          },
        },
      }),
      this.prisma.product.count({
        where: { category_id },
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

  async findByCategoryWithActivePrices(
    category_id: number,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<product>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    // Điều kiện where cho category
    const categoryCondition = { category_id: category_id }; // Lấy sản phẩm thuộc danh mục

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where: {
          ...categoryCondition,
          product_price: {
            some: {
              is_active: true, // Có ít nhất 1 product_price active
            },
          },
        },
        skip,
        take: limit,
        orderBy: { product_id: 'desc' },
      }),
      this.prisma.product.count({
        where: {
          ...categoryCondition,
          product_price: {
            some: {
              is_active: true,
            },
          },
        },
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

  // === PRODUCT PRICE MANAGEMENT METHODS ===

  async createProductPrice(
    createProductPriceDto: CreateProductPriceDto,
  ): Promise<product_price> {
    const { product_id, size_id, size_data, price, is_active } =
      createProductPriceDto;

    // Kiểm tra product tồn tại
    const product = await this.prisma.product.findUnique({
      where: { product_id },
    });
    if (!product) {
      throw new NotFoundException(
        `Sản phẩm với ID ${product_id} không tồn tại.`,
      );
    }

    if (!size_id && !size_data) {
      throw new BadRequestException('Phải cung cấp size_id hoặc size_data.');
    }
    if (size_id && size_data) {
      throw new BadRequestException(
        'Không thể cung cấp cả size_id và size_data.',
      );
    }

    let productSizeId: number;

    if (size_data) {
      const {
        name: sizeName,
        unit: sizeUnit,
        quantity: sizeQuantity,
        description: sizeDescription,
      } = size_data;
      try {
        const upsertedSize = await this.prisma.product_size.upsert({
          where: { unit_name: { unit: sizeUnit, name: sizeName } },
          create: {
            name: sizeName,
            unit: sizeUnit,
            quantity: sizeQuantity,
            description: sizeDescription,
          },
          update: { quantity: sizeQuantity, description: sizeDescription },
        });
        productSizeId = upsertedSize.size_id;
      } catch (e) {
        if (
          e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === 'P2002'
        ) {
          const existingSize = await this.prisma.product_size.findUnique({
            where: { unit_name: { unit: sizeUnit, name: sizeName } },
          });
          if (!existingSize) {
            throw new InternalServerErrorException(
              `Thất bại khi tạo hoặc tìm kích thước sản phẩm: ${sizeName} (${sizeUnit}).`,
            );
          }
          productSizeId = existingSize.size_id;
        } else {
          console.error('Error upserting product size:', e);
          throw new InternalServerErrorException(
            'Lỗi khi xử lý dữ liệu kích thước sản phẩm.',
          );
        }
      }
    } else if (size_id) {
      const existingSize = await this.prisma.product_size.findUnique({
        where: { size_id },
      });
      if (!existingSize) {
        throw new NotFoundException(
          `Kích thước sản phẩm với ID ${size_id} không tồn tại.`,
        );
      }
      productSizeId = existingSize.size_id;
    } else {
      throw new BadRequestException('Thiếu size_id hoặc size_data.');
    }

    try {
      return await this.prisma.product_price.create({
        data: {
          product_id,
          size_id: productSizeId,
          price,
          is_active: is_active !== undefined ? is_active : true,
        },
        include: {
          product: true,
          product_size: true,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (
          error.code === 'P2002' &&
          (error.meta?.target as string[])?.includes('product_id') &&
          (error.meta?.target as string[])?.includes('size_id')
        ) {
          throw new ConflictException('Sản phẩm đã có giá cho kích thước này.');
        }
      }
      console.error('Error creating product price:', error);
      throw error;
    }
  }

  async updateProductPrice(
    priceId: number,
    updateProductPriceDto: UpdateProductPriceDto,
  ): Promise<product_price> {
    const existingPrice = await this.prisma.product_price.findUnique({
      where: { product_price_id: priceId },
    });

    if (!existingPrice) {
      throw new NotFoundException(
        `Giá sản phẩm với ID ${priceId} không tồn tại.`,
      );
    }

    try {
      return await this.prisma.product_price.update({
        where: { product_price_id: priceId },
        data: updateProductPriceDto,
        include: {
          product: true,
          product_size: true,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(
            `Giá sản phẩm với ID ${priceId} không tồn tại.`,
          );
        }
      }
      console.error(`Error updating product price ${priceId}:`, error);
      throw error;
    }
  }

  async removeProductPrice(priceId: number): Promise<product_price> {
    const existingPrice = await this.prisma.product_price.findUnique({
      where: { product_price_id: priceId },
    });

    if (!existingPrice) {
      throw new NotFoundException(
        `Giá sản phẩm với ID ${priceId} không tồn tại.`,
      );
    }

    try {
      return await this.prisma.product_price.delete({
        where: { product_price_id: priceId },
        include: {
          product: true,
          product_size: true,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(
            `Giá sản phẩm với ID ${priceId} không tồn tại.`,
          );
        }
        if (error.code === 'P2003') {
          throw new ConflictException(
            `Giá sản phẩm với ID ${priceId} không thể xóa vì đang được sử dụng trong đơn hàng.`,
          );
        }
      }
      console.error(`Error removing product price ${priceId}:`, error);
      throw error;
    }
  }

  async bulkDeleteProductPrices(
    bulkDeleteDto: BulkDeleteProductPriceDto,
  ): Promise<{
    deleted: number[];
    failed: { id: number; reason: string }[];
    summary: { total: number; success: number; failed: number };
  }> {
    const { ids } = bulkDeleteDto;
    const deleted: number[] = [];
    const failed: { id: number; reason: string }[] = [];

    for (const priceId of ids) {
      try {
        await this.removeProductPrice(priceId);
        deleted.push(priceId);
      } catch (error) {
        const reason =
          error instanceof Error ? error.message : 'Lỗi không xác định';
        failed.push({ id: priceId, reason });
      }
    }

    return {
      deleted,
      failed,
      summary: {
        total: ids.length,
        success: deleted.length,
        failed: failed.length,
      },
    };
  }

  async getProductPrices(productId: number): Promise<product_price[]> {
    const product = await this.prisma.product.findUnique({
      where: { product_id: productId },
    });

    if (!product) {
      throw new NotFoundException(
        `Sản phẩm với ID ${productId} không tồn tại.`,
      );
    }

    return this.prisma.product_price.findMany({
      where: { product_id: productId },
      include: {
        product_size: true,
      },
      orderBy: [
        { is_active: 'desc' }, // Active prices first
        { product_size: { name: 'asc' } }, // Then by size name
      ],
    });
  }
}
