import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { MembershipTypeService } from './membership-type.service';
import { CreateMembershipTypeDto } from './dto/create-membership-type.dto';
import { UpdateMembershipTypeDto } from './dto/update-membership-type.dto';
import { membership_type } from '../generated/prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';

@ApiTags('membership-types')
@Controller('membership-types')
export class MembershipTypeController {
  constructor(private readonly membershipTypeService: MembershipTypeService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new membership type' })
  @ApiResponse({ status: 201, description: 'Membership type created successfully.', type: CreateMembershipTypeDto })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 409, description: 'Conflict (e.g., type already exists)' })
  @ApiBody({ type: CreateMembershipTypeDto })
  async create(@Body() createDto: CreateMembershipTypeDto): Promise<membership_type> {
    return this.membershipTypeService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all membership types' })
  @ApiQuery({ name: 'includeCustomers', required: false, type: Boolean, description: 'Set to true to include customer details' })
  @ApiResponse({ status: 200, description: 'List of membership types', type: [CreateMembershipTypeDto] })
  async findAll(@Query('includeCustomers') includeCustomers?: string): Promise<membership_type[]> {
    return this.membershipTypeService.findAll(includeCustomers === 'true');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a membership type by ID' })
  @ApiParam({ name: 'id', description: 'Membership Type ID', type: Number })
  @ApiQuery({ name: 'includeCustomers', required: false, type: Boolean, description: 'Set to true to include customer details' })
  @ApiResponse({ status: 200, description: 'The membership type', type: CreateMembershipTypeDto })
  @ApiResponse({ status: 404, description: 'Membership type not found' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('includeCustomers') includeCustomers?: string
  ): Promise<membership_type | null> {
    return this.membershipTypeService.findOne(id, includeCustomers === 'true');
  }
  
  @Get('by-type/:type')
  @ApiOperation({ summary: 'Get a membership type by its type name' })
  @ApiParam({ name: 'type', description: 'Membership type name (e.g., Gold, Silver)', type: String })
  @ApiQuery({ name: 'includeCustomers', required: false, type: Boolean, description: 'Set to true to include customer details' })
  @ApiResponse({ status: 200, description: 'The membership type', type: CreateMembershipTypeDto })
  @ApiResponse({ status: 404, description: 'Membership type not found' })
  async findByType(
    @Param('type') type: string,
    @Query('includeCustomers') includeCustomers?: string
  ): Promise<membership_type | null> {
    return this.membershipTypeService.findByType(type, includeCustomers === 'true');
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a membership type by ID' })
  @ApiParam({ name: 'id', description: 'Membership Type ID', type: Number })
  @ApiBody({ type: UpdateMembershipTypeDto })
  @ApiResponse({ status: 200, description: 'Membership type updated successfully.', type: CreateMembershipTypeDto })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'Membership type not found' })
  @ApiResponse({ status: 409, description: 'Conflict (e.g., type already exists)' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateMembershipTypeDto,
  ): Promise<membership_type> {
    return this.membershipTypeService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a membership type by ID' })
  @ApiParam({ name: 'id', description: 'Membership Type ID', type: Number })
  @ApiResponse({ status: 204, description: 'Membership type deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Membership type not found' })
  @ApiResponse({ status: 409, description: 'Conflict (cannot delete if associated with customers)'})
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.membershipTypeService.remove(id);
  }
} 