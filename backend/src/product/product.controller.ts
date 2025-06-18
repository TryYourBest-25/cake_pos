import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductPriceDto } from './dto/create-product-price.dto';
import { UpdateProductPriceDto } from './dto/update-product-price.dto';
import { BulkDeleteProductPriceDto } from './dto/bulk-delete-product-price.dto';
import { BulkDeleteProductDto } from './dto/bulk-delete-product.dto';
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';
import { product, product_price } from '../generated/prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ROLES } from '../auth/constants/roles.constant';

@ApiTags('products')
@Controller('products')
@ApiBearerAuth()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary:
      'Create a new product with prices and sizes - Chỉ MANAGER và STAFF',
  })
  @ApiResponse({
    status: 201,
    description: 'The product has been successfully created.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request (e.g., validation error, missing size info)',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'Category or ProductSize not found',
  })
  @ApiResponse({
    status: 409,
    description:
      'Conflict (e.g., product name exists, duplicate price for same size)',
  })
  async create(@Body() createProductDto: CreateProductDto): Promise<product> {
    return this.productService.create(createProductDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF, ROLES.CUSTOMER)
  @ApiOperation({ summary: 'Get all products with pagination - Tất cả role' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  @ApiResponse({ status: 200, description: 'Paginated list of products' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResult<product>> {
    return this.productService.findAll(paginationDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF, ROLES.CUSTOMER)
  @ApiOperation({
    summary: 'Get a product by ID with its prices - Tất cả role',
    description:
      'Lấy chi tiết sản phẩm bao gồm danh sách giá (không bao gồm thông tin kích thước)',
  })
  @ApiParam({ name: 'id', description: 'The ID of the product', type: Number })
  @ApiResponse({ status: 200, description: 'Return the product with prices.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<product | null> {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF)
  @ApiOperation({
    summary: 'Update product information only - Chỉ MANAGER và STAFF',
    description:
      'Chỉ cập nhật thông tin sản phẩm. Để quản lý giá sản phẩm, sử dụng các endpoint riêng biệt.',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the product to update',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'The product has been successfully updated.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Product or Category not found' })
  @ApiResponse({
    status: 409,
    description: 'Conflict (e.g., product name exists)',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<product> {
    return this.productService.update(id, updateProductDto);
  }

  @Delete('bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Xóa nhiều sản phẩm - Chỉ MANAGER',
    description:
      'Xóa nhiều sản phẩm cùng lúc. Các sản phẩm có giá đang được sử dụng trong đơn hàng sẽ không thể xóa.',
  })
  @ApiBody({ type: BulkDeleteProductDto })
  @ApiResponse({
    status: 200,
    description: 'Bulk delete hoàn thành với kết quả chi tiết',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async bulkDeleteProducts(
    @Body() bulkDeleteDto: BulkDeleteProductDto,
  ): Promise<{
    deleted: number[];
    failed: { id: number; reason: string }[];
    summary: { total: number; success: number; failed: number };
  }> {
    return this.productService.bulkDelete(bulkDeleteDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a product by ID - Chỉ MANAGER' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the product to delete',
    type: Number,
  })
  @ApiResponse({
    status: 204,
    description: 'The product has been successfully deleted.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  @ApiResponse({
    status: 409,
    description: 'Conflict (e.g., product prices are in use in orders)',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.productService.remove(id);
  }

  @Get('category/:categoryId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.STAFF, ROLES.MANAGER, ROLES.CUSTOMER)
  @ApiOperation({
    summary: 'Lấy sản phẩm theo danh mục với pagination - TẤT CẢ ROLES',
  })
  @ApiParam({ name: 'categoryId', description: 'Category ID', type: Number })
  @ApiResponse({ status: 200, description: 'Danh sách sản phẩm theo danh mục' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async findByCategory(
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResult<product>> {
    return this.productService.findByCategory(categoryId, paginationDto);
  }

  // === PRODUCT PRICE ENDPOINTS ===

  @Post('prices')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Tạo giá mới cho sản phẩm - Chỉ MANAGER và STAFF',
    description: 'Thêm giá mới cho sản phẩm với kích thước cụ thể',
  })
  @ApiBody({ type: CreateProductPriceDto })
  @ApiResponse({ status: 201, description: 'Giá sản phẩm được tạo thành công' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Product or ProductSize not found' })
  @ApiResponse({
    status: 409,
    description: 'Conflict (duplicate price for same size)',
  })
  async createProductPrice(
    @Body() createProductPriceDto: CreateProductPriceDto,
  ): Promise<product_price> {
    return this.productService.createProductPrice(createProductPriceDto);
  }

  @Patch('prices/:priceId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF)
  @ApiOperation({
    summary: 'Cập nhật giá sản phẩm - Chỉ MANAGER và STAFF',
    description: 'Cập nhật giá hoặc trạng thái của một giá sản phẩm cụ thể',
  })
  @ApiParam({
    name: 'priceId',
    description: 'ID của giá sản phẩm',
    type: Number,
  })
  @ApiBody({ type: UpdateProductPriceDto })
  @ApiResponse({
    status: 200,
    description: 'Giá sản phẩm được cập nhật thành công',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Product price not found' })
  async updateProductPrice(
    @Param('priceId', ParseIntPipe) priceId: number,
    @Body() updateProductPriceDto: UpdateProductPriceDto,
  ): Promise<product_price> {
    return this.productService.updateProductPrice(
      priceId,
      updateProductPriceDto,
    );
  }

  @Delete('prices/:priceId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Xóa giá sản phẩm - Chỉ MANAGER và STAFF',
    description: 'Xóa một giá sản phẩm cụ thể',
  })
  @ApiParam({
    name: 'priceId',
    description: 'ID của giá sản phẩm',
    type: Number,
  })
  @ApiResponse({ status: 204, description: 'Giá sản phẩm được xóa thành công' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Product price not found' })
  @ApiResponse({
    status: 409,
    description: 'Conflict (price is in use in orders)',
  })
  async removeProductPrice(
    @Param('priceId', ParseIntPipe) priceId: number,
  ): Promise<void> {
    await this.productService.removeProductPrice(priceId);
  }

  @Delete('prices/bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Xóa nhiều giá sản phẩm - Chỉ MANAGER và STAFF',
    description: 'Xóa nhiều giá sản phẩm cùng lúc',
  })
  @ApiBody({ type: BulkDeleteProductPriceDto })
  @ApiResponse({
    status: 200,
    description: 'Bulk delete hoàn thành với kết quả chi tiết',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async bulkDeleteProductPrices(
    @Body() bulkDeleteDto: BulkDeleteProductPriceDto,
  ): Promise<{
    deleted: number[];
    failed: { id: number; reason: string }[];
    summary: { total: number; success: number; failed: number };
  }> {
    return this.productService.bulkDeleteProductPrices(bulkDeleteDto);
  }

  @Get(':productId/prices')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF, ROLES.CUSTOMER)
  @ApiOperation({
    summary: 'Lấy danh sách giá của sản phẩm - Tất cả role',
    description: 'Lấy tất cả giá (active và inactive) của một sản phẩm cụ thể',
  })
  @ApiParam({ name: 'productId', description: 'ID của sản phẩm', type: Number })
  @ApiResponse({ status: 200, description: 'Danh sách giá của sản phẩm' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async getProductPrices(
    @Param('productId', ParseIntPipe) productId: number,
  ): Promise<product_price[]> {
    return this.productService.getProductPrices(productId);
  }
}
