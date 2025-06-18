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
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { BulkDeleteCustomerDto } from './dto/bulk-delete-customer.dto';
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';
import { customer } from '../generated/prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ROLES } from '../auth/constants/roles.constant';
import { AccountService } from '../account/account.service';
import { CreateAccountDto } from '../account/dto/create-account.dto';
import { UpdateAccountDto } from '../account/dto/update-account.dto';
import { LockAccountDto } from '../account/dto/lock-account.dto';

@ApiTags('customers')
@Controller('customers')
@ApiBearerAuth()
export class CustomerController {
  constructor(
    private readonly customerService: CustomerService,
    private readonly accountService: AccountService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Tạo khách hàng mới - Chỉ MANAGER và STAFF',
    description:
      'Hệ thống sẽ tự động gán loại thành viên có điểm yêu cầu thấp nhất và đặt điểm hiện tại bằng điểm yêu cầu đó',
  })
  @ApiBody({ type: CreateCustomerDto })
  @ApiResponse({
    status: 201,
    description:
      'Khách hàng được tạo thành công với membership type và points tự động',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 409, description: 'Conflict (phone already exists)' })
  async create(
    @Body() createCustomerDto: CreateCustomerDto,
  ): Promise<customer> {
    return this.customerService.create(createCustomerDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF)
  @ApiOperation({
    summary: 'Get all customers with pagination - Chỉ MANAGER và STAFF',
  })
  @ApiResponse({ status: 200, description: 'Paginated list of customers' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async findAll(
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResult<customer>> {
    return this.customerService.findAll(paginationDto);
  }

  @Delete('bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk delete customers - Chỉ MANAGER' })
  @ApiBody({ type: BulkDeleteCustomerDto })
  @ApiResponse({
    status: 200,
    description: 'Bulk delete completed with results',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async bulkDelete(@Body() bulkDeleteDto: BulkDeleteCustomerDto): Promise<{
    deleted: number[];
    failed: { id: number; reason: string }[];
    summary: { total: number; success: number; failed: number };
  }> {
    return this.customerService.bulkDelete(bulkDeleteDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF, ROLES.CUSTOMER)
  @ApiOperation({
    summary:
      'Get customer by ID - Tất cả role (CUSTOMER chỉ xem thông tin của mình)',
  })
  @ApiParam({ name: 'id', description: 'Customer ID', type: Number })
  @ApiResponse({ status: 200, description: 'Customer details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<customer | null> {
    return this.customerService.findOne(id);
  }

  @Get('phone/:phone')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF)
  @ApiOperation({ summary: 'Find customer by phone - Chỉ MANAGER và STAFF' })
  @ApiParam({
    name: 'phone',
    description: 'Customer phone number',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Customer details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async findByPhone(@Param('phone') phone: string): Promise<customer | null> {
    return this.customerService.findByPhone(phone);
  }

  // Endpoints tài khoản cho customer
  @Get(':id/account')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF, ROLES.CUSTOMER)
  @ApiOperation({
    summary:
      'Lấy thông tin tài khoản của khách hàng - Tất cả role (CUSTOMER chỉ xem tài khoản của mình)',
    description: 'Trả về thông tin tài khoản đã liên kết với khách hàng này',
  })
  @ApiParam({ name: 'id', description: 'Customer ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Thông tin tài khoản của khách hàng',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'Customer not found hoặc không có tài khoản liên kết',
  })
  async getCustomerAccount(@Param('id', ParseIntPipe) customerId: number) {
    return this.customerService.getCustomerAccount(customerId);
  }

  @Post(':id/account')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Tạo tài khoản mới cho khách hàng - Chỉ MANAGER và STAFF',
    description: 'Tạo tài khoản mới và liên kết với khách hàng hiện tại',
  })
  @ApiParam({ name: 'id', description: 'Customer ID', type: Number })
  @ApiBody({ type: CreateAccountDto })
  @ApiResponse({
    status: 201,
    description: 'Tạo tài khoản thành công cho khách hàng',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  @ApiResponse({
    status: 409,
    description:
      'Conflict (username already exists hoặc customer đã có tài khoản)',
  })
  async createCustomerAccount(
    @Param('id', ParseIntPipe) customerId: number,
    @Body() createAccountDto: CreateAccountDto,
  ) {
    return this.customerService.createCustomerAccount(
      customerId,
      createAccountDto,
    );
  }

  @Patch(':id/account')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF, ROLES.CUSTOMER)
  @ApiOperation({
    summary:
      'Cập nhật tài khoản của khách hàng - Tất cả role (CUSTOMER chỉ update tài khoản của mình)',
    description: 'Cập nhật thông tin tài khoản đã liên kết với khách hàng này',
  })
  @ApiParam({ name: 'id', description: 'Customer ID', type: Number })
  @ApiBody({ type: UpdateAccountDto })
  @ApiResponse({ status: 200, description: 'Cập nhật tài khoản thành công' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'Customer not found hoặc không có tài khoản liên kết',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict (username already exists)',
  })
  async updateCustomerAccount(
    @Param('id', ParseIntPipe) customerId: number,
    @Body() updateAccountDto: UpdateAccountDto,
  ) {
    return this.customerService.updateCustomerAccount(
      customerId,
      updateAccountDto,
    );
  }

  @Patch(':id/account/lock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @ApiOperation({
    summary: 'Khóa/mở khóa tài khoản khách hàng - Chỉ MANAGER',
    description: 'Thay đổi trạng thái khóa của tài khoản khách hàng',
  })
  @ApiParam({ name: 'id', description: 'Customer ID', type: Number })
  @ApiBody({ type: LockAccountDto })
  @ApiResponse({
    status: 200,
    description: 'Thay đổi trạng thái khóa tài khoản thành công',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'Customer not found hoặc không có tài khoản liên kết',
  })
  async lockCustomerAccount(
    @Param('id', ParseIntPipe) customerId: number,
    @Body() lockAccountDto: LockAccountDto,
  ) {
    return this.customerService.lockCustomerAccount(
      customerId,
      lockAccountDto.is_locked,
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF, ROLES.CUSTOMER)
  @ApiOperation({
    summary:
      'Cập nhật thông tin khách hàng - Tất cả role (CUSTOMER chỉ update thông tin của mình)',
    description:
      'Không thể cập nhật membership_type_id và current_points. Các trường này được quản lý tự động bởi hệ thống.',
  })
  @ApiParam({ name: 'id', description: 'Customer ID', type: Number })
  @ApiBody({ type: UpdateCustomerDto })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật thông tin khách hàng thành công',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  @ApiResponse({ status: 409, description: 'Conflict (phone already exists)' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ): Promise<customer> {
    return this.customerService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete customer - Chỉ MANAGER' })
  @ApiParam({ name: 'id', description: 'Customer ID', type: Number })
  @ApiResponse({ status: 204, description: 'Customer deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.customerService.remove(id);
  }

  @Get('test/ping')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Test customer controller - Chỉ MANAGER' })
  @ApiResponse({ status: 200, description: 'Test successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async test(): Promise<{ message: string }> {
    return { message: 'Customer controller is working!' };
  }

  @Get('membership-type/:membershipTypeId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.STAFF, ROLES.MANAGER)
  @ApiOperation({
    summary:
      'Lấy khách hàng theo loại thành viên với pagination - STAFF/MANAGER',
  })
  @ApiParam({
    name: 'membershipTypeId',
    description: 'Membership Type ID',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách khách hàng theo loại thành viên',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async findByMembershipType(
    @Param('membershipTypeId', ParseIntPipe) membershipTypeId: number,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResult<customer>> {
    return this.customerService.findByMembershipType(
      membershipTypeId,
      paginationDto,
    );
  }
}
