import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { DiscountService } from './discount.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { discount } from '../generated/prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger'; // For Swagger documentation

@ApiTags('discounts')
@Controller('discounts')
export class DiscountController {
  constructor(private readonly discountService: DiscountService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new discount' })
  @ApiResponse({ status: 201, description: 'The discount has been successfully created.', type: CreateDiscountDto }) // Nên trả về DTO hoặc Entity đầy đủ
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 409, description: 'Conflict. Discount name or coupon code already exists.' })
  async create(@Body() createDiscountDto: CreateDiscountDto): Promise<discount> {
    return this.discountService.create(createDiscountDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all discounts' })
  @ApiResponse({ status: 200, description: 'Return all discounts.' }) // Thêm type cho mảng discount
  async findAll(
    @Query('skip', new ParseIntPipe({ optional: true })) skip?: number,
    @Query('take', new ParseIntPipe({ optional: true })) take?: number,
    // Thêm các query params khác nếu cần cho việc filter hoặc orderBy
  ): Promise<discount[]> {
    return this.discountService.findAll({ skip, take });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a discount by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the discount', type: Number })
  @ApiResponse({ status: 200, description: 'Return the discount.'}) // Thêm type
  @ApiResponse({ status: 404, description: 'Discount not found.' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<discount | null> {
    return this.discountService.findOne(id);
  }

  @Get('coupon/:couponCode')
  @ApiOperation({ summary: 'Get a discount by Coupon Code' })
  @ApiParam({ name: 'couponCode', description: 'The coupon code associated with the discount', type: String })
  @ApiResponse({ status: 200, description: 'Return the discount.' }) // Thêm type
  @ApiResponse({ status: 404, description: 'Discount with this coupon code not found.' })
  async findByCouponCode(@Param('couponCode') couponCode: string): Promise<discount | null> {
    return this.discountService.findByCouponCode(couponCode);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a discount by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the discount to update', type: Number })
  @ApiResponse({ status: 200, description: 'The discount has been successfully updated.'}) // Thêm type
  @ApiResponse({ status: 404, description: 'Discount not found.' })
  @ApiResponse({ status: 409, description: 'Conflict. Coupon code or other unique constraint violation.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDiscountDto: UpdateDiscountDto,
  ): Promise<discount> {
    return this.discountService.update(id, updateDiscountDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a discount by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the discount to delete', type: Number })
  @ApiResponse({ status: 204, description: 'The discount has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Discount not found.' })
  @ApiResponse({ status: 409, description: 'Conflict. Discount is associated with other records.'})
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.discountService.remove(id);
  }
} 