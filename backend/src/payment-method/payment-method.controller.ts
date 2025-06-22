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
import { PaymentMethodService } from './payment-method.service';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { PaginationDto, PaginatedResult, PaginationMetadata } from '../common/dto/pagination.dto';
import { payment_method } from '../generated/prisma/client';
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

@ApiTags('payment-methods')
@Controller('payment-methods')
@ApiBearerAuth()
@ApiExtraModels(PaginationMetadata)
export class PaymentMethodController {
  constructor(private readonly paymentMethodService: PaymentMethodService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new payment method - Chỉ MANAGER' })
  @ApiBody({ type: CreatePaymentMethodDto })
  @ApiResponse({
    status: 201,
    description: 'Payment method created successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict (e.g., name already exists)',
  })
  async create(
    @Body() createDto: CreatePaymentMethodDto,
  ): Promise<payment_method> {
    return this.paymentMethodService.create(createDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF, ROLES.CUSTOMER)
  @ApiOperation({
    summary: 'Get all payment methods with pagination - Tất cả role',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of payment methods',
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
  async findAll(
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResult<payment_method>> {
    return this.paymentMethodService.findAll(paginationDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF, ROLES.CUSTOMER)
  @ApiOperation({ summary: 'Get a payment method by ID - Tất cả role' })
  @ApiParam({ name: 'id', description: 'Payment Method ID', type: Number })
  @ApiResponse({ status: 200, description: 'The payment method' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Payment method not found' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<payment_method> {
    return this.paymentMethodService.findOne(id);
  }

  @Get('by-name/:name')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF, ROLES.CUSTOMER)
  @ApiOperation({ summary: 'Get a payment method by its name - Tất cả role' })
  @ApiParam({
    name: 'name',
    description: 'Payment method name (e.g., Tiền mặt)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'The payment method or null if not found',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Payment method not found' })
  async findByName(
    @Param('name') name: string,
  ): Promise<payment_method | null> {
    return this.paymentMethodService.findByName(name);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @ApiOperation({ summary: 'Update a payment method by ID - Chỉ MANAGER' })
  @ApiParam({ name: 'id', description: 'Payment Method ID', type: Number })
  @ApiBody({ type: UpdatePaymentMethodDto })
  @ApiResponse({
    status: 200,
    description: 'Payment method updated successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Payment method not found' })
  @ApiResponse({
    status: 409,
    description: 'Conflict (e.g., name already exists)',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdatePaymentMethodDto,
  ): Promise<payment_method> {
    return this.paymentMethodService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a payment method by ID - Chỉ MANAGER' })
  @ApiParam({ name: 'id', description: 'Payment Method ID', type: Number })
  @ApiResponse({
    status: 204,
    description: 'Payment method deleted successfully.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Payment method not found' })
  @ApiResponse({
    status: 409,
    description: 'Conflict (cannot delete if used by payments)',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.paymentMethodService.remove(id);
  }
}
