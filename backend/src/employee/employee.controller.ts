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
  UseGuards,
} from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { BulkDeleteEmployeeDto } from './dto/bulk-delete-employee.dto';
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';
import { employee } from '../generated/prisma/client';
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
import { LockAccountDto } from '../account/dto/lock-account.dto';
import { UpdateAccountDto } from '../account/dto/update-account.dto';

@ApiTags('employees')
@Controller('employees')
@ApiBearerAuth()
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new employee - Chỉ MANAGER' })
  @ApiBody({ type: CreateEmployeeDto })
  @ApiResponse({ status: 201, description: 'Employee created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 409, description: 'Conflict (email already exists)' })
  async create(
    @Body() createEmployeeDto: CreateEmployeeDto,
  ): Promise<employee> {
    return this.employeeService.create(createEmployeeDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF)
  @ApiOperation({
    summary: 'Get all employees with pagination - MANAGER và STAFF',
  })
  @ApiResponse({ status: 200, description: 'Paginated list of employees' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async findAll(
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResult<employee>> {
    return this.employeeService.findAll(paginationDto);
  }

  @Get('email/:email') // Endpoint ví dụ để tìm theo email
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @ApiOperation({ summary: 'Find employee by email - Chỉ MANAGER' })
  @ApiParam({ name: 'email', description: 'Employee email', type: String })
  @ApiResponse({ status: 200, description: 'Employee details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  async findByEmail(@Param('email') email: string): Promise<employee | null> {
    return this.employeeService.findByEmail(email);
  }

  @Delete('bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk delete employees - Chỉ MANAGER' })
  @ApiBody({ type: BulkDeleteEmployeeDto })
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
  async bulkDelete(@Body() bulkDeleteDto: BulkDeleteEmployeeDto): Promise<{
    deleted: number[];
    failed: { id: number; reason: string }[];
    summary: { total: number; success: number; failed: number };
  }> {
    return this.employeeService.bulkDelete(bulkDeleteDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF)
  @ApiOperation({ summary: 'Get employee by ID - MANAGER và STAFF' })
  @ApiParam({ name: 'id', description: 'Employee ID', type: Number })
  @ApiResponse({ status: 200, description: 'Employee details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<employee | null> {
    return this.employeeService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @ApiOperation({ summary: 'Update employee - Chỉ MANAGER' })
  @ApiParam({ name: 'id', description: 'Employee ID', type: Number })
  @ApiBody({ type: UpdateEmployeeDto })
  @ApiResponse({ status: 200, description: 'Employee updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  @ApiResponse({ status: 409, description: 'Conflict (email already exists)' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ): Promise<employee> {
    return this.employeeService.update(id, updateEmployeeDto);
  }

  @Patch(':id/account/lock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @ApiOperation({
    summary: 'Khóa/mở khóa tài khoản employee - Chỉ MANAGER',
    description: 'Thay đổi trạng thái khóa của tài khoản employee',
  })
  @ApiParam({ name: 'id', description: 'Employee ID', type: Number })
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
  @ApiResponse({ status: 404, description: 'Employee not found' })
  async lockEmployeeAccount(
    @Param('id', ParseIntPipe) employeeId: number,
    @Body() lockAccountDto: LockAccountDto,
  ) {
    return this.employeeService.lockEmployeeAccount(
      employeeId,
      lockAccountDto.is_locked,
    );
  }

  @Patch(':id/account/:accountId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @ApiOperation({
    summary: 'Cập nhật thông tin tài khoản của employee - Chỉ MANAGER',
    description: 'Cập nhật username, password, và trạng thái tài khoản của employee',
  })
  @ApiParam({ name: 'id', description: 'Employee ID', type: Number })
  @ApiParam({ name: 'accountId', description: 'Account ID', type: Number })
  @ApiBody({ type: UpdateAccountDto })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật thông tin tài khoản thành công',
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Account không thuộc về Employee này' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Employee hoặc Account không tồn tại' })
  @ApiResponse({ status: 409, description: 'Conflict - Username đã tồn tại' })
  async updateEmployeeAccount(
    @Param('id', ParseIntPipe) employeeId: number,
    @Param('accountId', ParseIntPipe) accountId: number,
    @Body() updateAccountDto: UpdateAccountDto,
  ) {
    return this.employeeService.updateEmployeeAccount(
      employeeId,
      accountId,
      updateAccountDto,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete employee - Chỉ MANAGER' })
  @ApiParam({ name: 'id', description: 'Employee ID', type: Number })
  @ApiResponse({ status: 204, description: 'Employee deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.employeeService.remove(id);
  }

  @Get('test/ping')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Test employee controller - Chỉ MANAGER' })
  @ApiResponse({ status: 200, description: 'Test successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async test(): Promise<{ message: string }> {
    return { message: 'Employee controller is working!' };
  }
}
