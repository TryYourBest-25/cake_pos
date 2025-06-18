import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AccountService } from '../account/account.service';
import { manager, Prisma } from '../generated/prisma/client';
import { CreateManagerDto } from './dto/create-manager.dto';
import { UpdateManagerDto } from './dto/update-manager.dto';
import { BulkDeleteManagerDto } from './dto/bulk-delete-manager.dto';
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';
import { ROLES } from '../auth/constants/roles.constant';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ManagerService {
  constructor(
    private prisma: PrismaService,
    private accountService: AccountService,
  ) {}

  async create(createManagerDto: CreateManagerDto): Promise<manager> {
    const { email, username, ...managerData } = createManagerDto;

    // Kiểm tra email manager đã tồn tại chưa
    const existingManagerByEmail = await this.prisma.manager.findUnique({
      where: { email },
    });
    if (existingManagerByEmail) {
      throw new ConflictException(`Quản lý với email '${email}' đã tồn tại.`);
    }

    try {
      // Sử dụng transaction để đảm bảo tính toàn vẹn dữ liệu
      return await this.prisma.$transaction(async (tx) => {
        // Bước 1: Tạo account với role MANAGER
        const account = await this.accountService.create({
          username,
          password: '12345678',
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

        return await tx.manager.create({
          data,
          include: { account: true },
        });
      });
    } catch (error) {
      throw this.handleCreateError(error, email);
    }
  }

  /**
   * Xử lý lỗi khi tạo manager
   */
  private handleCreateError(error: any, email: string): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          const fieldDescription = this.getUniqueConstraintField(error, email);
          throw new ConflictException(
            `Quản lý đã tồn tại với ${fieldDescription}.`,
          );
        default:
          throw new BadRequestException(`Lỗi cơ sở dữ liệu: ${error.message}`);
      }
    }
    throw error;
  }

  /**
   * Lấy thông tin field bị vi phạm unique constraint
   */
  private getUniqueConstraintField(
    error: Prisma.PrismaClientKnownRequestError,
    email: string,
  ): string {
    if (error.meta && error.meta.target) {
      const target = error.meta.target as string[];
      if (target.includes('email')) return `email '${email}'`;
    }
    return 'thông tin duy nhất đã cung cấp';
  }

  /**
   * Lấy role_id cho MANAGER
   */
  private async getManagerRoleId(): Promise<number> {
    const managerRole = await this.prisma.role.findFirst({
      where: { name: ROLES.MANAGER },
    });
    if (!managerRole) {
      throw new BadRequestException(
        'Vai trò MANAGER không tồn tại trong hệ thống',
      );
    }
    return managerRole.role_id;
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<manager>> {
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
          },
        },
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

  async update(
    manager_id: number,
    updateManagerDto: UpdateManagerDto,
  ): Promise<manager> {
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
      throw this.handleUpdateError(error, manager_id);
    }
  }

  /**
   * Xử lý lỗi khi cập nhật manager
   */
  private handleUpdateError(error: any, manager_id: number): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2025':
          throw new NotFoundException(
            `Quản lý với ID ${manager_id} không tồn tại`,
          );
        case 'P2002':
          throw new ConflictException(
            'Không thể cập nhật quản lý, vi phạm ràng buộc duy nhất (ví dụ: email đã tồn tại).',
          );
        default:
          throw new BadRequestException(`Lỗi cơ sở dữ liệu: ${error.message}`);
      }
    }
    throw error;
  }

  async remove(manager_id: number): Promise<manager> {
    try {
      // Sử dụng transaction để đảm bảo tính toàn vẹn dữ liệu
      return await this.prisma.$transaction(async (tx) => {
        const managerWithAccount = await tx.manager.findUnique({
          where: { manager_id },
          include: { account: true },
        });

        if (!managerWithAccount) {
          throw new NotFoundException(
            `Quản lý với ID ${manager_id} không tồn tại`,
          );
        }

        // Xóa manager trước
        const deletedManager = await tx.manager.delete({
          where: { manager_id },
        });

        // Xóa account liên quan
        if (managerWithAccount.account) {
          await this.accountService.remove(
            managerWithAccount.account.account_id,
          );
        }

        return deletedManager;
      });
    } catch (error) {
      throw this.handleDeleteError(error, manager_id);
    }
  }

  /**
   * Xử lý lỗi khi xóa manager
   */
  private handleDeleteError(error: any, manager_id: number): never {
    if (error instanceof NotFoundException) {
      throw error; // Re-throw NotFoundException đã được xử lý
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2025':
          throw new NotFoundException(
            `Quản lý với ID ${manager_id} không tồn tại`,
          );
        case 'P2003':
          throw new ConflictException(
            `Không thể xóa quản lý với ID ${manager_id} do tồn tại dữ liệu liên quan.`,
          );
        default:
          throw new BadRequestException(`Lỗi cơ sở dữ liệu: ${error.message}`);
      }
    }
    throw error;
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

    try {
      return await this.prisma.$transaction(async (tx) => {
        // Lấy thông tin managers và accounts liên quan trước khi xóa
        const managersWithAccounts = await tx.manager.findMany({
          where: { manager_id: { in: ids } },
          include: { account: true },
        });

        const foundIds = managersWithAccounts.map((m) => m.manager_id);
        const notFoundIds = ids.filter((id) => !foundIds.includes(id));
        const accountIds = managersWithAccounts
          .filter((m) => m.account)
          .map((m) => m.account.account_id);

        // Xóa managers bằng deleteMany
        const deleteResult = await tx.manager.deleteMany({
          where: { manager_id: { in: foundIds } },
        });

        // Xóa accounts liên quan nếu có
        if (accountIds.length > 0) {
          await tx.account.deleteMany({
            where: { account_id: { in: accountIds } },
          });
        }

        // Tạo kết quả response
        const failed: { id: number; reason: string }[] = notFoundIds.map(
          (id) => ({
            id,
            reason: `Quản lý với ID ${id} không tồn tại`,
          }),
        );

        return {
          deleted: foundIds,
          failed,
          summary: {
            total: ids.length,
            success: foundIds.length,
            failed: failed.length,
          },
        };
      });
    } catch (error) {
      // Nếu có lỗi trong transaction, trả về tất cả IDs là failed
      const failed: { id: number; reason: string }[] = ids.map((id) => ({
        id,
        reason: error instanceof Error ? error.message : 'Lỗi không xác định',
      }));

      return {
        deleted: [],
        failed,
        summary: {
          total: ids.length,
          success: 0,
          failed: ids.length,
        },
      };
    }
  }

  async lockManagerAccount(managerId: number, isLocked: boolean) {
    const manager = await this.prisma.manager.findUnique({
      where: { manager_id: managerId },
      include: { account: true },
    });

    if (!manager) {
      throw new NotFoundException(`Manager với ID ${managerId} không tồn tại`);
    }

    return this.accountService.update(manager.account.account_id, {
      is_locked: isLocked,
    });
  }

  async updateManagerAccount(managerId: number, accountId: number, updateData: any) {
    // Kiểm tra manager tồn tại
    const manager = await this.prisma.manager.findUnique({
      where: { manager_id: managerId },
      include: { account: true },
    });

    if (!manager) {
      throw new NotFoundException(
        `Manager với ID ${managerId} không tồn tại`,
      );
    }

    // Kiểm tra account thuộc về manager này
    if (manager.account.account_id !== accountId) {
      throw new BadRequestException(
        `Account với ID ${accountId} không thuộc về Manager với ID ${managerId}`,
      );
    }

    return this.accountService.update(accountId, updateData);
  }
}
