import { Injectable, NotFoundException, ConflictException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, product, product_price, product_size, category } from '../generated/prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductPriceDto } from './dto/create-product-price.dto';
import { Decimal } from '@prisma/client/runtime/library';

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
        throw new NotFoundException(`Danh mục với ID ${category_id} không tồn tại.`);
      }
    }

    const productData: Prisma.productCreateInput = {
      name,
      ...restProductData,
      ...(category_id && { category: { connect: { category_id } } }),
      product_price: {
        create: [], // Sẽ điền vào dưới đây
      },
    };

    for (const priceDto of prices) {
      const { size_id, size_data, price, is_active } = priceDto;
      let productSizeId: number;

      if (!size_id && !size_data) {
        throw new BadRequestException('Each price must have either a size_id or size_data.');
      }
      if (size_id && size_data) {
        throw new BadRequestException('Each price cannot have both size_id and size_data. Provide one.');
      }

      if (size_data) {
        const { name: sizeName, unit: sizeUnit, quantity: sizeQuantity, description: sizeDescription } = size_data;
        try {
          const upsertedSize = await this.prisma.product_size.upsert({
            where: { unit_name: { unit: sizeUnit, name: sizeName } }, // Unique constraint
            create: { name: sizeName, unit: sizeUnit, quantity: sizeQuantity, description: sizeDescription },
            update: { quantity: sizeQuantity, description: sizeDescription }, // Có thể không cần update gì nếu chỉ muốn connect or create
          });
          productSizeId = upsertedSize.size_id;
        } catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
                 // Nếu upsert thất bại do unique constraint, thử tìm lại size đó
                const existingSize = await this.prisma.product_size.findUnique({
                    where: { unit_name: { unit: sizeUnit, name: sizeName } }
                });
                if (!existingSize) {
                    throw new InternalServerErrorException(`Thất bại khi tạo hoặc tìm kích thước sản phẩm: ${sizeName} (${sizeUnit}) sau khi thử upsert.`);
                }
                productSizeId = existingSize.size_id;
            } else {
                console.error("Error upserting product size:", e);
                throw new InternalServerErrorException('Lỗi khi xử lý dữ liệu kích thước sản phẩm.');
            }
        }
      } else if (size_id) {
        const existingSize = await this.prisma.product_size.findUnique({ where: { size_id } });
        if (!existingSize) {
          throw new NotFoundException(`Kích thước sản phẩm với ID ${size_id} không tồn tại.`);
        }
        productSizeId = existingSize.size_id;
      } else {
        throw new BadRequestException('Thiếu size_id hoặc size_data cho mục giá.'); // Should not happen due to earlier checks
      }

      (productData.product_price!.create as Prisma.product_priceCreateWithoutProductInput[]).push({
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
        if (error.code === 'P2002' && (error.meta?.target as string[])?.includes('name')) {
          throw new ConflictException(`Sản phẩm với tên '${name}' đã tồn tại.`);
        }
        // Xử lý các lỗi P2002 khác từ product_price (product_id_size_id_key)
        if (error.code === 'P2002' && (error.meta?.target as string[])?.includes('product_id') && (error.meta?.target as string[])?.includes('size_id')) {
            throw new ConflictException('A product cannot have duplicate prices for the same size.');
        }
      }
      console.error("Error creating product:", error);
      throw error;
    }
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.productWhereUniqueInput;
    where?: Prisma.productWhereInput;
    orderBy?: Prisma.productOrderByWithRelationInput;
  } = {}): Promise<product[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.product.findMany({
      skip, take, cursor, where, orderBy,
      include: {
        category: true,
        product_price: { 
          where: { is_active: true }, // Chỉ lấy giá active
          include: { product_size: true }, 
          orderBy: { product_size: { name: 'asc'} } // Sắp xếp giá theo tên size
        },
      },
    });
  }

  async findOne(product_id: number): Promise<product | null> {
    const product = await this.prisma.product.findUnique({
      where: { product_id },
      include: {
        category: true,
        product_price: {
          where: { is_active: true },
          include: { product_size: true },
          orderBy: { product_size: { name: 'asc'} }
        },
      },
    });
    if (!product) {
      throw new NotFoundException(`Sản phẩm với ID ${product_id} không tồn tại`);
    }
    return product;
  }

  async update(product_id: number, updateProductDto: UpdateProductDto): Promise<product> {
    const { name, category_id, prices, ...restProductData } = updateProductDto;

    const existingProduct = await this.prisma.product.findUnique({ where: { product_id } });
    if (!existingProduct) {
      throw new NotFoundException(`Sản phẩm với ID ${product_id} không tồn tại.`);
    }

    if (category_id) {
      const categoryExists = await this.prisma.category.findUnique({ where: { category_id } });
      if (!categoryExists) {
        throw new NotFoundException(`Danh mục với ID ${category_id} không tồn tại.`);
      }
    }

    const productUpdateData: Prisma.productUpdateInput = {
      ...restProductData,
      ...(name && { name }),
      ...(category_id && { category: { connect: { category_id } } }),
    };

    // Xử lý giá: Nếu prices được cung cấp, xóa giá cũ và tạo giá mới
    // Đây là cách tiếp cận đơn giản. Một cách phức tạp hơn là so sánh và cập nhật từng giá.
    if (prices && prices.length > 0) {
        // Tạo danh sách ProductPriceCreateWithoutProductInput mới
        const newPricesCreateInput: Prisma.product_priceCreateWithoutProductInput[] = [];
        for (const priceDto of prices) {
            const { size_id, size_data, price, is_active } = priceDto;
            let productSizeId: number;

            if (!size_id && !size_data) {
                throw new BadRequestException('Each price must have either a size_id or size_data.');
            }
            if (size_id && size_data) {
                throw new BadRequestException('Each price cannot have both size_id and size_data.');
            }

            if (size_data) {
                const { name: sizeName, unit: sizeUnit, quantity: sizeQuantity, description: sizeDescription } = size_data;
                 try {
                    const upsertedSize = await this.prisma.product_size.upsert({
                        where: { unit_name: { unit: sizeUnit, name: sizeName } },
                        create: { name: sizeName, unit: sizeUnit, quantity: sizeQuantity, description: sizeDescription },
                        update: { quantity: sizeQuantity, description: sizeDescription }, 
                    });
                    productSizeId = upsertedSize.size_id;
                } catch (e) {
                     if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
                        const existingSize = await this.prisma.product_size.findUnique({
                            where: { unit_name: { unit: sizeUnit, name: sizeName } }
                        });
                        if (!existingSize) {
                            throw new InternalServerErrorException(`Thất bại khi tạo hoặc tìm kích thước sản phẩm: ${sizeName} (${sizeUnit}) sau khi thử upsert.`);
                        }
                        productSizeId = existingSize.size_id;
                    } else {
                        console.error("Error upserting product size during update:", e);
                        throw new InternalServerErrorException('Error processing product size data during update.');
                    }
                }
            } else if (size_id) {
                const existingSize = await this.prisma.product_size.findUnique({ where: { size_id } });
                if (!existingSize) {
                    throw new NotFoundException(`Kích thước sản phẩm với ID ${size_id} không tồn tại.`);
                }
                productSizeId = existingSize.size_id;
            } else {
                throw new BadRequestException('Missing size_id or size_data for a price entry during update.');
            }

            newPricesCreateInput.push({
                price: price,
                is_active: is_active !== undefined ? is_active : true,
                product_size: { connect: { size_id: productSizeId } },
            });
        }
        // Gán vào productUpdateData để xóa cái cũ và tạo cái mới trong một transaction
        productUpdateData.product_price = {
            deleteMany: {}, // Xóa tất cả product_price hiện tại của sản phẩm này
            create: newPricesCreateInput, // Tạo mới các product_price từ DTO
        };
    } else if (prices === null || (Array.isArray(prices) && prices.length === 0)) {
        // Nếu prices là null hoặc mảng rỗng, xóa tất cả giá hiện có
        productUpdateData.product_price = {
            deleteMany: {},
        };
    }
    // Nếu `prices` là undefined, không làm gì cả, giữ nguyên giá hiện tại.

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
        if (error.code === 'P2002' && (error.meta?.target as string[])?.includes('name')) {
          throw new ConflictException(`Sản phẩm với tên '${name}' đã tồn tại.`);
        }
        if (error.code === 'P2025') {
            throw new NotFoundException(`Product with ID ${product_id} not found during update operation.`);
        }
         if (error.code === 'P2002' && (error.meta?.target as string[])?.includes('product_id') && (error.meta?.target as string[])?.includes('size_id')) {
            throw new ConflictException('During update, a product cannot have duplicate prices for the same size.');
        }
      }
      console.error(`Error updating product ${product_id}:`, error);
      throw error;
    }
  }

  async remove(product_id: number): Promise<product> {
    const product = await this.prisma.product.findUnique({ where: { product_id } });
    if (!product) {
      throw new NotFoundException(`Sản phẩm với ID ${product_id} không tồn tại.`);
    }

    // Xóa các product_price liên quan trước, sau đó xóa product
    // Điều này cần thiết nếu không có onDelete: Cascade trong schema
    // Prisma sẽ thực hiện các thao tác này trong một transaction
    try {
        return await this.prisma.$transaction(async (tx) => {
            await tx.product_price.deleteMany({ where: { product_id } });
            return tx.product.delete({ 
                where: { product_id },
                include: { product_price: true } // Trả về product đã xóa cùng các price (lúc này sẽ rỗng)
            });
        });
    } catch (error) {
         if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                 throw new NotFoundException(`Product with ID ${product_id} not found during delete operation.`);
            }
            // P2003: Foreign key constraint failed on the field: `...` (ví dụ nếu product_price vẫn còn liên kết đến order_item)
            // Hiện tại product_price có liên kết với order_product, nên nếu không xóa order_product trước thì không xóa được product_price.
            // Logic này đang giả định là việc xóa product_price không bị cản trở bởi order_product.
            // Nếu có, cần phải xử lý phức tạp hơn hoặc không cho phép xóa product nếu đã có order.
            if (error.code === 'P2003') {
                throw new ConflictException(`Product with ID ${product_id} cannot be deleted as its associated prices might be in use (e.g., in orders).`);
            }
        }
        console.error(`Error removing product ${product_id}:`, error);
        throw error;
    }
  }

  // Các phương thức tiện ích khác có thể thêm ở đây, ví dụ:
  // - addPriceToProduct(productId, createProductPriceDto)
  // - updatePriceForProduct(productId, priceId, updateProductPriceDto)
  // - removePriceFromProduct(productId, priceId)
} 