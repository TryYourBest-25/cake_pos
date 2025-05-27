import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { customer } from '../generated/prisma/client'; // Adjusted import

@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCustomerDto: CreateCustomerDto): Promise<customer> {
    return this.customerService.create(createCustomerDto);
  }

  @Get()
  async findAll(): Promise<customer[]> {
    return this.customerService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<customer | null> {
    return this.customerService.findOne(id);
  }

  @Get('phone/:phone')
  async findByPhone(@Param('phone') phone: string): Promise<customer | null> {
    return this.customerService.findByPhone(phone);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ): Promise<customer> {
    return this.customerService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.customerService.remove(id);
  }

  @Get('test/ping')
  @HttpCode(HttpStatus.OK)
  async test(): Promise<{ message: string }> {
    return { message: 'Customer controller is working!' };
  }
} 