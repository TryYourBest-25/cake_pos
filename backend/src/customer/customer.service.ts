import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AccountService } from '../account/account.service';
import { customer, Prisma, gender_enum } from '../generated/prisma/client';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { BulkDeleteCustomerDto } from './dto/bulk-delete-customer.dto';
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';
import { ROLES } from '../auth/constants/roles.constant';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { CreateAccountDto } from '../account/dto/create-account.dto';
import { UpdateAccountDto } from '../account/dto/update-account.dto';

@Injectable()
export class CustomerService {
  constructor(
    private prisma: PrismaService,
    private accountService: AccountService,
  ) {}

  async create(createCustomerDto: CreateCustomerDto): Promise<customer> {
    const { phone, username, ...customerData } = createCustomerDto;

    try {
      // Sử dụng transaction để đảm bảo tính toàn vẹn dữ liệu
      return await this.prisma.$transaction(async (tx) => {
        // Tìm membership type có required_point thấp nhất
        const lowestMembershipType = await tx.membership_type.findFirst({
          orderBy: { required_point: 'asc' },
        });

        if (!lowestMembershipType) {
          throw new BadRequestException(
            'Không tìm thấy loại thành viên nào trong hệ thống',
          );
        }

        const data: Prisma.customerCreateInput = {
          ...customerData,
          phone,
          current_points: lowestMembershipType.required_point, // Set current_points = required_point
          membership_type: {
            connect: {
              membership_type_id: lowestMembershipType.membership_type_id,
            },
          },
        };

        // Tạo account nếu có username
        if (username) {
          const account = await this.accountService.create({
            username,
            password: '12345678',
            role_id: await this.getCustomerRoleId(),
            is_active: true,
          });
          data.account = { connect: { account_id: account.account_id } };
        }

        return await tx.customer.create({
          data,
          include: { account: true, membership_type: true },
        });
      });
    } catch (error) {
      throw this.handleCreateError(error, phone);
    }
  }

  /**
   * Xử lý lỗi khi tạo customer
   */
  private handleCreateError(error: any, phone: string): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          const fieldDescription = this.getUniqueConstraintField(error, phone);
          throw new ConflictException(
            `Khách hàng đã tồn tại với ${fieldDescription}.`,
          );
        case 'P2025':
          throw new BadRequestException('Bản ghi liên quan không tồn tại.');
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
    phone: string,
  ): string {
    if (error.meta && error.meta.target) {
      const target = error.meta.target;
      const targetString = Array.isArray(target)
        ? target.join(', ')
        : String(target);

      if (targetString.includes('phone')) {
        return `số điện thoại '${phone}'`;
      }
      return `thông tin ${targetString}`;
    }
    return 'thông tin duy nhất đã cung cấp';
  }

  /**
   * Kiểm tra xem lỗi có liên quan đến MembershipType không
   */
  private isMembershipTypeError(
    error: Prisma.PrismaClientKnownRequestError,
  ): boolean {
    return !!(
      error.meta &&
      typeof error.meta.cause === 'string' &&
      error.meta.cause.includes('MembershipType')
    );
  }

  /**
   * Lấy role_id cho CUSTOMER
   */
  private async getCustomerRoleId(): Promise<number> {
    const customerRole = await this.prisma.role.findFirst({
      where: { name: ROLES.CUSTOMER },
    });
    if (!customerRole) {
      throw new BadRequestException(
        'Vai trò CUSTOMER không tồn tại trong hệ thống',
      );
    }
    return customerRole.role_id;
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<customer>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.customer.findMany({
        skip,
        take: limit,
        orderBy: { customer_id: 'desc' },
      }),
      this.prisma.customer.count(),
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

  async findOne(id: number): Promise<customer | null> {
    const customerDetails = await this.prisma.customer.findUnique({
      where: { customer_id: id },
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
        membership_type: true,
      },
    });
    if (!customerDetails) {
      throw new NotFoundException(`Khách hàng với ID ${id} không tồn tại`);
    }
    return customerDetails;
  }

  async findByPhone(phone: string): Promise<customer | null> {
    return this.prisma.customer.findUnique({
      where: { phone },
      include: { account: true, membership_type: true },
    });
  }

  async update(
    id: number,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<customer> {
    // Loại bỏ hoàn toàn việc cập nhật membership_type_id và current_points
    const data: Prisma.customerUpdateInput = { ...updateCustomerDto };

    try {
      return await this.prisma.customer.update({
        where: { customer_id: id },
        data,
        include: { account: true, membership_type: true },
      });
    } catch (error) {
      throw this.handleUpdateError(error, id, updateCustomerDto);
    }
  }

  /**
   * Xử lý lỗi khi cập nhật customer
   */
  private handleUpdateError(
    error: any,
    id: number,
    updateDto: UpdateCustomerDto,
  ): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2025':
          throw new NotFoundException(`Khách hàng với ID ${id} không tồn tại.`);
        case 'P2002':
          if (updateDto.phone && this.isPhoneConstraintError(error)) {
            throw new ConflictException(
              `Khách hàng với số điện thoại '${updateDto.phone}' đã tồn tại.`,
            );
          }
          const field = this.getConstraintField(error);
          throw new ConflictException(
            `Vi phạm ràng buộc duy nhất trên: ${field}.`,
          );
        default:
          throw new BadRequestException(`Lỗi cơ sở dữ liệu: ${error.message}`);
      }
    }
    throw error;
  }

  /**
   * Kiểm tra xem lỗi có liên quan đến phone constraint không
   */
  private isPhoneConstraintError(
    error: Prisma.PrismaClientKnownRequestError,
  ): boolean {
    return !!(
      error.meta &&
      error.meta.target &&
      String(error.meta.target).includes('phone')
    );
  }

  /**
   * Lấy thông tin field bị vi phạm constraint
   */
  private getConstraintField(
    error: Prisma.PrismaClientKnownRequestError,
  ): string {
    if (error.meta && error.meta.target) {
      const target = error.meta.target;
      return Array.isArray(target) ? target.join(', ') : String(target);
    }
    return 'trường không xác định';
  }

  async remove(id: number): Promise<customer> {
    try {
      // Sử dụng transaction để đảm bảo tính toàn vẹn dữ liệu
      return await this.prisma.$transaction(async (tx) => {
        const customerWithAccount = await tx.customer.findUnique({
          where: { customer_id: id },
          include: { account: true },
        });

        if (!customerWithAccount) {
          throw new NotFoundException(`Khách hàng với ID ${id} không tồn tại`);
        }

        // Xóa customer trước
        const deletedCustomer = await tx.customer.delete({
          where: { customer_id: id },
        });

        // Xóa account nếu có
        if (customerWithAccount.account) {
          await this.accountService.remove(
            customerWithAccount.account.account_id,
          );
        }

        return deletedCustomer;
      });
    } catch (error) {
      throw this.handleDeleteError(error, id);
    }
  }

  /**
   * Xử lý lỗi khi xóa customer
   */
  private handleDeleteError(error: any, id: number): never {
    if (error instanceof NotFoundException) {
      throw error; // Re-throw NotFoundException đã được xử lý
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2025':
          throw new NotFoundException(`Khách hàng với ID ${id} không tồn tại`);
        case 'P2003':
          throw new ConflictException(
            `Không thể xóa khách hàng với ID ${id} do tồn tại đơn hàng hoặc dữ liệu liên quan khác.`,
          );
        default:
          throw new BadRequestException(`Lỗi cơ sở dữ liệu: ${error.message}`);
      }
    }
    throw error;
  }

  /**
   * Xóa nhiều customer theo danh sách ID
   */
  async bulkDelete(bulkDeleteDto: BulkDeleteCustomerDto): Promise<{
    deleted: number[];
    failed: { id: number; reason: string }[];
    summary: { total: number; success: number; failed: number };
  }> {
    const { ids } = bulkDeleteDto;

    try {
      return await this.prisma.$transaction(async (tx) => {
        // Lấy thông tin customers và accounts liên quan trước khi xóa
        const customersWithAccounts = await tx.customer.findMany({
          where: { customer_id: { in: ids } },
          include: { account: true },
        });

        const foundIds = customersWithAccounts.map((c) => c.customer_id);
        const notFoundIds = ids.filter((id) => !foundIds.includes(id));
        const accountIds = customersWithAccounts
          .filter((c) => c.account)
          .map((c) => c.account!.account_id);

        // Xóa customers bằng deleteMany
        const deleteResult = await tx.customer.deleteMany({
          where: { customer_id: { in: foundIds } },
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
            reason: `Khách hàng với ID ${id} không tồn tại`,
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

  async findByMembershipType(
    membership_type_id: number,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<customer>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.customer.findMany({
        where: { membership_type_id },
        skip,
        take: limit,
        orderBy: { customer_id: 'desc' },
      }),
      this.prisma.customer.count({
        where: { membership_type_id },
      }),
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

  async getCustomerAccount(customerId: number) {
    const customer = await this.prisma.customer.findUnique({
      where: { customer_id: customerId },
      include: {
        account: {
          select: {
            account_id: true,
            username: true,
            role_id: true,
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

    if (!customer) {
      throw new NotFoundException(
        `Khách hàng với ID ${customerId} không tồn tại`,
      );
    }

    if (!customer.account) {
      throw new NotFoundException(
        `Khách hàng với ID ${customerId} không có tài khoản liên kết`,
      );
    }

    return customer.account;
  }

  async createCustomerAccount(
    customerId: number,
    createAccountDto: CreateAccountDto,
  ) {
    const customer = await this.prisma.customer.findUnique({
      where: { customer_id: customerId },
      include: { account: true },
    });

    if (!customer) {
      throw new NotFoundException(
        `Khách hàng với ID ${customerId} không tồn tại`,
      );
    }

    if (customer.account) {
      throw new ConflictException(
        `Khách hàng với ID ${customerId} đã có tài khoản liên kết`,
      );
    }

    // Tạo tài khoản mới
    const newAccount = await this.accountService.create(createAccountDto);

    // Liên kết tài khoản với khách hàng
    const updatedCustomer = await this.prisma.customer.update({
      where: { customer_id: customerId },
      data: { account_id: newAccount.account_id },
      include: {
        account: {
          select: {
            account_id: true,
            username: true,
            role_id: true,
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

    return updatedCustomer.account;
  }

  async updateCustomerAccount(
    customerId: number,
    updateAccountDto: UpdateAccountDto,
  ) {
    const customer = await this.prisma.customer.findUnique({
      where: { customer_id: customerId },
      include: { account: true },
    });

    if (!customer) {
      throw new NotFoundException(
        `Khách hàng với ID ${customerId} không tồn tại`,
      );
    }

    if (!customer.account) {
      throw new NotFoundException(
        `Khách hàng với ID ${customerId} không có tài khoản liên kết`,
      );
    }

    return this.accountService.update(
      customer.account.account_id,
      updateAccountDto,
    );
  }

  async lockCustomerAccount(customerId: number, isLocked: boolean) {
    const customer = await this.prisma.customer.findUnique({
      where: { customer_id: customerId },
      include: { account: true },
    });

    if (!customer) {
      throw new NotFoundException(
        `Khách hàng với ID ${customerId} không tồn tại`,
      );
    }

    if (!customer.account) {
      throw new NotFoundException(
        `Khách hàng với ID ${customerId} không có tài khoản liên kết`,
      );
    }

    return this.accountService.update(customer.account.account_id, {
      is_locked: isLocked,
    });
  }
}
