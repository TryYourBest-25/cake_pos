import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { employee } from '../generated/prisma/client'; // Điều chỉnh nếu cần

@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createEmployeeDto: CreateEmployeeDto): Promise<employee> {
    return this.employeeService.create(createEmployeeDto);
  }

  @Get()
  async findAll(): Promise<employee[]> { // Có thể thêm query params để phân trang, filter
    return this.employeeService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<employee | null> {
    return this.employeeService.findOne(id);
  }

  @Get('email/:email') // Endpoint ví dụ để tìm theo email
  async findByEmail(@Param('email') email: string): Promise<employee | null> {
    return this.employeeService.findByEmail(email);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ): Promise<employee> {
    return this.employeeService.update(id, updateEmployeeDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.employeeService.remove(id);
  }

  @Get('test/ping')
  @HttpCode(HttpStatus.OK)
  async test(): Promise<{ message: string }> {
    return { message: 'Employee controller is working!' };
  }
} 