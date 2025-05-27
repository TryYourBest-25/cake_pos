import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { category } from '../generated/prisma/client'; // Đã import
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('categories')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new category' })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({ status: 201, description: 'Category created successfully.', type: CreateCategoryDto }) // Trả về DTO hoặc entity đầy đủ
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 409, description: 'Conflict (e.g., name already exists)' })
  async create(@Body() createCategoryDto: CreateCategoryDto): Promise<category> {
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({ status: 200, description: 'List of categories', type: [CreateCategoryDto] })
  async findAll(): Promise<category[]> {
    return this.categoryService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a category by ID' })
  @ApiParam({ name: 'id', description: 'Category ID', type: Number })
  @ApiResponse({ status: 200, description: 'The category', type: CreateCategoryDto })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<category> { // Service đã throw NotFoundException
    return this.categoryService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a category by ID' })
  @ApiParam({ name: 'id', description: 'Category ID', type: Number })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiResponse({ status: 200, description: 'Category updated successfully.', type: CreateCategoryDto })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 409, description: 'Conflict (e.g., name already exists)' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<category> {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category by ID' })
  @ApiParam({ name: 'id', description: 'Category ID', type: Number })
  // @HttpCode(HttpStatus.NO_CONTENT) // Có thể trả về 200 với category đã xóa, hoặc 204 nếu không trả về gì
  @ApiResponse({ status: 200, description: 'Category deleted successfully.', type: CreateCategoryDto })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 409, description: 'Conflict (category in use)' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<category> {
    return this.categoryService.remove(id);
  }

  /**
   * @backend/nestjs-general-guidelines
   * Add a admin/test method to each controller as a smoke test.
   */
  @Get('admin/test')
  @ApiOperation({ summary: 'Test endpoint for category controller' })
  @ApiResponse({ status: 200, description: 'Test successful' })
  adminTest(): { message: string } {
    return { message: 'Category controller is working!' };
  }
} 