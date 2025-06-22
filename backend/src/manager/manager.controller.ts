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
import { ManagerService } from './manager.service';
import { CreateManagerDto } from './dto/create-manager.dto';
import { UpdateManagerDto } from './dto/update-manager.dto';
import { BulkDeleteManagerDto } from './dto/bulk-delete-manager.dto';
import { PaginationDto, PaginatedResult, PaginationMetadata } from '../common/dto/pagination.dto';
import { manager } from '../generated/prisma/client';
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
import { LockAccountDto } from '../account/dto/lock-account.dto';
import { UpdateAccountDto } from '../account/dto/update-account.dto';

@ApiTags('managers')
@Controller('managers')
@ApiBearerAuth()
@ApiExtraModels(PaginationMetadata)
export class ManagerController {
  constructor(private readonly managerService: ManagerService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new manager - Chỉ MANAGER' })
  @ApiBody({ type: CreateManagerDto })
  @ApiResponse({ status: 201, description: 'Manager created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 409, description: 'Conflict (email already exists)' })
  async create(@Body() createManagerDto: CreateManagerDto): Promise<manager> {
    return this.managerService.create(createManagerDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @ApiOperation({ summary: 'Get all managers with pagination - Chỉ MANAGER' })
  @ApiResponse({ 
    status: 200, 
    description: 'Paginated list of managers',
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
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async findAll(
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResult<manager>> {
    return this.managerService.findAll(paginationDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @ApiOperation({ summary: 'Get manager by ID - Chỉ MANAGER' })
  @ApiParam({ name: 'id', description: 'Manager ID', type: Number })
  @ApiResponse({ status: 200, description: 'Manager details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Manager not found' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<manager | null> {
    return this.managerService.findOne(id);
  }

  @Get('email/:email')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @ApiOperation({ summary: 'Find manager by email - Chỉ MANAGER' })
  @ApiParam({ name: 'email', description: 'Manager email', type: String })
  @ApiResponse({ status: 200, description: 'Manager details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Manager not found' })
  async findByEmail(@Param('email') email: string): Promise<manager | null> {
    return this.managerService.findByEmail(email);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @ApiOperation({ summary: 'Update manager - Chỉ MANAGER' })
  @ApiParam({ name: 'id', description: 'Manager ID', type: Number })
  @ApiBody({ type: UpdateManagerDto })
  @ApiResponse({ status: 200, description: 'Manager updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Manager not found' })
  @ApiResponse({ status: 409, description: 'Conflict (email already exists)' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateManagerDto: UpdateManagerDto,
  ): Promise<manager> {
    return this.managerService.update(id, updateManagerDto);
  }

  @Patch(':id/account/lock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @ApiOperation({
    summary: 'Khóa/mở khóa tài khoản manager - Chỉ MANAGER',
    description: 'Thay đổi trạng thái khóa của tài khoản manager',
  })
  @ApiParam({ name: 'id', description: 'Manager ID', type: Number })
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
  @ApiResponse({ status: 404, description: 'Manager not found' })
  async lockManagerAccount(
    @Param('id', ParseIntPipe) managerId: number,
    @Body() lockAccountDto: LockAccountDto,
  ) {
    return this.managerService.lockManagerAccount(
      managerId,
      lockAccountDto.is_locked,
    );
  }

  @Patch(':id/account/:accountId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @ApiOperation({
    summary: 'Cập nhật thông tin tài khoản của manager - Chỉ MANAGER',
    description: 'Cập nhật username, password, và trạng thái tài khoản của manager',
  })
  @ApiParam({ name: 'id', description: 'Manager ID', type: Number })
  @ApiParam({ name: 'accountId', description: 'Account ID', type: Number })
  @ApiBody({ type: UpdateAccountDto })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật thông tin tài khoản thành công',
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Account không thuộc về Manager này' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Manager hoặc Account không tồn tại' })
  @ApiResponse({ status: 409, description: 'Conflict - Username đã tồn tại' })
  async updateManagerAccount(
    @Param('id', ParseIntPipe) managerId: number,
    @Param('accountId', ParseIntPipe) accountId: number,
    @Body() updateAccountDto: UpdateAccountDto,
  ) {
    return this.managerService.updateManagerAccount(
      managerId,
      accountId,
      updateAccountDto,
    );
  }

  @Delete('bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk delete managers - Chỉ MANAGER' })
  @ApiBody({ type: BulkDeleteManagerDto })
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
  async bulkDelete(@Body() bulkDeleteDto: BulkDeleteManagerDto): Promise<{
    deleted: number[];
    failed: { id: number; reason: string }[];
    summary: { total: number; success: number; failed: number };
  }> {
    return this.managerService.bulkDelete(bulkDeleteDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete manager - Chỉ MANAGER' })
  @ApiParam({ name: 'id', description: 'Manager ID', type: Number })
  @ApiResponse({ status: 204, description: 'Manager deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Manager not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.managerService.remove(id);
  }

  @Get('test/ping')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Test manager controller - Chỉ MANAGER' })
  @ApiResponse({ status: 200, description: 'Test successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async test(): Promise<{ message: string }> {
    return { message: 'Manager controller is working!' };
  }
}
