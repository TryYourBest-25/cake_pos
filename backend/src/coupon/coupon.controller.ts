import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus, UseGuards, Query } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ROLES } from '../auth/constants/roles.constant';
// import { coupon } from '../generated/prisma/client'; // Adjusted import path

@ApiTags('coupons')
@Controller('coupons')
@ApiBearerAuth()
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new coupon - Chỉ MANAGER' })
  @ApiBody({ type: CreateCouponDto })
  @ApiResponse({ status: 201, description: 'Coupon created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 409, description: 'Conflict (coupon code already exists)' })
  async create(@Body() createCouponDto: CreateCouponDto): Promise<any> { // Promise<coupon>
    return this.couponService.create(createCouponDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF, ROLES.CUSTOMER)
  @ApiOperation({ summary: 'Get all coupons with pagination - Tất cả role' })
  @ApiResponse({ status: 200, description: 'Paginated list of coupons' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Query() paginationDto: PaginationDto): Promise<PaginatedResult<any>> {
    return this.couponService.findAll(paginationDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF, ROLES.CUSTOMER)
  @ApiOperation({ summary: 'Get coupon by ID - Tất cả role' })
  @ApiParam({ name: 'id', description: 'Coupon ID', type: Number })
  @ApiResponse({ status: 200, description: 'Coupon details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Coupon not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<any> { // Promise<coupon | null>
    return this.couponService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @ApiOperation({ summary: 'Update coupon - Chỉ MANAGER' })
  @ApiParam({ name: 'id', description: 'Coupon ID', type: Number })
  @ApiBody({ type: UpdateCouponDto })
  @ApiResponse({ status: 200, description: 'Coupon updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Coupon not found' })
  @ApiResponse({ status: 409, description: 'Conflict (coupon code already exists)' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCouponDto: UpdateCouponDto,
  ): Promise<any> { // Promise<coupon>
    return this.couponService.update(id, updateCouponDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete coupon - Chỉ MANAGER' })
  @ApiParam({ name: 'id', description: 'Coupon ID', type: Number })
  @ApiResponse({ status: 200, description: 'Coupon deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Coupon not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<any> { // Promise<coupon>
    return this.couponService.remove(id);
  }

  /**
   * @backend/nestjs-general-guidelines
   * Add a admin/test method to each controller as a smoke test.
   */
  @Get('admin/test')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @ApiOperation({ summary: 'Test coupon controller - Chỉ MANAGER' })
  @ApiResponse({ status: 200, description: 'Test successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  adminTest(): { message: string } {
    return { message: 'Coupon controller is working!' };
  }
} 