import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { AccountService } from './account.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
// import { Account } from '@prisma/client'; // Or your specific type from generated client if different
// Tạm thời dùng any cho kiểu trả về của Account, sẽ sửa lại khi service ổn định

@Controller('accounts') // Defines the base route for this controller
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createAccountDto: CreateAccountDto): Promise<any> { // Promise<Account>
    // TODO: Consider returning a more specific DTO/ViewModel instead of the full entity
    return this.accountService.create(createAccountDto);
  }

  @Get()
  async findAll(): Promise<any[]> { // Promise<Account[]>
    return this.accountService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<any> { // Promise<Account | null>
    return this.accountService.findOne(id);
  }

  // Example: Get account by username (if you have such a method in service)
  // @Get('username/:username')
  // async findByUsername(@Param('username') username: string): Promise<any> { // Promise<Account | null>
  // return this.accountService.findByUsername(username);
  // }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAccountDto: UpdateAccountDto,
  ): Promise<any> { // Promise<Account>
    return this.accountService.update(id, updateAccountDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK) // Or HttpStatus.NO_CONTENT if not returning the deleted entity
  async remove(@Param('id', ParseIntPipe) id: number): Promise<any> { // Promise<Account>
    return this.accountService.remove(id);
  }

  /**
   * @backend/nestjs-general-guidelines
   * Add a admin/test method to each controller as a smoke test.
   */
  @Get('admin/test')
  adminTest(): string {
    return 'Account controller is working!';
  }
} 