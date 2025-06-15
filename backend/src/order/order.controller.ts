import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus, Query, BadRequestException, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto, OrderStatusEnum } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { order, Prisma } from '../generated/prisma/client'; // Import Prisma namespace for types
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ROLES } from '../auth/constants/roles.constant';

@ApiTags('orders')
@Controller('orders')
@ApiBearerAuth()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF, ROLES.CUSTOMER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new order - Tất cả role' })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({ status: 201, description: 'Order created successfully.' /*, type: OrderEntity (nếu có) */ })
  @ApiResponse({ status: 400, description: 'Bad Request (e.g., validation error, no products)' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not Found (e.g., employee, customer, product_price, or discount not found)' })
  @ApiResponse({ status: 422, description: 'Unprocessable Entity (e.g., product not active, discount not valid)' })
  async create(@Body() createOrderDto: CreateOrderDto): Promise<order> {
    return this.orderService.create(createOrderDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF)
  @ApiOperation({ summary: 'Get all orders with optional filtering and pagination - Chỉ MANAGER và STAFF' })
  @ApiQuery({ name: 'skip', required: false, type: Number, description: 'Number of records to skip' })
  @ApiQuery({ name: 'take', required: false, type: Number, description: 'Number of records to take' })
  @ApiQuery({ name: 'customerId', required: false, type: Number, description: 'Filter by customer ID' })
  @ApiQuery({ name: 'employeeId', required: false, type: Number, description: 'Filter by employee ID' })
  @ApiQuery({ name: 'status', required: false, enum: OrderStatusEnum, description: 'Filter by order status' })
  // Thêm các query params khác cho filter (ví dụ: date range) nếu cần
  @ApiResponse({ status: 200, description: 'List of orders' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  async findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('customerId') customerId?: string,
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: OrderStatusEnum,
    // @Query('orderBy') orderBy?: string, // Cần parse orderBy phức tạp hơn
  ): Promise<order[]> {
    const where: Prisma.orderWhereInput = {};
    if (customerId) where.customer_id = parseInt(customerId, 10);
    if (employeeId) where.employee_id = parseInt(employeeId, 10);
    if (status) where.status = status;

    const params = {
      skip: skip ? parseInt(skip, 10) : undefined,
      take: take ? parseInt(take, 10) : undefined,
      where,
      // orderBy: orderBy ? JSON.parse(orderBy) : undefined, // Cần cẩn thận với JSON.parse từ query
    };
    return this.orderService.findAll(params);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF, ROLES.CUSTOMER)
  @ApiOperation({ summary: 'Get a specific order by ID - Tất cả role (CUSTOMER chỉ xem order của mình)' })
  @ApiParam({ name: 'id', description: 'Order ID', type: Number })
  @ApiResponse({ status: 200, description: 'The order details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<order> {
    return this.orderService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF)
  @ApiOperation({ summary: 'Update an existing order - Chỉ MANAGER và STAFF' })
  @ApiParam({ name: 'id', description: 'Order ID', type: Number })
  @ApiBody({ type: UpdateOrderDto })
  @ApiResponse({ status: 200, description: 'Order updated successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Order not found or related entity not found during update' })
  @ApiResponse({ status: 422, description: 'Unprocessable Entity (e.g., product not active, discount not valid during update)' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<order> {
    return this.orderService.update(id, updateOrderDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @HttpCode(HttpStatus.OK) // Trả về order đã xóa thay vì 204 No Content
  @ApiOperation({ summary: 'Delete an order by ID - Chỉ MANAGER' })
  @ApiParam({ name: 'id', description: 'Order ID', type: Number })
  @ApiResponse({ status: 200, description: 'Order deleted successfully (returns the deleted order).' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  // @ApiResponse({ status: 400, description: 'Cannot delete completed order (tùy business logic)' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<order> {
    return this.orderService.remove(id);
  }
} 