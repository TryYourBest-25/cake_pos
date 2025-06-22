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
import { PaginationDto, PaginatedResult, PaginationMetadata } from '../common/dto/pagination.dto';
import { customer } from '../generated/prisma/client';
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
import { AccountService } from '../account/account.service';
import { CreateAccountDto } from '../account/dto/create-account.dto';
import { UpdateAccountDto } from '../account/dto/update-account.dto';
import { LockAccountDto } from '../account/dto/lock-account.dto';

@ApiTags('customers')
@Controller('customers')
@ApiBearerAuth('JWT-auth')
@ApiExtraModels(PaginationMetadata)
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
    description: 'Hệ thống sẽ tự động gán loại thành viên có điểm yêu cầu thấp nhất và đặt điểm hiện tại bằng điểm yêu cầu đó',
  })
  @ApiBody({ type: CreateCustomerDto })
  @ApiResponse({
    status: 201,
    description: 'Khách hàng được tạo thành công với loại thành viên và điểm tự động',
    schema: {
      type: 'object',
      properties: {
        customer_id: { type: 'number', description: 'ID khách hàng' },
        full_name: { type: 'string', description: 'Họ và tên khách hàng' },
        phone: { type: 'string', description: 'Số điện thoại' },
        email: { type: 'string', description: 'Email', nullable: true },
        address: { type: 'string', description: 'Địa chỉ', nullable: true },
        date_of_birth: { type: 'string', format: 'date', description: 'Ngày sinh', nullable: true },
        gender: { type: 'string', description: 'Giới tính', nullable: true },
        membership_type_id: { type: 'number', description: 'ID loại thành viên được gán tự động' },
        current_points: { type: 'number', description: 'Điểm hiện tại được gán tự động' },
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
    description: 'Không có quyền truy cập - Chỉ MANAGER và STAFF mới có thể tạo khách hàng',
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Xung đột dữ liệu - Số điện thoại đã tồn tại' 
  })
  async create(
    @Body() createCustomerDto: CreateCustomerDto,
  ): Promise<customer> {
    return this.customerService.create(createCustomerDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF)
  @ApiOperation({
    summary: 'Lấy danh sách khách hàng với phân trang - Chỉ MANAGER và STAFF',
    description: 'Trả về danh sách tất cả khách hàng trong hệ thống với thông tin loại thành viên và điểm tích lũy'
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
    description: 'Danh sách khách hàng được phân trang thành công',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              customer_id: { type: 'number' },
              full_name: { type: 'string' },
              phone: { type: 'string' },
              email: { type: 'string', nullable: true },
              address: { type: 'string', nullable: true },
              date_of_birth: { type: 'string', format: 'date', nullable: true },
              gender: { type: 'string', nullable: true },
              membership_type_id: { type: 'number' },
              current_points: { type: 'number' },
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
    description: 'Không có quyền truy cập - Chỉ MANAGER và STAFF mới có thể xem danh sách khách hàng',
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
  @ApiOperation({ 
    summary: 'Xóa nhiều khách hàng cùng lúc - Chỉ MANAGER',
    description: 'Xóa nhiều khách hàng cùng lúc. Các khách hàng có đơn hàng liên quan sẽ không thể xóa và sẽ được báo lỗi'
  })
  @ApiBody({ type: BulkDeleteCustomerDto })
  @ApiResponse({
    status: 200,
    description: 'Quá trình xóa hàng loạt hoàn thành với kết quả chi tiết',
    schema: {
      type: 'object',
      properties: {
        deleted: {
          type: 'array',
          items: { type: 'number' },
          description: 'Danh sách ID các khách hàng đã xóa thành công'
        },
        failed: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', description: 'ID khách hàng không thể xóa' },
              reason: { type: 'string', description: 'Lý do không thể xóa' }
            }
          },
          description: 'Danh sách các khách hàng không thể xóa và lý do'
        },
        summary: {
          type: 'object',
          properties: {
            total: { type: 'number', description: 'Tổng số khách hàng được yêu cầu xóa' },
            success: { type: 'number', description: 'Số khách hàng xóa thành công' },
            failed: { type: 'number', description: 'Số khách hàng không thể xóa' }
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
    description: 'Không có quyền truy cập - Chỉ MANAGER mới có thể xóa khách hàng',
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
    summary: 'Lấy thông tin khách hàng theo ID - Tất cả role (CUSTOMER chỉ xem thông tin của mình)',
    description: 'Lấy thông tin chi tiết của một khách hàng cụ thể bao gồm loại thành viên và điểm tích lũy'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID của khách hàng cần lấy thông tin', 
    type: Number,
    example: 1
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Thông tin chi tiết khách hàng',
    schema: {
      type: 'object',
      properties: {
        customer_id: { type: 'number', description: 'ID khách hàng' },
        full_name: { type: 'string', description: 'Họ và tên khách hàng' },
        phone: { type: 'string', description: 'Số điện thoại' },
        email: { type: 'string', description: 'Email', nullable: true },
        address: { type: 'string', description: 'Địa chỉ', nullable: true },
        date_of_birth: { type: 'string', format: 'date', description: 'Ngày sinh', nullable: true },
        gender: { type: 'string', description: 'Giới tính', nullable: true },
        membership_type_id: { type: 'number', description: 'ID loại thành viên' },
        current_points: { type: 'number', description: 'Điểm tích lũy hiện tại' },
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
    description: 'Không có quyền truy cập - CUSTOMER chỉ có thể xem thông tin của mình',
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Không tìm thấy khách hàng với ID được cung cấp' 
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<customer | null> {
    return this.customerService.findOne(id);
  }

  @Get('phone/:phone')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF)
  @ApiOperation({ 
    summary: 'Tìm khách hàng theo số điện thoại - Chỉ MANAGER và STAFF',
    description: 'Tìm kiếm thông tin khách hàng dựa trên số điện thoại để hỗ trợ quá trình bán hàng'
  })
  @ApiParam({
    name: 'phone',
    description: 'Số điện thoại của khách hàng cần tìm',
    type: String,
    example: '0987654321'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Thông tin chi tiết khách hàng',
    schema: {
      type: 'object',
      properties: {
        customer_id: { type: 'number', description: 'ID khách hàng' },
        full_name: { type: 'string', description: 'Họ và tên khách hàng' },
        phone: { type: 'string', description: 'Số điện thoại' },
        email: { type: 'string', description: 'Email', nullable: true },
        address: { type: 'string', description: 'Địa chỉ', nullable: true },
        membership_type_id: { type: 'number', description: 'ID loại thành viên' },
        current_points: { type: 'number', description: 'Điểm tích lũy hiện tại' }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Chưa xác thực - Token không hợp lệ' 
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền truy cập - Chỉ MANAGER và STAFF mới có thể tìm kiếm khách hàng',
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Không tìm thấy khách hàng với số điện thoại được cung cấp' 
  })
  async findByPhone(@Param('phone') phone: string): Promise<customer | null> {
    return this.customerService.findByPhone(phone);
  }

  // Endpoints tài khoản cho customer
  @Get(':id/account')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF, ROLES.CUSTOMER)
  @ApiOperation({
    summary: 'Lấy thông tin tài khoản của khách hàng - Tất cả role (CUSTOMER chỉ xem tài khoản của mình)',
    description: 'Trả về thông tin tài khoản đã liên kết với khách hàng này bao gồm quyền hạn và trạng thái',
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID khách hàng', 
    type: Number,
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'Thông tin tài khoản của khách hàng',
    schema: {
      type: 'object',
      properties: {
        account_id: { type: 'number', description: 'ID tài khoản' },
        username: { type: 'string', description: 'Tên đăng nhập' },
        email: { type: 'string', description: 'Email' },
        phone: { type: 'string', description: 'Số điện thoại' },
        role_id: { type: 'number', description: 'ID vai trò' },
        is_active: { type: 'boolean', description: 'Trạng thái hoạt động' },
        created_at: { type: 'string', format: 'date-time', description: 'Thời gian tạo' }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Chưa xác thực - Token không hợp lệ' 
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền truy cập - CUSTOMER chỉ có thể xem tài khoản của mình',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy khách hàng hoặc khách hàng chưa có tài khoản liên kết',
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
    description: 'Tạo tài khoản đăng nhập mới và liên kết với khách hàng hiện tại để họ có thể sử dụng ứng dụng',
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID khách hàng', 
    type: Number,
    example: 1
  })
  @ApiBody({ type: CreateAccountDto })
  @ApiResponse({
    status: 201,
    description: 'Tạo tài khoản thành công cho khách hàng',
    schema: {
      type: 'object',
      properties: {
        account_id: { type: 'number', description: 'ID tài khoản mới' },
        customer_id: { type: 'number', description: 'ID khách hàng' },
        username: { type: 'string', description: 'Tên đăng nhập' },
        email: { type: 'string', description: 'Email' },
        phone: { type: 'string', description: 'Số điện thoại' },
        role_id: { type: 'number', description: 'ID vai trò (mặc định là CUSTOMER)' },
        is_active: { type: 'boolean', description: 'Trạng thái hoạt động' },
        created_at: { type: 'string', format: 'date-time', description: 'Thời gian tạo' }
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
    description: 'Không có quyền truy cập - Chỉ MANAGER và STAFF mới có thể tạo tài khoản',
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Không tìm thấy khách hàng với ID được cung cấp' 
  })
  @ApiResponse({
    status: 409,
    description: 'Xung đột dữ liệu - Tên đăng nhập đã tồn tại hoặc khách hàng đã có tài khoản',
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
    summary: 'Cập nhật tài khoản của khách hàng - Tất cả role (CUSTOMER chỉ cập nhật tài khoản của mình)',
    description: 'Cập nhật thông tin tài khoản đã liên kết với khách hàng như thay đổi mật khẩu, email, hoặc thông tin liên hệ',
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID khách hàng', 
    type: Number,
    example: 1
  })
  @ApiBody({ type: UpdateAccountDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Cập nhật tài khoản thành công',
    schema: {
      type: 'object',
      properties: {
        account_id: { type: 'number', description: 'ID tài khoản' },
        customer_id: { type: 'number', description: 'ID khách hàng' },
        username: { type: 'string', description: 'Tên đăng nhập' },
        email: { type: 'string', description: 'Email đã cập nhật' },
        phone: { type: 'string', description: 'Số điện thoại đã cập nhật' },
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
    description: 'Không có quyền truy cập - CUSTOMER chỉ có thể cập nhật tài khoản của mình',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy khách hàng hoặc khách hàng chưa có tài khoản liên kết',
  })
  @ApiResponse({
    status: 409,
    description: 'Xung đột dữ liệu - Tên đăng nhập đã tồn tại',
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
    description: 'Thay đổi trạng thái khóa của tài khoản khách hàng để ngăn chặn hoặc cho phép đăng nhập',
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID khách hàng', 
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
        account_id: { type: 'number', description: 'ID tài khoản' },
        customer_id: { type: 'number', description: 'ID khách hàng' },
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
    description: 'Không có quyền truy cập - Chỉ MANAGER mới có thể khóa/mở khóa tài khoản',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy khách hàng hoặc khách hàng chưa có tài khoản liên kết',
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
    summary: 'Cập nhật thông tin khách hàng - Tất cả role (CUSTOMER chỉ cập nhật thông tin của mình)',
    description: 'Cập nhật thông tin cá nhân của khách hàng. Lưu ý: Không thể cập nhật loại thành viên và điểm tích lũy - các trường này được quản lý tự động bởi hệ thống.',
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID khách hàng', 
    type: Number,
    example: 1
  })
  @ApiBody({ type: UpdateCustomerDto })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật thông tin khách hàng thành công',
    schema: {
      type: 'object',
      properties: {
        customer_id: { type: 'number', description: 'ID khách hàng' },
        full_name: { type: 'string', description: 'Họ và tên đã cập nhật' },
        phone: { type: 'string', description: 'Số điện thoại đã cập nhật' },
        email: { type: 'string', description: 'Email đã cập nhật', nullable: true },
        address: { type: 'string', description: 'Địa chỉ đã cập nhật', nullable: true },
        date_of_birth: { type: 'string', format: 'date', description: 'Ngày sinh đã cập nhật', nullable: true },
        gender: { type: 'string', description: 'Giới tính đã cập nhật', nullable: true },
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
    description: 'Không có quyền truy cập - CUSTOMER chỉ có thể cập nhật thông tin của mình',
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Không tìm thấy khách hàng với ID được cung cấp' 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Xung đột dữ liệu - Số điện thoại đã tồn tại' 
  })
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
  @ApiOperation({ 
    summary: 'Xóa khách hàng - Chỉ MANAGER',
    description: 'Xóa vĩnh viễn khách hàng khỏi hệ thống. Lưu ý: Không thể xóa khách hàng có đơn hàng hoặc tài khoản liên quan'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID khách hàng cần xóa', 
    type: Number,
    example: 1
  })
  @ApiResponse({ 
    status: 204, 
    description: 'Khách hàng được xóa thành công' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Chưa xác thực - Token không hợp lệ' 
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền truy cập - Chỉ MANAGER mới có thể xóa khách hàng',
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Không tìm thấy khách hàng với ID được cung cấp' 
  })
  @ApiResponse({
    status: 409,
    description: 'Xung đột dữ liệu - Không thể xóa khách hàng có đơn hàng hoặc tài khoản liên quan',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.customerService.remove(id);
  }

  @Get('test/ping')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Kiểm tra hoạt động của Customer Controller - Chỉ MANAGER',
    description: 'Endpoint để kiểm tra xem Customer Controller có hoạt động bình thường không (smoke test)'
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
          example: 'Customer controller is working!'
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
    return { message: 'Customer controller is working!' };
  }

  @Get('membership-type/:membershipTypeId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.STAFF, ROLES.MANAGER)
  @ApiOperation({
    summary: 'Lấy khách hàng theo loại thành viên với phân trang - STAFF/MANAGER',
    description: 'Trả về danh sách khách hàng thuộc một loại thành viên cụ thể để phân tích và quản lý chương trình khách hàng thân thiết'
  })
  @ApiParam({
    name: 'membershipTypeId',
    description: 'ID loại thành viên',
    type: Number,
    example: 1
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
    description: 'Danh sách khách hàng theo loại thành viên được phân trang thành công',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              customer_id: { type: 'number' },
              full_name: { type: 'string' },
              phone: { type: 'string' },
              email: { type: 'string', nullable: true },
              current_points: { type: 'number' },
              membership_type_id: { type: 'number' },
              created_at: { type: 'string', format: 'date-time' }
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
    description: 'Không có quyền truy cập - Chỉ STAFF và MANAGER mới có thể xem danh sách khách hàng theo loại thành viên',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy loại thành viên với ID được cung cấp',
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
