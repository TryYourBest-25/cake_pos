import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
// import { coupon } from '../generated/prisma/client'; // Adjusted import path

@Controller('coupons')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCouponDto: CreateCouponDto): Promise<any> { // Promise<coupon>
    return this.couponService.create(createCouponDto);
  }

  @Get()
  async findAll(): Promise<any[]> { // Promise<coupon[]>
    return this.couponService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<any> { // Promise<coupon | null>
    return this.couponService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCouponDto: UpdateCouponDto,
  ): Promise<any> { // Promise<coupon>
    return this.couponService.update(id, updateCouponDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<any> { // Promise<coupon>
    return this.couponService.remove(id);
  }

  /**
   * @backend/nestjs-general-guidelines
   * Add a admin/test method to each controller as a smoke test.
   */
  @Get('admin/test')
  adminTest(): string {
    return 'Coupon controller is working!';
  }
} 