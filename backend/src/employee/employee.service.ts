import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AccountService } from '../account/account.service';
import { employee, Prisma } from '../generated/prisma/client';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { BulkDeleteEmployeeDto } from './dto/bulk-delete-employee.dto';
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';
import { ROLES } from '../auth/constants/roles.constant';

@Injectable()
export class EmployeeService {
  constructor(
    private prisma: PrismaService,
    private accountService: AccountService,
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto): Promise<employee> {
    const { email, username, password, ...employeeData } = createEmployeeDto;

    // Kiểm tra email employee đã tồn tại chưa
    const existingEmployeeByEmail = await this.prisma.employee.findUnique({
      where: { email },
    });
    if (existingEmployeeByEmail) {
      throw new ConflictException(`Nhân viên với email '${email}' đã tồn tại.`);
    }

    try {
      // Bước 1: Tạo account với role STAFF
      const account = await this.accountService.create({
        username,
        password,
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

      return await this.prisma.employee.create({
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
          throw new ConflictException(`Nhân viên đã tồn tại với ${fieldDescription}.`);
        }
      }
      throw error;
    }
  }

  /**
   * Lấy role_id cho STAFF
   */
  private async getStaffRoleId(): Promise<number> {
    const staffRole = await this.prisma.role.findFirst({
      where: { name: ROLES.STAFF },
    });
    if (!staffRole) {
      throw new BadRequestException('Vai trò STAFF không tồn tại trong hệ thống');
    }
    return staffRole.role_id;
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResult<employee>> {
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
      include: { account: true },
    });
    if (!emp) {
      throw new NotFoundException(`Nhân viên với ID ${employee_id} không tồn tại`);
    }
    return emp;
  }

  async findByEmail(email: string): Promise<employee | null> {
    return this.prisma.employee.findUnique({
        where: { email },
        include: { account: true },
    });
  }

  async update(employee_id: number, updateEmployeeDto: UpdateEmployeeDto): Promise<employee> {
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
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Nhân viên với ID ${employee_id} không tồn tại`);
        }
        if (error.code === 'P2002') {
          throw new ConflictException('Không thể cập nhật nhân viên, vi phạm ràng buộc duy nhất (ví dụ: email đã tồn tại).');
        }
      }
      throw error;
    }
  }

  async remove(employee_id: number): Promise<employee> {
    try {
      const employeeWithAccount = await this.prisma.employee.findUnique({
        where: { employee_id },
        include: { account: true },
      });

      if (!employeeWithAccount) {
        throw new NotFoundException(`Nhân viên với ID ${employee_id} không tồn tại`);
      }
      
      // Xóa employee trước
      const deletedEmployee = await this.prisma.employee.delete({
        where: { employee_id },
      });

      // Xóa account liên quan
      if (employeeWithAccount.account) {
        await this.accountService.remove(employeeWithAccount.account.account_id);
      }

      return deletedEmployee;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Nhân viên với ID ${employee_id} không tồn tại`);
        }
        if (error.code === 'P2003') { 
            throw new ConflictException(`Nhân viên với ID ${employee_id} không thể bị xóa do có quan hệ liên quan.`);
        }
      }
      throw error;
    }
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