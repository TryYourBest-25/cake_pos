import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AccountService } from '../account/account.service';
import { customer, Prisma, gender_enum } from '../generated/prisma/client';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { BulkDeleteCustomerDto } from './dto/bulk-delete-customer.dto';
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';
import { ROLES } from '../auth/constants/roles.constant';

@Injectable()
export class CustomerService {
  constructor(
    private prisma: PrismaService,
    private accountService: AccountService,
  ) {}

  async create(createCustomerDto: CreateCustomerDto): Promise<customer> {
    const { phone, username, password, membership_type_id, ...customerData } = createCustomerDto;
    
    // Kiểm tra customer với phone đã tồn tại chưa
    const existingCustomer = await this.prisma.customer.findUnique({
      where: { phone },
    });
    if (existingCustomer) {
      throw new ConflictException(`Khách hàng với số điện thoại '${phone}' đã tồn tại.`);
    }

    const data: Prisma.customerCreateInput = {
      ...customerData,
      phone,
      membership_type: { connect: { membership_type_id } },
    };

    // Tạo account nếu có username và password
    if (username && password) {
      try {
        const account = await this.accountService.create({
          username,
          password,
          role_id: await this.getCustomerRoleId(),
          is_active: true,
        });
        data.account = { connect: { account_id: account.account_id } };
      } catch (error) {
        throw error;
      }
    }

    try {
      return await this.prisma.customer.create({
        data,
        include: { account: true, membership_type: true },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          let field = 'unknown field';
          if (error.meta && error.meta.target) {
            const target = error.meta.target;
            if (typeof target === 'string') {
              field = target;
            } else if (Array.isArray(target) && target.length > 0 && typeof target[0] === 'string') {
              field = target.join(', ');
            }
          }
          if (field.includes('phone')) {
            throw new ConflictException(`Khách hàng với số điện thoại '${phone}' đã tồn tại.`);
          }
          throw new ConflictException(`Trường ${field} đã tồn tại.`);
        }
        if (error.code === 'P2025') {
          let causeMessage = 'Related record not found.';
          if (error.meta && typeof error.meta.cause === 'string') {
            const cause = error.meta.cause as string;
            if (cause.includes('MembershipType')) {
              throw new BadRequestException(`Loại thành viên với ID ${membership_type_id} không tồn tại.`);
            }
            causeMessage = cause;
          }
          throw new BadRequestException(causeMessage);
        }
      }
      throw error;
    }
  }

  /**
   * Lấy role_id cho CUSTOMER
   */
  private async getCustomerRoleId(): Promise<number> {
    const customerRole = await this.prisma.role.findFirst({
      where: { name: ROLES.CUSTOMER },
    });
    if (!customerRole) {
      throw new BadRequestException('Vai trò CUSTOMER không tồn tại trong hệ thống');
    }
    return customerRole.role_id;
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResult<customer>> {
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
      include: { account: true, membership_type: true, order: false }, 
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

  async update(id: number, updateCustomerDto: UpdateCustomerDto): Promise<customer> {
    const { membership_type_id, ...customerData } = updateCustomerDto;
    
    const data: Prisma.customerUpdateInput = { ...customerData };

    if (membership_type_id !== undefined && membership_type_id !== null) {
        data.membership_type = { connect: { membership_type_id } };
    } else if (membership_type_id === null) {
        console.warn(`Attempted to set membership_type_id to null for customer ${id}, but it's a required relation. This will be ignored.`);
    }

    try {
      return await this.prisma.customer.update({
        where: { customer_id: id },
        data,
        include: { account: true, membership_type: true },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          let message = `Customer with ID ${id} not found or a related record is missing.`;
          if (error.meta && typeof error.meta.cause === 'string') {
            const cause = error.meta.cause as string;
            if (cause.startsWith('Record to update not found')) {
              message = `Customer with ID ${id} not found.`;
            } else if (membership_type_id && cause.includes('MembershipType')) { // Check if trying to connect to non-existent type
               message = `Membership type with ID ${membership_type_id} not found.`;
            }
          }
          throw new NotFoundException(message);
        }
        if (error.code === 'P2002') {
          let field = 'unknown field';
          if (error.meta && error.meta.target) {
            const target = error.meta.target;
            if (typeof target === 'string') {
              field = target;
            } else if (Array.isArray(target) && target.length > 0 && typeof target[0] === 'string') {
              field = target.join(', ');
            }
          }
          if (updateCustomerDto.phone && field.includes('phone')) {
            throw new ConflictException(`Khách hàng với số điện thoại '${updateCustomerDto.phone}' đã tồn tại.`);
          }
          throw new ConflictException(`A unique constraint violation occurred on: ${field}.`);
        }
      }
      throw error;
    }
  }

  async remove(id: number): Promise<customer> {
    try {
      const customerWithAccount = await this.prisma.customer.findUnique({
        where: { customer_id: id },
        include: { account: true },
      });

      if (!customerWithAccount) {
        throw new NotFoundException(`Khách hàng với ID ${id} không tồn tại`);
      }
      
      // Xóa customer trước
      const deletedCustomer = await this.prisma.customer.delete({
        where: { customer_id: id },
      });

      // Xóa account nếu có
      if (customerWithAccount.account) {
        await this.accountService.remove(customerWithAccount.account.account_id);
      }

      return deletedCustomer;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Khách hàng với ID ${id} không tồn tại`);
        }
         if (error.code === 'P2003') { 
            throw new ConflictException(`Customer with ID ${id} cannot be deleted as they have existing orders or other dependencies.`);
        }
      }
      throw error;
    }
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