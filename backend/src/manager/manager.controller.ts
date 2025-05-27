import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ManagerService } from './manager.service';
import { CreateManagerDto } from './dto/create-manager.dto';
import { UpdateManagerDto } from './dto/update-manager.dto';
import { manager } from '../generated/prisma/client';

@Controller('managers')
export class ManagerController {
  constructor(private readonly managerService: ManagerService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createManagerDto: CreateManagerDto): Promise<manager> {
    return this.managerService.create(createManagerDto);
  }

  @Get()
  async findAll(): Promise<manager[]> {
    return this.managerService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<manager | null> {
    return this.managerService.findOne(id);
  }

  @Get('email/:email')
  async findByEmail(@Param('email') email: string): Promise<manager | null> {
    return this.managerService.findByEmail(email);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateManagerDto: UpdateManagerDto,
  ): Promise<manager> {
    return this.managerService.update(id, updateManagerDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.managerService.remove(id);
  }

  @Get('test/ping')
  @HttpCode(HttpStatus.OK)
  async test(): Promise<{ message: string }> {
    return { message: 'Manager controller is working!' };
  }
} 