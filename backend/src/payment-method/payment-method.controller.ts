import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { PaymentMethodService } from './payment-method.service';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { payment_method } from '../generated/prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('payment-methods')
@Controller('payment-methods')
export class PaymentMethodController {
  constructor(private readonly paymentMethodService: PaymentMethodService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new payment method' })
  @ApiBody({ type: CreatePaymentMethodDto })
  @ApiResponse({ status: 201, description: 'Payment method created successfully.', type: CreatePaymentMethodDto })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 409, description: 'Conflict (e.g., name already exists)' })
  async create(@Body() createDto: CreatePaymentMethodDto): Promise<payment_method> {
    return this.paymentMethodService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all payment methods' })
  @ApiResponse({ status: 200, description: 'List of payment methods', type: [CreatePaymentMethodDto] })
  async findAll(): Promise<payment_method[]> {
    return this.paymentMethodService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a payment method by ID' })
  @ApiParam({ name: 'id', description: 'Payment Method ID', type: Number })
  @ApiResponse({ status: 200, description: 'The payment method', type: CreatePaymentMethodDto })
  @ApiResponse({ status: 404, description: 'Payment method not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<payment_method> {
    return this.paymentMethodService.findOne(id);
  }

  @Get('by-name/:name')
  @ApiOperation({ summary: 'Get a payment method by its name' })
  @ApiParam({ name: 'name', description: 'Payment method name (e.g., Tiền mặt)', type: String })
  @ApiResponse({ status: 200, description: 'The payment method or null if not found', type: CreatePaymentMethodDto })
  @ApiResponse({ status: 404, description: 'This status may not be hit if null is a valid successful response for \'not found\'.' })
  async findByName(@Param('name') name: string): Promise<payment_method | null> {
    return this.paymentMethodService.findByName(name);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a payment method by ID' })
  @ApiParam({ name: 'id', description: 'Payment Method ID', type: Number })
  @ApiBody({ type: UpdatePaymentMethodDto })
  @ApiResponse({ status: 200, description: 'Payment method updated successfully.', type: CreatePaymentMethodDto })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'Payment method not found' })
  @ApiResponse({ status: 409, description: 'Conflict (e.g., name already exists)' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdatePaymentMethodDto,
  ): Promise<payment_method> {
    return this.paymentMethodService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a payment method by ID' })
  @ApiParam({ name: 'id', description: 'Payment Method ID', type: Number })
  @ApiResponse({ status: 204, description: 'Payment method deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Payment method not found' })
  @ApiResponse({ status: 409, description: 'Conflict (cannot delete if used by payments)' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.paymentMethodService.remove(id);
  }
} 