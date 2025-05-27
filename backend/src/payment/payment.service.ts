import { Injectable, NotFoundException, BadRequestException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { payment, Prisma, order as OrderModel, payment_method as PaymentMethodModel, payment_status_enum } from '../generated/prisma/client';
import { CreatePaymentDto, PaymentStatusEnum as PaymentStatusDtoEnum } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Decimal } from '@prisma/client/runtime/library';

// Định nghĩa kiểu cho Payment bao gồm các relations cần thiết
type PaymentWithRelations = Prisma.paymentGetPayload<{
  include: { 
    order: true; 
    payment_method: true;
  }
}>;

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  async create(createPaymentDto: CreatePaymentDto): Promise<PaymentWithRelations> {
    const { order_id, payment_method_id, amount_paid, status, payment_time } = createPaymentDto;

    const order = await this.prisma.order.findUnique({
      where: { order_id },
    });
    if (!order) {
      throw new NotFoundException(`Order with ID ${order_id} not found.`);
    }

    const paymentMethod = await this.prisma.payment_method.findUnique({
      where: { payment_method_id },
    });
    if (!paymentMethod) {
      throw new NotFoundException(`PaymentMethod with ID ${payment_method_id} not found.`);
    }

    const orderFinalAmount = new Decimal(order.final_amount || order.total_amount || 0);
    const paidAmount = new Decimal(amount_paid);
    let changeAmount = new Decimal(0);

    if (paidAmount.greaterThan(orderFinalAmount)) {
      changeAmount = paidAmount.minus(orderFinalAmount);
    }

    const paymentData: Prisma.paymentCreateInput = {
      status: (status as payment_status_enum) || payment_status_enum.PROCESSING,
      amount_paid: paidAmount,
      change_amount: changeAmount,
      payment_time: payment_time ? new Date(payment_time) : new Date(),
      order: {
        connect: { order_id },
      },
      payment_method: {
        connect: { payment_method_id },
      },
    };

    try {
      const newPayment = await this.prisma.payment.create({ 
        data: paymentData,
        include: { order: true, payment_method: true }
      });
      return newPayment;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') { 
            throw new NotFoundException(`Failed to create payment. Related order or payment method not found.`);
        }
      }
      console.error("Error creating payment:", error);
      throw new InternalServerErrorException('Could not create payment.');
    }
  }

  async findAll(orderId?: number): Promise<PaymentWithRelations[]> {
    return this.prisma.payment.findMany({
      where: orderId ? { order_id: orderId } : {},
      include: { order: true, payment_method: true },
      orderBy: { payment_time: 'desc' }
    });
  }

  async findOne(id: number): Promise<PaymentWithRelations> {
    const payment = await this.prisma.payment.findUnique({
      where: { payment_id: id },
      include: { order: true, payment_method: true },
    });
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found.`);
    }
    return payment;
  }

  async update(id: number, updatePaymentDto: UpdatePaymentDto): Promise<PaymentWithRelations> {
    const existingPayment = await this.findOne(id); 

    const { amount_paid, status, payment_time } = updatePaymentDto;
    
    const dataToUpdate: Prisma.paymentUpdateInput = {};

    if (status) dataToUpdate.status = status as payment_status_enum;
    if (payment_time) dataToUpdate.payment_time = new Date(payment_time);

    let newPaidAmount: Decimal | undefined;
    if (amount_paid !== undefined) {
      newPaidAmount = new Decimal(amount_paid);
      dataToUpdate.amount_paid = newPaidAmount;

      const orderFinalAmount = new Decimal(existingPayment.order.final_amount || existingPayment.order.total_amount || 0);
      let newChangeAmount = new Decimal(0);
      if (newPaidAmount.greaterThan(orderFinalAmount)) {
        newChangeAmount = newPaidAmount.minus(orderFinalAmount);
      }
      dataToUpdate.change_amount = newChangeAmount;
    }

    try {
      const updatedPayment = await this.prisma.payment.update({
        where: { payment_id: id },
        data: dataToUpdate,
        include: { order: true, payment_method: true },
      });
      return updatedPayment;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
         console.error(`Prisma error updating payment ${id}:`, error.code, error.meta);
      } else {
        console.error(`Error updating payment ${id}:`, error);
      }
      throw new InternalServerErrorException('Could not update payment.');
    }
  }

  async remove(id: number): Promise<PaymentWithRelations> {
    const paymentToDelete = await this.findOne(id); 
    try {
      await this.prisma.payment.delete({
        where: { payment_id: id },
      });
      return paymentToDelete;
    } catch (error) {
      console.error(`Error deleting payment ${id}:`, error);
      throw new InternalServerErrorException('Could not delete payment.');
    }
  }
} 