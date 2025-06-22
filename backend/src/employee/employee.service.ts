import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AccountService } from '../account/account.service';
import { employee, Prisma } from '../generated/prisma/client';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { BulkDeleteEmployeeDto } from './dto/bulk-delete-employee.dto';
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';
import { ROLES } from '../auth/constants/roles.constant';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EmployeeService {
  constructor(
    private prisma: PrismaService,
    private accountService: AccountService,
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto): Promise<employee> {
    const { email, username, ...employeeData } = createEmployeeDto;

    // Kiểm tra email employee đã tồn tại chưa
    const existingEmployeeByEmail = await this.prisma.employee.findUnique({
      where: { email },
    });
    if (existingEmployeeByEmail) {
      throw new ConflictException(`Nhân viên với email '${email}' đã tồn tại.`);
    }

    try {
      // Sử dụng transaction để đảm bảo tính toàn vẹn dữ liệu
      return await this.prisma.$transaction(async (tx) => {
        // Bước 1: Tạo account với role STAFF
        const account = await this.accountService.create({
          username,
          password: '12345678',
          role_id: await this.getStaffRoleId(),
          is_active: true,
        });

        // Bước 2: Tạo employee record với account_id
        const data: Prisma.employeeCreateInput = {
          ...employeeData,
          email,
          account: {
            connect: { account_id: account.account_id },
          },
        };

        return await tx.employee.create({
          data,
          include: { account: true },
        });
      });
    } catch (error) {
      throw this.handleCreateError(error, email);
    }
  }

  /**
   * Xử lý lỗi khi tạo employee
   */
  private handleCreateError(error: any, email: string): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          const fieldDescription = this.getUniqueConstraintField(error, email);
          throw new ConflictException(
            `Nhân viên đã tồn tại với ${fieldDescription}.`,
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
   * Lấy role_id cho STAFF
   */
  private async getStaffRoleId(): Promise<number> {
    const staffRole = await this.prisma.role.findFirst({
      where: { name: ROLES.STAFF },
    });
    if (!staffRole) {
      throw new BadRequestException(
        'Vai trò STAFF không tồn tại trong hệ thống',
      );
    }
    return staffRole.role_id;
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<employee>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.employee.findMany({
        skip,
        take: limit,
        orderBy: { employee_id: 'desc' },
      }),
      this.prisma.employee.count(),
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

  async findOne(employee_id: number): Promise<employee | null> {
    const emp = await this.prisma.employee.findUnique({
      where: { employee_id },
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
    if (!emp) {
      throw new NotFoundException(
        `Nhân viên với ID ${employee_id} không tồn tại`,
      );
    }
    return emp;
  }

  async findByEmail(email: string): Promise<employee | null> {
    return this.prisma.employee.findUnique({
      where: { email },
      include: { account: true },
    });
  }

  async update(
    employee_id: number,
    updateEmployeeDto: UpdateEmployeeDto,
  ): Promise<employee> {
    // Chỉ cập nhật thông tin employee, không cập nhật account
    const { ...employeeData } = updateEmployeeDto;

    const data: Prisma.employeeUpdateInput = { ...employeeData };

    try {
      return await this.prisma.employee.update({
        where: { employee_id },
        data,
        include: { account: true },
      });
    } catch (error) {
      throw this.handleUpdateError(error, employee_id);
    }
  }

  /**
   * Xử lý lỗi khi cập nhật employee
   */
  private handleUpdateError(error: any, employee_id: number): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2025':
          throw new NotFoundException(
            `Nhân viên với ID ${employee_id} không tồn tại`,
          );
        case 'P2002':
          throw new ConflictException(
            'Không thể cập nhật nhân viên, vi phạm ràng buộc duy nhất (ví dụ: email đã tồn tại).',
          );
        default:
          throw new BadRequestException(`Lỗi cơ sở dữ liệu: ${error.message}`);
      }
    }
    throw error;
  }

  async remove(employee_id: number): Promise<employee> {
    try {
      // Sử dụng transaction để đảm bảo tính toàn vẹn dữ liệu
      return await this.prisma.$transaction(async (tx) => {
        const employeeWithAccount = await tx.employee.findUnique({
          where: { employee_id },
          include: { account: true },
        });

        if (!employeeWithAccount) {
          throw new NotFoundException(
            `Nhân viên với ID ${employee_id} không tồn tại`,
          );
        }

        // Xóa employee trước
        const deletedEmployee = await tx.employee.delete({
          where: { employee_id },
        });

        // Xóa account liên quan
        if (employeeWithAccount.account) {
          await this.accountService.remove(
            employeeWithAccount.account.account_id,
          );
        }

        return deletedEmployee;
      });
    } catch (error) {
      throw this.handleDeleteError(error, employee_id);
    }
  }

  /**
   * Xử lý lỗi khi xóa employee
   */
  private handleDeleteError(error: any, employee_id: number): never {
    if (error instanceof NotFoundException) {
      throw error; // Re-throw NotFoundException đã được xử lý
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2025':
          throw new NotFoundException(
            `Nhân viên với ID ${employee_id} không tồn tại`,
          );
        case 'P2003':
          throw new ConflictException(
            `Không thể xóa nhân viên với ID ${employee_id} do tồn tại dữ liệu liên quan.`,
          );
        default:
          throw new BadRequestException(`Lỗi cơ sở dữ liệu: ${error.message}`);
      }
    }
    throw error;
  }

  /**
   * Xóa nhiều employee theo danh sách ID
   */
  async bulkDelete(bulkDeleteDto: BulkDeleteEmployeeDto): Promise<{
    deleted: number[];
    failed: { id: number; reason: string }[];
    summary: { total: number; success: number; failed: number };
  }> {
    const { ids } = bulkDeleteDto;

    try {
      return await this.prisma.$transaction(async (tx) => {
        // Lấy thông tin employees và accounts liên quan trước khi xóa
        const employeesWithAccounts = await tx.employee.findMany({
          where: { employee_id: { in: ids } },
          include: { account: true },
        });

        const foundIds = employeesWithAccounts.map((e) => e.employee_id);
        const notFoundIds = ids.filter((id) => !foundIds.includes(id));
        const accountIds = employeesWithAccounts
          .filter((e) => e.account)
          .map((e) => e.account.account_id);

        // Xóa employees bằng deleteMany
        const deleteResult = await tx.employee.deleteMany({
          where: { employee_id: { in: foundIds } },
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
            reason: `Nhân viên với ID ${id} không tồn tại`,
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

  async lockEmployeeAccount(employeeId: number, isLocked: boolean) {
    const employee = await this.prisma.employee.findUnique({
      where: { employee_id: employeeId },
      include: { account: true },
    });

    if (!employee) {
      throw new NotFoundException(
        `Employee với ID ${employeeId} không tồn tại`,
      );
    }

    return this.accountService.update(employee.account.account_id, {
      is_locked: isLocked,
    });
  }

  async updateEmployeeAccount(employeeId: number, accountId: number, updateData: any) {
    // Kiểm tra employee tồn tại
    const employee = await this.prisma.employee.findUnique({
      where: { employee_id: employeeId },
      include: { account: true },
    });

    if (!employee) {
      throw new NotFoundException(
        `Employee với ID ${employeeId} không tồn tại`,
      );
    }

    // Kiểm tra account thuộc về employee này
    if (employee.account.account_id !== accountId) {
      throw new BadRequestException(
        `Account với ID ${accountId} không thuộc về Employee với ID ${employeeId}`,
      );
    }

    return this.accountService.update(accountId, updateData);
  }
}
