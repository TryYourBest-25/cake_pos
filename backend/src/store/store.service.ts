import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { store, Prisma } from '../generated/prisma/client';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';

@Injectable()
export class StoreService {
  constructor(private prisma: PrismaService) {}

  async create(createStoreDto: CreateStoreDto): Promise<store> {
    const {
      name,
      email,
      phone,
      opening_time,
      closing_time,
      opening_date,
      ...rest
    } = createStoreDto;

    // Prisma có thể tự động parse date strings (YYYY-MM-DD) và time strings (HH:mm:ss)
    // khi kiểu trong schema là DateTime. Nếu không, cần chuyển đổi thủ công.
    // Ví dụ: new Date(`1970-01-01T${opening_time}Z`) cho thời gian.

    const storeData: Prisma.storeCreateInput = {
      ...rest,
      name,
      email,
      phone,
      opening_date: new Date(opening_date), // Đảm bảo là Date object
      opening_time: new Date(`1970-01-01T${opening_time}`), // Tạo Date với ngày giả định
      closing_time: new Date(`1970-01-01T${closing_time}`), // Tạo Date với ngày giả định
    };

    try {
      return await this.prisma.store.create({
        data: storeData,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          // Kiểm tra xem trường nào gây ra lỗi unique constraint
          const target = error.meta?.target as string[];
          if (target?.includes('email')) {
            throw new ConflictException(
              `Cửa hàng với email '${email}' đã tồn tại.`,
            );
          }
          if (target?.includes('name')) {
            // Giả sử name cũng có thể là unique
            throw new ConflictException(
              `Cửa hàng với tên '${name}' đã tồn tại.`,
            );
          }
          // Thêm các kiểm tra khác nếu cần (vd: phone, tax_code nếu chúng unique)
          throw new ConflictException(
            'A unique constraint violation occurred.',
          );
        }
      }
      throw error;
    }
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResult<store>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.store.findMany({
        skip,
        take: limit,
        orderBy: { store_id: 'desc' },
      }),
      this.prisma.store.count(),
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

  async findOne(id: number): Promise<store | null> {
    const store = await this.prisma.store.findUnique({
      where: { store_id: id },
    });
    if (!store) {
      throw new NotFoundException(`Cửa hàng với ID ${id} không tồn tại.`);
    }
    return store;
  }

  async getDefaultStore(): Promise<store | null> {
    // Lấy cửa hàng đầu tiên (có thể là cửa hàng chính)
    // Hoặc có thể thêm field is_default trong database
    const store = await this.prisma.store.findFirst({
      orderBy: { store_id: 'asc' },
    });
    
    if (!store) {
      throw new NotFoundException('Không tìm thấy thông tin cửa hàng.');
    }
    
    return store;
  }

  async update(id: number, updateStoreDto: UpdateStoreDto): Promise<store> {
    const { email, name, opening_date, opening_time, closing_time, ...rest } =
      updateStoreDto;

    // Kiểm tra sự tồn tại của store trước khi cập nhật
    await this.findOne(id);

    const dataToUpdate: Prisma.storeUpdateInput = { ...rest };

    if (email) dataToUpdate.email = email;
    if (name) dataToUpdate.name = name;
    if (opening_date) dataToUpdate.opening_date = new Date(opening_date);
    if (opening_time)
      dataToUpdate.opening_time = new Date(`1970-01-01T${opening_time}`);
    if (closing_time)
      dataToUpdate.closing_time = new Date(`1970-01-01T${closing_time}`);

    try {
      return await this.prisma.store.update({
        where: { store_id: id },
        data: dataToUpdate,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const target = error.meta?.target as string[];
        if (target?.includes('email') && email) {
          throw new ConflictException(
            `Cửa hàng với email '${email}' đã tồn tại.`,
          );
        }
        if (target?.includes('name') && name) {
          throw new ConflictException(`Cửa hàng với tên '${name}' đã tồn tại.`);
        }
        throw new ConflictException(
          'A unique constraint violation occurred during update.',
        );
      }
      throw error;
    }
  }

  async remove(id: number): Promise<store> {
    // Kiểm tra sự tồn tại trước khi xóa
    await this.findOne(id);
    try {
      return await this.prisma.store.delete({
        where: { store_id: id },
      });
    } catch (error) {
      // Xử lý lỗi P2025 (Record to delete does not exist) đã được findOne xử lý
      // Xử lý các lỗi liên quan đến foreign key constraints nếu store có liên kết
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          // Foreign key constraint failed
          throw new ConflictException(
            `Cannot delete store with ID ${id} due to existing related records.`,
          );
        }
      }
      throw error;
    }
  }
}
