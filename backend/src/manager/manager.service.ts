import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { manager, Prisma } from '../generated/prisma/client';
import { CreateManagerDto } from './dto/create-manager.dto';
import { UpdateManagerDto } from './dto/update-manager.dto';

@Injectable()
export class ManagerService {
  constructor(private prisma: PrismaService) {}

  async create(createManagerDto: CreateManagerDto): Promise<manager> {
    const { email, account_id, ...restOfDto } = createManagerDto;

    const existingManagerByEmail = await this.prisma.manager.findUnique({
      where: { email },
    });
    if (existingManagerByEmail) {
      throw new ConflictException(`Quản lý với email '${email}' đã tồn tại.`);
    }

    const data: Prisma.managerCreateInput = {
      ...restOfDto,
      email,
      account: { // Giả định account là quan hệ bắt buộc
        connect: { account_id },
      },
    };

    try {
      return await this.prisma.manager.create({
        data,
        include: { account: true }, 
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          let fieldDescription = 'provided unique information';
          if (error.meta && error.meta.target) {
            const target = error.meta.target as string[];
            if (target.includes('email')) fieldDescription = `email '${email}'`;
          }
          throw new ConflictException(`Quản lý đã tồn tại với ${fieldDescription}.`);
        }
        if (error.code === 'P2025') {
          throw new BadRequestException(`Tài khoản với ID ${account_id} không tồn tại hoặc bản ghi liên quan khác bị thiếu.`);
        }
      }
      throw error;
    }
  }

  async findAll(): Promise<manager[]> {
    return this.prisma.manager.findMany({
      include: { account: true },
    });
  }

  async findOne(manager_id: number): Promise<manager | null> {
    const mgr = await this.prisma.manager.findUnique({
      where: { manager_id }, // Giả sử khóa chính là manager_id
      include: { account: true },
    });
    if (!mgr) {
      throw new NotFoundException(`Quản lý với ID ${manager_id} không tồn tại`);
    }
    return mgr;
  }

  async findByEmail(email: string): Promise<manager | null> {
    return this.prisma.manager.findUnique({
        where: { email },
        include: { account: true },
    });
  }

  async update(manager_id: number, updateManagerDto: UpdateManagerDto): Promise<manager> {
    const { account_id, ...restOfData } = updateManagerDto;
    
    const data: Prisma.managerUpdateInput = { ...restOfData };

    if (account_id !== undefined) {
        data.account = { connect: { account_id } }; 
    }

    try {
      return await this.prisma.manager.update({
        where: { manager_id }, // Giả sử khóa chính là manager_id
        data,
        include: { account: true },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          let message = `Update failed: Manager with ID ${manager_id} not found.`;
          if (error.meta && typeof error.meta.cause === 'string' && error.meta.cause.startsWith('Record to update not found')){
            // Mặc định
          } else if (account_id) {
             message = `Update failed: Account with ID ${account_id} not found, or other related record is missing.`
          }
          throw new NotFoundException(message);
        }
        if (error.code === 'P2002') {
          throw new ConflictException('Không thể cập nhật quản lý, vi phạm ràng buộc duy nhất (ví dụ: email đã tồn tại).');
        }
      }
      throw error;
    }
  }

  async remove(manager_id: number): Promise<manager> {
    try {
      return await this.prisma.manager.delete({
        where: { manager_id }, // Giả sử khóa chính là manager_id
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Quản lý với ID ${manager_id} không tồn tại`);
        }
        if (error.code === 'P2003') { 
            throw new ConflictException(`Manager with ID ${manager_id} cannot be deleted due to existing relations.`);
        }
      }
      throw error;
    }
  }
} 