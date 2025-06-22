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
import { AccountService } from './account.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { PaginationDto, PaginatedResult, PaginationMetadata } from '../common/dto/pagination.dto';
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

@ApiTags('accounts')
@Controller('accounts')
@ApiBearerAuth('JWT-auth')
@ApiExtraModels(PaginationMetadata)
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Tạo tài khoản mới - Chỉ MANAGER',
    description: 'Tạo một tài khoản mới trong hệ thống với thông tin đăng nhập và quyền hạn được chỉ định'
  })
  @ApiBody({ type: CreateAccountDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Tài khoản được tạo thành công',
    schema: {
      type: 'object',
      properties: {
        account_id: { type: 'number', description: 'ID của tài khoản' },
        username: { type: 'string', description: 'Tên đăng nhập' },
        email: { type: 'string', description: 'Email' },
        phone: { type: 'string', description: 'Số điện thoại' },
        role_id: { type: 'number', description: 'ID vai trò' },
        is_active: { type: 'boolean', description: 'Trạng thái hoạt động' },
        created_at: { type: 'string', format: 'date-time', description: 'Thời gian tạo' },
        updated_at: { type: 'string', format: 'date-time', description: 'Thời gian cập nhật' }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Yêu cầu không hợp lệ - Dữ liệu đầu vào không đúng định dạng hoặc thiếu thông tin bắt buộc' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Chưa xác thực - Token không hợp lệ hoặc không được cung cấp' 
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền truy cập - Chỉ MANAGER mới có thể tạo tài khoản',
  })
  @ApiResponse({
    status: 409,
    description: 'Xung đột dữ liệu - Tên đăng nhập, email hoặc số điện thoại đã tồn tại',
  })
  async create(@Body() createAccountDto: CreateAccountDto): Promise<any> {
    // TODO: Consider returning a more specific DTO/ViewModel instead of the full entity
    return this.accountService.create(createAccountDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @ApiOperation({ 
    summary: 'Lấy danh sách tài khoản với phân trang - Chỉ MANAGER',
    description: 'Trả về danh sách tất cả tài khoản trong hệ thống với hỗ trợ phân trang'
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
    description: 'Danh sách tài khoản được phân trang thành công',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              account_id: { type: 'number' },
              username: { type: 'string' },
              email: { type: 'string' },
              phone: { type: 'string' },
              role_id: { type: 'number' },
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
    description: 'Không có quyền truy cập - Chỉ MANAGER mới có thể xem danh sách tài khoản',
  })
  async findAll(
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResult<any>> {
    return this.accountService.findAll(paginationDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF)
  @ApiOperation({ 
    summary: 'Lấy thông tin tài khoản theo ID - MANAGER và STAFF',
    description: 'Lấy thông tin chi tiết của một tài khoản cụ thể bằng ID'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID của tài khoản cần lấy thông tin', 
    type: Number,
    example: 1
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Thông tin chi tiết tài khoản',
    schema: {
      type: 'object',
      properties: {
        account_id: { type: 'number', description: 'ID của tài khoản' },
        username: { type: 'string', description: 'Tên đăng nhập' },
        email: { type: 'string', description: 'Email' },
        phone: { type: 'string', description: 'Số điện thoại' },
        role_id: { type: 'number', description: 'ID vai trò' },
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
    description: 'Không có quyền truy cập - Chỉ MANAGER và STAFF mới có thể xem thông tin tài khoản',
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Không tìm thấy tài khoản với ID được cung cấp' 
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.accountService.findOne(id);
  }

  // Example: Get account by username (if you have such a method in service)
  // @Get('username/:username')
  // async findByUsername(@Param('username') username: string): Promise<any> { // Promise<Account | null>
  // return this.accountService.findByUsername(username);
  // }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @ApiOperation({ 
    summary: 'Cập nhật thông tin tài khoản - Chỉ MANAGER',
    description: 'Cập nhật thông tin của một tài khoản cụ thể. Có thể cập nhật thông tin cá nhân, thay đổi mật khẩu, hoặc thay đổi trạng thái tài khoản'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID của tài khoản cần cập nhật', 
    type: Number,
    example: 1
  })
  @ApiBody({ type: UpdateAccountDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Tài khoản được cập nhật thành công',
    schema: {
      type: 'object',
      properties: {
        account_id: { type: 'number', description: 'ID của tài khoản' },
        username: { type: 'string', description: 'Tên đăng nhập' },
        email: { type: 'string', description: 'Email' },
        phone: { type: 'string', description: 'Số điện thoại' },
        role_id: { type: 'number', description: 'ID vai trò' },
        is_active: { type: 'boolean', description: 'Trạng thái hoạt động' },
        updated_at: { type: 'string', format: 'date-time', description: 'Thời gian cập nhật' }
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
    description: 'Không có quyền truy cập - Chỉ MANAGER mới có thể cập nhật tài khoản',
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Không tìm thấy tài khoản với ID được cung cấp' 
  })
  @ApiResponse({
    status: 409,
    description: 'Xung đột dữ liệu - Tên đăng nhập, email hoặc số điện thoại đã tồn tại',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAccountDto: UpdateAccountDto,
  ): Promise<any> {
    return this.accountService.update(id, updateAccountDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Xóa tài khoản - Chỉ MANAGER',
    description: 'Xóa vĩnh viễn một tài khoản khỏi hệ thống. Lưu ý: Thao tác này không thể hoàn tác'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID của tài khoản cần xóa', 
    type: Number,
    example: 1
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Tài khoản được xóa thành công',
    schema: {
      type: 'object',
      properties: {
        account_id: { type: 'number', description: 'ID của tài khoản đã xóa' },
        username: { type: 'string', description: 'Tên đăng nhập của tài khoản đã xóa' },
        message: { type: 'string', description: 'Thông báo xác nhận xóa thành công' }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Chưa xác thực - Token không hợp lệ' 
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền truy cập - Chỉ MANAGER mới có thể xóa tài khoản',
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Không tìm thấy tài khoản với ID được cung cấp' 
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.accountService.remove(id);
  }

  /**
   * @backend/nestjs-general-guidelines
   * Add a admin/test method to each controller as a smoke test.
   */
  @Get('admin/test')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @ApiOperation({ 
    summary: 'Kiểm tra hoạt động của Account Controller - Chỉ MANAGER',
    description: 'Endpoint để kiểm tra xem Account Controller có hoạt động bình thường không (smoke test)'
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
          example: 'Account controller is working!'
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
  adminTest(): { message: string } {
    return { message: 'Account controller is working!' };
  }
}
