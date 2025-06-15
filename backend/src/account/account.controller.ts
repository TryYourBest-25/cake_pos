import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { AccountService } from './account.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ROLES } from '../auth/constants/roles.constant';
// import { Account } from '@prisma/client'; // Or your specific type from generated client if different
// Tạm thời dùng any cho kiểu trả về của Account, sẽ sửa lại khi service ổn định

@ApiTags('accounts')
@Controller('accounts')
@ApiBearerAuth()
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new account - Chỉ MANAGER' })
  @ApiBody({ type: CreateAccountDto })
  @ApiResponse({ status: 201, description: 'Account created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 409, description: 'Conflict (username already exists)' })
  async create(@Body() createAccountDto: CreateAccountDto): Promise<any> {
    // TODO: Consider returning a more specific DTO/ViewModel instead of the full entity
    return this.accountService.create(createAccountDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @ApiOperation({ summary: 'Get all accounts - Chỉ MANAGER' })
  @ApiResponse({ status: 200, description: 'List of accounts' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  async findAll(): Promise<any[]> {
    return this.accountService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF)
  @ApiOperation({ summary: 'Get account by ID - MANAGER và STAFF' })
  @ApiParam({ name: 'id', description: 'Account ID', type: Number })
  @ApiResponse({ status: 200, description: 'Account details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Account not found' })
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
  @ApiOperation({ summary: 'Update account by ID - Chỉ MANAGER' })
  @ApiParam({ name: 'id', description: 'Account ID', type: Number })
  @ApiBody({ type: UpdateAccountDto })
  @ApiResponse({ status: 200, description: 'Account updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  @ApiResponse({ status: 409, description: 'Conflict (username already exists)' })
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
  @ApiOperation({ summary: 'Delete account by ID - Chỉ MANAGER' })
  @ApiParam({ name: 'id', description: 'Account ID', type: Number })
  @ApiResponse({ status: 200, description: 'Account deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Account not found' })
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
  @ApiOperation({ summary: 'Test account controller - Chỉ MANAGER' })
  @ApiResponse({ status: 200, description: 'Test successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  adminTest(): { message: string } {
    return { message: 'Account controller is working!' };
  }
} 