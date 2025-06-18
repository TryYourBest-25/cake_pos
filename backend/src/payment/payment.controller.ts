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
  Query,
  BadRequestException,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreateVNPayPaymentDto } from './dto/create-vnpay-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';
import { payment } from '../generated/prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ROLES } from '../auth/constants/roles.constant';

@ApiTags('payments')
@Controller('payments')
@ApiBearerAuth()
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new payment record - Chỉ MANAGER và STAFF',
  })
  @ApiBody({ type: CreatePaymentDto })
  @ApiResponse({
    status: 201,
    description: 'The payment has been successfully created.',
    type: CreatePaymentDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad Request (e.g., validation error, invalid order_id or payment_method_id)',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found (e.g., Order or PaymentMethod not found)',
  })
  async create(@Body() createPaymentDto: CreatePaymentDto): Promise<payment> {
    return this.paymentService.create(createPaymentDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF)
  @ApiOperation({
    summary:
      'Get all payments with pagination and optional order filter - Chỉ MANAGER và STAFF',
  })
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
  @ApiQuery({
    name: 'orderId',
    required: false,
    type: Number,
    description: 'Filter payments by a specific order ID',
  })
  @ApiResponse({ status: 200, description: 'Paginated list of payments' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query('orderId') orderId?: string,
  ): Promise<PaginatedResult<payment>> {
    let orderIdNum: number | undefined;
    if (orderId) {
      orderIdNum = parseInt(orderId, 10);
      if (isNaN(orderIdNum)) {
        throw new BadRequestException('ID đơn hàng không hợp lệ. Phải là số.');
      }
    }
    return this.paymentService.findAll(paginationDto, orderIdNum);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF)
  @ApiOperation({
    summary: 'Get a specific payment by ID - Chỉ MANAGER và STAFF',
  })
  @ApiParam({ name: 'id', description: 'Payment ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'The payment details',
    type: CreatePaymentDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<payment | null> {
    return this.paymentService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF)
  @ApiOperation({
    summary: 'Update an existing payment - Chỉ MANAGER và STAFF',
  })
  @ApiParam({ name: 'id', description: 'Payment ID', type: Number })
  @ApiBody({ type: UpdatePaymentDto })
  @ApiResponse({
    status: 200,
    description: 'The payment has been successfully updated.',
    type: CreatePaymentDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ): Promise<payment> {
    return this.paymentService.update(id, updatePaymentDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a payment by ID - Chỉ MANAGER' })
  @ApiParam({ name: 'id', description: 'Payment ID', type: Number })
  @ApiResponse({
    status: 204,
    description: 'The payment has been successfully deleted.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.paymentService.remove(id);
  }

  // ============= VNPAY ENDPOINTS =============

  @Post('vnpay/create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF, ROLES.CUSTOMER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create VNPay payment URL - Tất cả role' })
  @ApiBody({ type: CreateVNPayPaymentDto })
  @ApiResponse({
    status: 200,
    description: 'VNPay payment URL created successfully',
    schema: { type: 'object', properties: { paymentUrl: { type: 'string' } } },
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async createVNPayPayment(
    @Body() createVNPayPaymentDto: CreateVNPayPaymentDto,
    @Req() req: Request,
  ): Promise<{ paymentUrl: string }> {
    const { orderId, orderInfo, returnUrl } = createVNPayPaymentDto;
    const ipAddr = req.ip || req.socket.remoteAddress || '127.0.0.1';

    const paymentUrl = await this.paymentService.createVNPayPaymentUrl(
      orderId,
      orderInfo,
      returnUrl,
      ipAddr,
    );

    return { paymentUrl };
  }

  @Get('vnpay/callback')
  @ApiOperation({ summary: 'Handle VNPay payment callback - Public endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Payment callback processed successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid callback data' })
  async handleVNPayCallback(
    @Query() callbackData: any,
    @Res() res: Response,
  ): Promise<void> {
    const result = await this.paymentService.processVNPayCallback(callbackData);

    if (result.success) {
      // Redirect to success page hoặc trả về JSON response
      res.redirect(
        `${process.env.POS_URL || 'http://localhost:3001'}/payment/success?orderId=${result.payment?.order_id}`,
      );
    } else {
      // Redirect to failure page hoặc trả về error response
      res.redirect(
        `${process.env.POS_URL || 'http://localhost:3001'}/payment/failure?message=${encodeURIComponent(result.message)}`,
      );
    }
  }

  @Post('vnpay/webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle VNPay IPN webhook - Public endpoint' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  async handleVNPayWebhook(
    @Body() webhookData: any,
  ): Promise<{ RspCode: string; Message: string }> {
    try {
      const result =
        await this.paymentService.processVNPayCallback(webhookData);

      if (result.success) {
        return {
          RspCode: '00',
          Message: 'Confirm Success',
        };
      } else {
        return {
          RspCode: '01',
          Message: 'Order not found',
        };
      }
    } catch (error) {
      console.error('VNPay webhook error:', error);
      return {
        RspCode: '99',
        Message: 'Unknown error',
      };
    }
  }

  @Get('admin/test')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @ApiOperation({
    summary: 'Test endpoint for payment controller - Chỉ MANAGER',
  })
  @ApiResponse({ status: 200, description: 'Test successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  adminTest(): { message: string } {
    return { message: 'Payment controller is working!' };
  }

  @Get('payment-method/:paymentMethodId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.STAFF, ROLES.MANAGER)
  @ApiOperation({
    summary:
      'Lấy thanh toán theo phương thức thanh toán với pagination - STAFF/MANAGER',
  })
  @ApiParam({
    name: 'paymentMethodId',
    description: 'Payment Method ID',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách thanh toán theo phương thức',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async findByPaymentMethod(
    @Param('paymentMethodId', ParseIntPipe) paymentMethodId: number,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResult<payment>> {
    return this.paymentService.findByPaymentMethod(
      paymentMethodId,
      paginationDto,
    );
  }
}
