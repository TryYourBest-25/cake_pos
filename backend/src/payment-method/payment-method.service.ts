import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { payment_method, Prisma } from '../generated/prisma/client';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';

@Injectable()
export class PaymentMethodService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreatePaymentMethodDto): Promise<payment_method> {
    const { name, description } = createDto;
    try {
      return await this.prisma.payment_method.create({
        data: {
          name,
          description,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        if ((error.meta?.target as string[])?.includes('name')) {
          throw new ConflictException(`Payment method with name '${name}' already exists.`);
        }
        throw new ConflictException('A unique constraint violation occurred.');
      }
      console.error("Error creating payment method:", error);
      throw new InternalServerErrorException('Could not create payment method.');
    }
  }

  async findAll(): Promise<payment_method[]> {
    return this.prisma.payment_method.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: number): Promise<payment_method> {
    const method = await this.prisma.payment_method.findUnique({
      where: { payment_method_id: id },
    });
    if (!method) {
      throw new NotFoundException(`Payment method with ID ${id} not found.`);
    }
    return method;
  }

  async findByName(name: string): Promise<payment_method | null> {
    return this.prisma.payment_method.findUnique({
        where: { name },
    });
  }

  async update(id: number, updateDto: UpdatePaymentMethodDto): Promise<payment_method> {
    await this.findOne(id); // Check for existence
    const { name, description } = updateDto;
    try {
      return await this.prisma.payment_method.update({
        where: { payment_method_id: id },
        data: {
          ...(name && { name }),
          ...(description !== undefined && { description }), // Allow setting description to null or empty string
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        if ((error.meta?.target as string[])?.includes('name') && name) {
          throw new ConflictException(`Payment method with name '${name}' already exists.`);
        }
        throw new ConflictException('A unique constraint violation occurred during update.');
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Payment method with ID ${id} not found for update.`);
      }
      console.error(`Error updating payment method ${id}:`, error);
      throw new InternalServerErrorException('Could not update payment method.');
    }
  }

  async remove(id: number): Promise<payment_method> {
    const methodToDelete = await this.findOne(id); // Check for existence
    try {
      // Trước khi xóa, kiểm tra xem phương thức này có đang được payment nào sử dụng không
      const paymentsUsingMethod = await this.prisma.payment.count({
        where: { payment_method_id: id },
      });
      if (paymentsUsingMethod > 0) {
        throw new ConflictException(
          `Cannot delete payment method ID ${id} as it is currently used by ${paymentsUsingMethod} payment(s).`,
        );
      }
      await this.prisma.payment_method.delete({
        where: { payment_method_id: id },
      });
      return methodToDelete;
    } catch (error) {
      if (error instanceof ConflictException) throw error; // Re-throw conflict exception
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Payment method with ID ${id} not found for deletion.`);
      }
      console.error(`Error deleting payment method ${id}:`, error);
      throw new InternalServerErrorException('Could not delete payment method.');
    }
  }
} 