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
import { PaginationDto, PaginatedResult, PaginationMetadata } from '../common/dto/pagination.dto';
import { employee } from '../generated/prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
  ApiQuery,
  ApiExtraModels,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ROLES } from '../auth/constants/roles.constant';
import { LockAccountDto } from '../account/dto/lock-account.dto';
import { UpdateAccountDto } from '../account/dto/update-account.dto';

@ApiTags('employees')
@Controller('employees')
@ApiBearerAuth('JWT-auth')
@ApiExtraModels(PaginationMetadata)
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Tạo nhân viên mới - Chỉ MANAGER',
    description: 'Tạo nhân viên mới trong hệ thống với thông tin cá nhân và tài khoản đăng nhập tự động'
  })
  @ApiBody({ type: CreateEmployeeDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Nhân viên được tạo thành công',
    schema: {
      type: 'object',
      properties: {
        employee_id: { type: 'number', description: 'ID nhân viên' },
        full_name: { type: 'string', description: 'Họ và tên nhân viên' },
        email: { type: 'string', description: 'Email' },
        phone: { type: 'string', description: 'Số điện thoại' },
        address: { type: 'string', description: 'Địa chỉ', nullable: true },
        date_of_birth: { type: 'string', format: 'date', description: 'Ngày sinh', nullable: true },
        gender: { type: 'string', description: 'Giới tính', nullable: true },
        hire_date: { type: 'string', format: 'date', description: 'Ngày tuyển dụng' },
        position: { type: 'string', description: 'Chức vụ', nullable: true },
        salary: { type: 'number', description: 'Lương', nullable: true },
        is_active: { type: 'boolean', description: 'Trạng thái hoạt động' },
        created_at: { type: 'string', format: 'date-time', description: 'Thời gian tạo' }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Yêu cầu không hợp lệ - Dữ liệu đầu vào không đúng định dạng' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Chưa xác thực - Token không hợp lệ' 
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền truy cập - Chỉ MANAGER mới có thể tạo nhân viên',
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Xung đột dữ liệu - Email hoặc số điện thoại đã tồn tại' 
  })
  async create(
    @Body() createEmployeeDto: CreateEmployeeDto,
  ): Promise<employee> {
    return this.employeeService.create(createEmployeeDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF)
  @ApiOperation({
    summary: 'Lấy danh sách nhân viên với phân trang - MANAGER và STAFF',
    description: 'Trả về danh sách tất cả nhân viên trong hệ thống với thông tin cơ bản và trạng thái'
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Số trang (mặc định: 1)',
    example: 1
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Số lượng bản ghi trên mỗi trang (mặc định: 10)',
    example: 10
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách nhân viên được phân trang thành công',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              employee_id: { type: 'number' },
              full_name: { type: 'string' },
              email: { type: 'string' },
              phone: { type: 'string' },
              position: { type: 'string', nullable: true },
              hire_date: { type: 'string', format: 'date' },
              is_active: { type: 'boolean' },
              created_at: { type: 'string', format: 'date-time' },
              updated_at: { type: 'string', format: 'date-time' }
            }
          }
        },
        pagination: {
          $ref: '#/components/schemas/PaginationMetadata',
        }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Chưa xác thực - Token không hợp lệ' 
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền truy cập - Chỉ MANAGER và STAFF mới có thể xem danh sách nhân viên',
  })
  async findAll(
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResult<employee>> {
    return this.employeeService.findAll(paginationDto);
  }

  @Get('email/:email') // Endpoint ví dụ để tìm theo email
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @ApiOperation({ 
    summary: 'Tìm nhân viên theo email - Chỉ MANAGER',
    description: 'Tìm kiếm thông tin nhân viên dựa trên địa chỉ email để hỗ trợ quản lý nhân sự'
  })
  @ApiParam({ 
    name: 'email', 
    description: 'Địa chỉ email của nhân viên cần tìm', 
    type: String,
    example: 'nhanvien@example.com'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Thông tin chi tiết nhân viên',
    schema: {
      type: 'object',
      properties: {
        employee_id: { type: 'number', description: 'ID nhân viên' },
        full_name: { type: 'string', description: 'Họ và tên nhân viên' },
        email: { type: 'string', description: 'Email' },
        phone: { type: 'string', description: 'Số điện thoại' },
        address: { type: 'string', description: 'Địa chỉ', nullable: true },
        position: { type: 'string', description: 'Chức vụ', nullable: true },
        hire_date: { type: 'string', format: 'date', description: 'Ngày tuyển dụng' },
        salary: { type: 'number', description: 'Lương', nullable: true },
        is_active: { type: 'boolean', description: 'Trạng thái hoạt động' }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Chưa xác thực - Token không hợp lệ' 
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền truy cập - Chỉ MANAGER mới có thể tìm kiếm nhân viên theo email',
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Không tìm thấy nhân viên với email được cung cấp' 
  })
  async findByEmail(@Param('email') email: string): Promise<employee | null> {
    return this.employeeService.findByEmail(email);
  }

  @Delete('bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Xóa nhiều nhân viên cùng lúc - Chỉ MANAGER',
    description: 'Xóa nhiều nhân viên cùng lúc. Các nhân viên có đơn hàng hoặc dữ liệu liên quan sẽ không thể xóa và sẽ được báo lỗi'
  })
  @ApiBody({ type: BulkDeleteEmployeeDto })
  @ApiResponse({
    status: 200,
    description: 'Quá trình xóa hàng loạt hoàn thành với kết quả chi tiết',
    schema: {
      type: 'object',
      properties: {
        deleted: {
          type: 'array',
          items: { type: 'number' },
          description: 'Danh sách ID các nhân viên đã xóa thành công'
        },
        failed: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', description: 'ID nhân viên không thể xóa' },
              reason: { type: 'string', description: 'Lý do không thể xóa' }
            }
          },
          description: 'Danh sách các nhân viên không thể xóa và lý do'
        },
        summary: {
          type: 'object',
          properties: {
            total: { type: 'number', description: 'Tổng số nhân viên được yêu cầu xóa' },
            success: { type: 'number', description: 'Số nhân viên xóa thành công' },
            failed: { type: 'number', description: 'Số nhân viên không thể xóa' }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Yêu cầu không hợp lệ - Danh sách ID không đúng định dạng' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Chưa xác thực - Token không hợp lệ' 
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền truy cập - Chỉ MANAGER mới có thể xóa nhân viên',
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
  @ApiOperation({ 
    summary: 'Lấy thông tin nhân viên theo ID - MANAGER và STAFF',
    description: 'Lấy thông tin chi tiết của một nhân viên cụ thể bao gồm thông tin cá nhân và công việc'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID của nhân viên cần lấy thông tin', 
    type: Number,
    example: 1
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Thông tin chi tiết nhân viên',
    schema: {
      type: 'object',
      properties: {
        employee_id: { type: 'number', description: 'ID nhân viên' },
        full_name: { type: 'string', description: 'Họ và tên nhân viên' },
        email: { type: 'string', description: 'Email' },
        phone: { type: 'string', description: 'Số điện thoại' },
        address: { type: 'string', description: 'Địa chỉ', nullable: true },
        date_of_birth: { type: 'string', format: 'date', description: 'Ngày sinh', nullable: true },
        gender: { type: 'string', description: 'Giới tính', nullable: true },
        hire_date: { type: 'string', format: 'date', description: 'Ngày tuyển dụng' },
        position: { type: 'string', description: 'Chức vụ', nullable: true },
        salary: { type: 'number', description: 'Lương', nullable: true },
        is_active: { type: 'boolean', description: 'Trạng thái hoạt động' },
        created_at: { type: 'string', format: 'date-time', description: 'Thời gian tạo' },
        updated_at: { type: 'string', format: 'date-time', description: 'Thời gian cập nhật' }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Chưa xác thực - Token không hợp lệ' 
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền truy cập - Chỉ MANAGER và STAFF mới có thể xem thông tin nhân viên',
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Không tìm thấy nhân viên với ID được cung cấp' 
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<employee | null> {
    return this.employeeService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @ApiOperation({ 
    summary: 'Cập nhật thông tin nhân viên - Chỉ MANAGER',
    description: 'Cập nhật thông tin cá nhân và công việc của nhân viên như chức vụ, lương, địa chỉ, v.v.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID của nhân viên cần cập nhật', 
    type: Number,
    example: 1
  })
  @ApiBody({ type: UpdateEmployeeDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Thông tin nhân viên được cập nhật thành công',
    schema: {
      type: 'object',
      properties: {
        employee_id: { type: 'number', description: 'ID nhân viên' },
        full_name: { type: 'string', description: 'Họ và tên đã cập nhật' },
        email: { type: 'string', description: 'Email đã cập nhật' },
        phone: { type: 'string', description: 'Số điện thoại đã cập nhật' },
        address: { type: 'string', description: 'Địa chỉ đã cập nhật', nullable: true },
        position: { type: 'string', description: 'Chức vụ đã cập nhật', nullable: true },
        salary: { type: 'number', description: 'Lương đã cập nhật', nullable: true },
        is_active: { type: 'boolean', description: 'Trạng thái hoạt động đã cập nhật' },
        updated_at: { type: 'string', format: 'date-time', description: 'Thời gian cập nhật' }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Yêu cầu không hợp lệ - Dữ liệu cập nhật không đúng định dạng' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Chưa xác thực - Token không hợp lệ' 
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền truy cập - Chỉ MANAGER mới có thể cập nhật thông tin nhân viên',
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Không tìm thấy nhân viên với ID được cung cấp' 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Xung đột dữ liệu - Email hoặc số điện thoại đã tồn tại' 
  })
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
    summary: 'Khóa/mở khóa tài khoản nhân viên - Chỉ MANAGER',
    description: 'Thay đổi trạng thái khóa của tài khoản nhân viên để ngăn chặn hoặc cho phép đăng nhập hệ thống',
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID nhân viên', 
    type: Number,
    example: 1
  })
  @ApiBody({ type: LockAccountDto })
  @ApiResponse({
    status: 200,
    description: 'Thay đổi trạng thái khóa tài khoản thành công',
    schema: {
      type: 'object',
      properties: {
        employee_id: { type: 'number', description: 'ID nhân viên' },
        account_id: { type: 'number', description: 'ID tài khoản' },
        is_locked: { type: 'boolean', description: 'Trạng thái khóa mới' },
        locked_at: { type: 'string', format: 'date-time', description: 'Thời gian thay đổi trạng thái khóa', nullable: true },
        message: { type: 'string', description: 'Thông báo kết quả' }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Yêu cầu không hợp lệ - Trạng thái khóa không đúng định dạng' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Chưa xác thực - Token không hợp lệ' 
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền truy cập - Chỉ MANAGER mới có thể khóa/mở khóa tài khoản nhân viên',
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Không tìm thấy nhân viên hoặc nhân viên chưa có tài khoản' 
  })
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
    summary: 'Cập nhật thông tin tài khoản của nhân viên - Chỉ MANAGER',
    description: 'Cập nhật tên đăng nhập, mật khẩu, và trạng thái tài khoản của nhân viên',
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID nhân viên', 
    type: Number,
    example: 1
  })
  @ApiParam({ 
    name: 'accountId', 
    description: 'ID tài khoản', 
    type: Number,
    example: 1
  })
  @ApiBody({ type: UpdateAccountDto })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật thông tin tài khoản thành công',
    schema: {
      type: 'object',
      properties: {
        employee_id: { type: 'number', description: 'ID nhân viên' },
        account_id: { type: 'number', description: 'ID tài khoản' },
        username: { type: 'string', description: 'Tên đăng nhập đã cập nhật' },
        email: { type: 'string', description: 'Email đã cập nhật' },
        phone: { type: 'string', description: 'Số điện thoại đã cập nhật' },
        is_active: { type: 'boolean', description: 'Trạng thái hoạt động tài khoản' },
        updated_at: { type: 'string', format: 'date-time', description: 'Thời gian cập nhật' }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Yêu cầu không hợp lệ - Dữ liệu tài khoản không đúng định dạng' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Chưa xác thực - Token không hợp lệ' 
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền truy cập - Chỉ MANAGER mới có thể cập nhật tài khoản nhân viên',
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Không tìm thấy nhân viên hoặc tài khoản với ID được cung cấp' 
  })
  @ApiResponse({
    status: 409,
    description: 'Xung đột dữ liệu - Tên đăng nhập, email hoặc số điện thoại đã tồn tại',
  })
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
  @ApiOperation({ 
    summary: 'Xóa nhân viên - Chỉ MANAGER',
    description: 'Xóa vĩnh viễn nhân viên khỏi hệ thống. Lưu ý: Không thể xóa nhân viên có đơn hàng hoặc dữ liệu quan trọng liên quan'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID của nhân viên cần xóa', 
    type: Number,
    example: 1
  })
  @ApiResponse({ 
    status: 204, 
    description: 'Nhân viên được xóa thành công' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Chưa xác thực - Token không hợp lệ' 
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền truy cập - Chỉ MANAGER mới có thể xóa nhân viên',
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Không tìm thấy nhân viên với ID được cung cấp' 
  })
  @ApiResponse({
    status: 409,
    description: 'Xung đột dữ liệu - Không thể xóa nhân viên có đơn hàng hoặc dữ liệu quan trọng liên quan',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.employeeService.remove(id);
  }

  @Get('admin/test')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Kiểm tra hoạt động của Employee Controller - Chỉ MANAGER',
    description: 'Endpoint để kiểm tra xem Employee Controller có hoạt động bình thường không (smoke test)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Kiểm tra thành công',
    schema: {
      type: 'object',
      properties: {
        message: { 
          type: 'string', 
          description: 'Thông báo xác nhận controller hoạt động bình thường',
          example: 'Employee controller is working!'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Chưa xác thực - Token không hợp lệ' 
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền truy cập - Chỉ MANAGER mới có thể thực hiện kiểm tra',
  })
  async test(): Promise<{ message: string }> {
    return { message: 'Employee controller is working!' };
  }
}
