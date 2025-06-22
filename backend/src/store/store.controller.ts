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
import { StoreService } from './store.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { PaginationDto, PaginatedResult, PaginationMetadata } from '../common/dto/pagination.dto';
import { store } from '../generated/prisma/client';
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

@ApiTags('stores')
@Controller('stores')
@ApiBearerAuth()
@ApiExtraModels(PaginationMetadata)
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new store - Chỉ MANAGER' })
  @ApiBody({ type: CreateStoreDto })
  @ApiResponse({
    status: 201,
    description: 'The store has been successfully created.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request (e.g., validation error)',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict (e.g., email or name already exists)',
  })
  async create(@Body() createStoreDto: CreateStoreDto): Promise<store> {
    return this.storeService.create(createStoreDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF)
  @ApiOperation({
    summary: 'Get all stores with pagination - MANAGER và STAFF',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Paginated list of stores',
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
  ): Promise<PaginatedResult<store>> {
    return this.storeService.findAll(paginationDto);
  }

  @Get('default')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF, ROLES.CUSTOMER)
  @ApiOperation({ summary: 'Get default store information - Tất cả roles' })
  @ApiResponse({ status: 200, description: 'Default store information' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'No store found' })
  async getDefaultStore(): Promise<store | null> {
    return this.storeService.getDefaultStore();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF)
  @ApiOperation({ summary: 'Get a store by ID - MANAGER và STAFF' })
  @ApiParam({ name: 'id', description: 'Store ID', type: Number })
  @ApiResponse({ status: 200, description: 'The store' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Store not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<store | null> {
    return this.storeService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @ApiOperation({ summary: 'Update a store by ID - Chỉ MANAGER' })
  @ApiParam({ name: 'id', description: 'Store ID', type: Number })
  @ApiBody({ type: UpdateStoreDto })
  @ApiResponse({
    status: 200,
    description: 'The store has been successfully updated.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Store not found' })
  @ApiResponse({
    status: 409,
    description: 'Conflict (e.g., email or name already exists)',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStoreDto: UpdateStoreDto,
  ): Promise<store> {
    return this.storeService.update(id, updateStoreDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a store by ID - Chỉ MANAGER' })
  @ApiParam({ name: 'id', description: 'Store ID', type: Number })
  @ApiResponse({
    status: 204,
    description: 'The store has been successfully deleted.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Store not found' })
  @ApiResponse({
    status: 409,
    description: 'Conflict (e.g., due to foreign key constraints)',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.storeService.remove(id);
  }
}
