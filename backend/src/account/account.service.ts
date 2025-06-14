import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // TODO: Ensure PrismaService exists at this path and is correctly configured.
import { account, Prisma } from '../generated/prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'; // Import specific error type
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import * as bcrypt from 'bcrypt';



@Injectable()
export class AccountService {
  constructor(private prisma: PrismaService) {}

  async create(createAccountDto: CreateAccountDto): Promise<account> {
    const { username, password, role_id, is_active } = createAccountDto;

    const existingUser = await this.prisma.account.findUnique({
      where: { username },
    });
    if (existingUser) {
      throw new ConflictException('Tên đăng nhập đã tồn tại');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      return this.prisma.account.create({
        data: {
          username,
          password_hash: hashedPassword,
          role_id,
          is_active: is_active ?? false,
          is_locked: false,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) { // Use imported error type
        if (error.code === 'P2003') { 
          throw new NotFoundException(`Vai trò với ID ${role_id} không tồn tại.`);
        }
      }
      throw error;
    }
  }

  async findAll(): Promise<account[]> {
    return this.prisma.account.findMany({
      include: {
        role: true,
      }
    });
  }

  async findOne(id: number): Promise<account | null> {
    const acc = await this.prisma.account.findUnique({
      where: { account_id: id },
      include: {
        role: true,
        customer: true,
        employee: true,
        manager: true,
      }
    });
    if (!acc) {
      throw new NotFoundException(`Tài khoản với ID ${id} không tồn tại`);
    }
    return acc;
  }

  async findByUsername(username: string): Promise<account | null> {
    const acc = await this.prisma.account.findUnique({
      where: { username },
      include: { 
        role: true,
      }
    });
    return acc;
  }

  async update(id: number, updateAccountDto: UpdateAccountDto): Promise<account> {
    const { password, ...otherData } = updateAccountDto;
    
    const existingAccount = await this.prisma.account.findUnique({ where: { account_id: id } });
    if (!existingAccount) {
        throw new NotFoundException(`Tài khoản với ID ${id} không tồn tại`);
    }

    if (updateAccountDto.username && updateAccountDto.username !== existingAccount.username) {
        const conflictingUser = await this.prisma.account.findUnique({
            where: { username: updateAccountDto.username },
        });
        if (conflictingUser) {
            throw new ConflictException(`Tên đăng nhập '${updateAccountDto.username}' đã tồn tại.`);
        }
    }
    
    const dataToUpdate: Prisma.accountUpdateInput = { ...otherData };

    if (password) {
      dataToUpdate.password_hash = await bcrypt.hash(password, 10);
    }
    
    try {
      return await this.prisma.account.update({
        where: { account_id: id },
        data: dataToUpdate,
        include: { 
            role: true,
        }
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) { // Use imported error type
        if (error.code === 'P2025') { 
          throw new NotFoundException(`Tài khoản với ID ${id} không tồn tại để cập nhật.`);
        }
        if (error.code === 'P2003' && updateAccountDto.role_id) { 
             throw new NotFoundException(`Vai trò với ID ${updateAccountDto.role_id} không tồn tại.`);
        }
      }
      throw error;
    }
  }

  async remove(id: number): Promise<account> {
    try {
      return await this.prisma.account.delete({
        where: { account_id: id },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) { // Use imported error type
        if (error.code === 'P2025') { 
          throw new NotFoundException(`Tài khoản với ID ${id} không tồn tại`);
        }
      }
      throw error;
    }
  }
} 