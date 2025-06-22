import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ProductSizeService } from './product-size.service';
import { CreateProductSizeDto } from './dto/create-product-size.dto';
import { UpdateProductSizeDto } from './dto/update-product-size.dto';
import { PaginationDto, PaginatedResult, PaginationMetadata } from '../common/dto/pagination.dto';
import { product_size, product_price } from '../generated/prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
  ApiExtraModels,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ROLES } from '../auth/constants/roles.constant';

@ApiTags('product-sizes')
@Controller('product-sizes')
@ApiBearerAuth()
@ApiExtraModels(PaginationMetadata)
export class ProductSizeController {
  constructor(private readonly productSizeService: ProductSizeService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tạo kích thước sản phẩm mới - Chỉ MANAGER' })
  @ApiBody({ type: CreateProductSizeDto })
  @ApiResponse({
    status: 201,
    description: 'Kích thước sản phẩm được tạo thành công',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 409, description: 'Conflict - Kích thước đã tồn tại' })
  async create(
    @Body() createProductSizeDto: CreateProductSizeDto,
  ): Promise<product_size> {
    return this.productSizeService.create(createProductSizeDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.STAFF, ROLES.MANAGER, ROLES.CUSTOMER)
  @ApiOperation({
    summary: 'Lấy danh sách kích thước sản phẩm với pagination - TẤT CẢ ROLES',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách kích thước sản phẩm',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { type: 'object' },
        },
        pagination: {
          $ref: '#/components/schemas/PaginationMetadata',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async findAll(
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResult<product_size>> {
    return this.productSizeService.findAll(paginationDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.STAFF, ROLES.MANAGER, ROLES.CUSTOMER)
  @ApiOperation({ summary: 'Lấy kích thước sản phẩm theo ID - TẤT CẢ ROLES' })
  @ApiParam({ name: 'id', description: 'Product Size ID', type: Number })
  @ApiResponse({ status: 200, description: 'Chi tiết kích thước sản phẩm' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'Kích thước sản phẩm không tồn tại',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<product_size | null> {
    return this.productSizeService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @ApiOperation({ summary: 'Cập nhật kích thước sản phẩm - Chỉ MANAGER' })
  @ApiParam({ name: 'id', description: 'Product Size ID', type: Number })
  @ApiBody({ type: UpdateProductSizeDto })
  @ApiResponse({
    status: 200,
    description: 'Kích thước sản phẩm được cập nhật thành công',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'Kích thước sản phẩm không tồn tại',
  })
  @ApiResponse({ status: 409, description: 'Conflict - Kích thước đã tồn tại' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductSizeDto: UpdateProductSizeDto,
  ): Promise<product_size> {
    return this.productSizeService.update(id, updateProductSizeDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa kích thước sản phẩm - Chỉ MANAGER' })
  @ApiParam({ name: 'id', description: 'Product Size ID', type: Number })
  @ApiResponse({
    status: 204,
    description: 'Kích thước sản phẩm được xóa thành công',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'Kích thước sản phẩm không tồn tại',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Kích thước đang được sử dụng',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.productSizeService.remove(id);
  }

  // Endpoint để lấy product prices theo size (quan hệ 1-nhiều)
  @Get(':id/product-prices')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.STAFF, ROLES.MANAGER, ROLES.CUSTOMER)
  @ApiOperation({
    summary: 'Lấy giá sản phẩm theo kích thước với pagination - TẤT CẢ ROLES',
  })
  @ApiParam({ name: 'id', description: 'Product Size ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Danh sách giá sản phẩm theo kích thước',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { type: 'object' },
        },
        pagination: {
          $ref: '#/components/schemas/PaginationMetadata',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'Kích thước sản phẩm không tồn tại',
  })
  async getProductPricesBySize(
    @Param('id', ParseIntPipe) id: number,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResult<product_price>> {
    return this.productSizeService.getProductPricesBySize(id, paginationDto);
  }

  @Get('test/ping')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Test product size controller - Chỉ MANAGER' })
  @ApiResponse({ status: 200, description: 'Test successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async test(): Promise<{ message: string }> {
    return { message: 'Product Size controller is working!' };
  }
}
