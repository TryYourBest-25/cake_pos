import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { StoreService } from './store.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { store } from '../generated/prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('stores')
@Controller('stores')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new store' })
  @ApiResponse({ status: 201, description: 'The store has been successfully created.', type: CreateStoreDto })
  @ApiResponse({ status: 400, description: 'Bad Request (e.g., validation error)' })
  @ApiResponse({ status: 409, description: 'Conflict (e.g., email or name already exists)' })
  @ApiBody({ type: CreateStoreDto })
  async create(@Body() createStoreDto: CreateStoreDto): Promise<store> {
    return this.storeService.create(createStoreDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all stores' })
  @ApiResponse({ status: 200, description: 'List of all stores', type: [CreateStoreDto] }) // Dùng DTO hoặc model thực tế
  async findAll(): Promise<store[]> {
    return this.storeService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a store by ID' })
  @ApiParam({ name: 'id', description: 'Store ID', type: Number })
  @ApiResponse({ status: 200, description: 'The store', type: CreateStoreDto })
  @ApiResponse({ status: 404, description: 'Store not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<store | null> {
    return this.storeService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a store by ID' })
  @ApiParam({ name: 'id', description: 'Store ID', type: Number })
  @ApiBody({ type: UpdateStoreDto })
  @ApiResponse({ status: 200, description: 'The store has been successfully updated.', type: CreateStoreDto })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'Store not found' })
  @ApiResponse({ status: 409, description: 'Conflict (e.g., email or name already exists)' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStoreDto: UpdateStoreDto,
  ): Promise<store> {
    return this.storeService.update(id, updateStoreDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a store by ID' })
  @ApiParam({ name: 'id', description: 'Store ID', type: Number })
  @ApiResponse({ status: 204, description: 'The store has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Store not found' })
  @ApiResponse({ status: 409, description: 'Conflict (e.g., due to foreign key constraints)'})
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.storeService.remove(id);
  }
} 