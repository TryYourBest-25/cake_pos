import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AccountService } from '../account/account.service';
import { manager, Prisma } from '../generated/prisma/client';
import { CreateManagerDto } from './dto/create-manager.dto';
import { UpdateManagerDto } from './dto/update-manager.dto';
import { BulkDeleteManagerDto } from './dto/bulk-delete-manager.dto';
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';
import { ROLES } from '../auth/constants/roles.constant';

@Injectable()
export class ManagerService {
  constructor(
    private prisma: PrismaService,
    private accountService: AccountService,
  ) {}

  async create(createManagerDto: CreateManagerDto): Promise<manager> {
    const { email, username, password, ...managerData } = createManagerDto;

    // Kiểm tra email manager đã tồn tại chưa
    const existingManagerByEmail = await this.prisma.manager.findUnique({
      where: { email },
    });
    if (existingManagerByEmail) {
      throw new ConflictException(`Quản lý với email '${email}' đã tồn tại.`);
    }

    try {
      // Bước 1: Tạo account với role MANAGER
      const account = await this.accountService.create({
        username,
        password,
        role_id: await this.getManagerRoleId(),
        is_active: true,
      });

      // Bước 2: Tạo manager record với account_id
      const data: Prisma.managerCreateInput = {
        ...managerData,
        email,
        account: {
          connect: { account_id: account.account_id },
        },
      };

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
      }
      throw error;
    }
  }

  /**
   * Lấy role_id cho MANAGER
   */
  private async getManagerRoleId(): Promise<number> {
    const managerRole = await this.prisma.role.findFirst({
      where: { name: ROLES.MANAGER },
    });
    if (!managerRole) {
      throw new BadRequestException('Vai trò MANAGER không tồn tại trong hệ thống');
    }
    return managerRole.role_id;
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResult<manager>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.manager.findMany({
        skip,
        take: limit,
        orderBy: { manager_id: 'desc' },
      }),
      this.prisma.manager.count(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async findOne(manager_id: number): Promise<manager | null> {
    const mgr = await this.prisma.manager.findUnique({
      where: { manager_id },
      include: { 
        account: {
          select: {
            account_id: true,
            role_id: true,
            username: true,
            is_active: true,
            is_locked: true,
            last_login: true,
            created_at: true,
            updated_at: true,
            role: true,
          }
        }
      },
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
    // Chỉ cập nhật thông tin manager, không cập nhật account
    const { ...managerData } = updateManagerDto;
    
    const data: Prisma.managerUpdateInput = { ...managerData };

    try {
      return await this.prisma.manager.update({
        where: { manager_id },
        data,
        include: { account: true },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Quản lý với ID ${manager_id} không tồn tại`);
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
      const managerWithAccount = await this.prisma.manager.findUnique({
        where: { manager_id },
        include: { account: true },
      });

      if (!managerWithAccount) {
        throw new NotFoundException(`Quản lý với ID ${manager_id} không tồn tại`);
      }
      
      // Xóa manager trước
      const deletedManager = await this.prisma.manager.delete({
        where: { manager_id },
      });

      // Xóa account liên quan
      if (managerWithAccount.account) {
        await this.accountService.remove(managerWithAccount.account.account_id);
      }

      return deletedManager;
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

  /**
   * Xóa nhiều manager theo danh sách ID
   */
  async bulkDelete(bulkDeleteDto: BulkDeleteManagerDto): Promise<{
    deleted: number[];
    failed: { id: number; reason: string }[];
    summary: { total: number; success: number; failed: number };
  }> {
    const { ids } = bulkDeleteDto;
    const deleted: number[] = [];
    const failed: { id: number; reason: string }[] = [];

    for (const id of ids) {
      try {
        await this.remove(id);
        deleted.push(id);
      } catch (error) {
        failed.push({
          id,
          reason: error.message || 'Lỗi không xác định',
        });
      }
    }

    return {
      deleted,
      failed,
      summary: {
        total: ids.length,
        success: deleted.length,
        failed: failed.length,
      },
    };
  }
}