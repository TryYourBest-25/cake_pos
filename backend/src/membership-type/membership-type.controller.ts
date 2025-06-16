import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { MembershipTypeService } from './membership-type.service';
import { CreateMembershipTypeDto } from './dto/create-membership-type.dto';
import { UpdateMembershipTypeDto } from './dto/update-membership-type.dto';
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';
import { membership_type } from '../generated/prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ROLES } from '../auth/constants/roles.constant';

@ApiTags('membership-types')
@Controller('membership-types')
@ApiBearerAuth()
export class MembershipTypeController {
  constructor(private readonly membershipTypeService: MembershipTypeService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new membership type - Chỉ MANAGER' })
  @ApiBody({ type: CreateMembershipTypeDto })
  @ApiResponse({ status: 201, description: 'Membership type created successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 409, description: 'Conflict (e.g., type already exists)' })
  async create(@Body() createDto: CreateMembershipTypeDto): Promise<membership_type> {
    return this.membershipTypeService.create(createDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF, ROLES.CUSTOMER)
  @ApiOperation({ summary: 'Get all membership types with pagination - Tất cả role' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'includeCustomers', required: false, type: Boolean, description: 'Set to true to include customer details' })
  @ApiResponse({ status: 200, description: 'Paginated list of membership types' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Query() paginationDto: PaginationDto  ): Promise<PaginatedResult<membership_type>> {
    return this.membershipTypeService.findAll(paginationDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF, ROLES.CUSTOMER)
  @ApiOperation({ summary: 'Get a membership type by ID - Tất cả role' })
  @ApiParam({ name: 'id', description: 'Membership Type ID', type: Number })
  @ApiQuery({ name: 'includeCustomers', required: false, type: Boolean, description: 'Set to true to include customer details' })
  @ApiResponse({ status: 200, description: 'The membership type' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Membership type not found' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('includeCustomers') includeCustomers?: string
  ): Promise<membership_type | null> {
    return this.membershipTypeService.findOne(id, includeCustomers === 'true');
  }
  
  @Get('by-type/:type')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF, ROLES.CUSTOMER)
  @ApiOperation({ summary: 'Get a membership type by its type name - Tất cả role' })
  @ApiParam({ name: 'type', description: 'Membership type name (e.g., Gold, Silver)', type: String })
  @ApiQuery({ name: 'includeCustomers', required: false, type: Boolean, description: 'Set to true to include customer details' })
  @ApiResponse({ status: 200, description: 'The membership type' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Membership type not found' })
  async findByType(
    @Param('type') type: string,
    @Query('includeCustomers') includeCustomers?: string
  ): Promise<membership_type | null> {
    return this.membershipTypeService.findByType(type, includeCustomers === 'true');
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @ApiOperation({ summary: 'Update a membership type by ID - Chỉ MANAGER' })
  @ApiParam({ name: 'id', description: 'Membership Type ID', type: Number })
  @ApiBody({ type: UpdateMembershipTypeDto })
  @ApiResponse({ status: 200, description: 'Membership type updated successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Membership type not found' })
  @ApiResponse({ status: 409, description: 'Conflict (e.g., type already exists)' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateMembershipTypeDto,
  ): Promise<membership_type> {
    return this.membershipTypeService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a membership type by ID - Chỉ MANAGER' })
  @ApiParam({ name: 'id', description: 'Membership Type ID', type: Number })
  @ApiResponse({ status: 204, description: 'Membership type deleted successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Membership type not found' })
  @ApiResponse({ status: 409, description: 'Conflict (cannot delete if associated with customers)' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.membershipTypeService.remove(id);
  }
} 