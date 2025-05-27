import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { product } from '../generated/prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new product with prices and sizes' })
  @ApiResponse({ status: 201, description: 'The product has been successfully created.' }) // Nên trả về DTO hoặc Entity đầy đủ
  @ApiResponse({ status: 400, description: 'Bad Request (e.g., validation error, missing size info)' })
  @ApiResponse({ status: 404, description: 'Category or ProductSize not found' })
  @ApiResponse({ status: 409, description: 'Conflict (e.g., product name exists, duplicate price for same size)' })
  async create(@Body() createProductDto: CreateProductDto): Promise<product> {
    return this.productService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products with their active prices and sizes' })
  @ApiQuery({ name: 'skip', required: false, type: Number, description: 'Number of records to skip' })
  @ApiQuery({ name: 'take', required: false, type: Number, description: 'Number of records to take' })
  // Thêm các query params khác cho filter (name, category_id) và orderBy nếu cần
  @ApiResponse({ status: 200, description: 'Return all products.' }) // Thêm type cho mảng product
  async findAll(
    @Query('skip', new ParseIntPipe({ optional: true })) skip?: number,
    @Query('take', new ParseIntPipe({ optional: true })) take?: number,
    // @Query('name') name?: string, // Ví dụ filter theo tên
    // @Query('categoryId', new ParseIntPipe({ optional: true })) categoryId?: number, // Ví dụ filter theo category
  ): Promise<product[]> {
    // const where: Prisma.productWhereInput = {};
    // if (name) where.name = { contains: name, mode: 'insensitive' };
    // if (categoryId) where.category_id = categoryId;
    return this.productService.findAll({ skip, take /*, where */ });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by ID with its active prices and sizes' })
  @ApiParam({ name: 'id', description: 'The ID of the product', type: Number })
  @ApiResponse({ status: 200, description: 'Return the product.' }) // Thêm type
  @ApiResponse({ status: 404, description: 'Product not found.' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<product | null> {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product by ID (can include updating prices/sizes)' })
  @ApiParam({ name: 'id', description: 'The ID of the product to update', type: Number })
  @ApiResponse({ status: 200, description: 'The product has been successfully updated.' }) // Thêm type
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'Product, Category or ProductSize not found' })
  @ApiResponse({ status: 409, description: 'Conflict (e.g., product name exists, duplicate price for same size)' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<product> {
    return this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a product by ID (also deletes its associated prices)' })
  @ApiParam({ name: 'id', description: 'The ID of the product to delete', type: Number })
  @ApiResponse({ status: 204, description: 'The product has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  @ApiResponse({ status: 409, description: 'Conflict (e.g., product prices are in use in orders)'})
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.productService.remove(id);
    // Trả về void vì HttpCode là NO_CONTENT
  }
} 