import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus, Query, BadRequestException } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { payment } from '../generated/prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';

@ApiTags('payments')
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new payment record' })
  @ApiBody({ type: CreatePaymentDto })
  @ApiResponse({ status: 201, description: 'The payment has been successfully created.', type: CreatePaymentDto }) // Nên trả về payment entity đầy đủ
  @ApiResponse({ status: 400, description: 'Bad Request (e.g., validation error, invalid order_id or payment_method_id)' })
  @ApiResponse({ status: 404, description: 'Not Found (e.g., Order or PaymentMethod not found)' })
  async create(@Body() createPaymentDto: CreatePaymentDto): Promise<payment> {
    return this.paymentService.create(createPaymentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all payments, optionally filtered by order ID' })
  @ApiQuery({ name: 'orderId', required: false, type: Number, description: 'Filter payments by a specific order ID' })
  @ApiResponse({ status: 200, description: 'List of payments', type: [CreatePaymentDto] }) // Nên trả về payment entity đầy đủ
  async findAll(@Query('orderId') orderId?: string): Promise<payment[]> {
    const orderIdNum = orderId ? parseInt(orderId, 10) : undefined;
    if (orderId && isNaN(orderIdNum)) {
        throw new BadRequestException('ID đơn hàng không hợp lệ. Phải là số.');
    }
    return this.paymentService.findAll(orderIdNum);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific payment by ID' })
  @ApiParam({ name: 'id', description: 'Payment ID', type: Number })
  @ApiResponse({ status: 200, description: 'The payment details', type: CreatePaymentDto }) // Nên trả về payment entity đầy đủ
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<payment | null> {
    return this.paymentService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing payment' })
  @ApiParam({ name: 'id', description: 'Payment ID', type: Number })
  @ApiBody({ type: UpdatePaymentDto })
  @ApiResponse({ status: 200, description: 'The payment has been successfully updated.', type: CreatePaymentDto }) // Nên trả về payment entity đầy đủ
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ): Promise<payment> {
    return this.paymentService.update(id, updatePaymentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // Hoặc 200 nếu trả về payment đã xóa
  @ApiOperation({ summary: 'Delete a payment by ID' })
  @ApiParam({ name: 'id', description: 'Payment ID', type: Number })
  @ApiResponse({ status: 204, description: 'The payment has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> { // Hoặc Promise<payment> nếu trả về payment đã xóa
    await this.paymentService.remove(id);
  }
} 