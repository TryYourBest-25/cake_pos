import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { customer, Prisma, gender_enum } from '../generated/prisma/client'; // Adjusted import path
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomerService {
  constructor(private prisma: PrismaService) {}

  async create(createCustomerDto: CreateCustomerDto): Promise<customer> {
    const { phone, account_id, membership_type_id, ...restOfDto } = createCustomerDto;
    
    const data: Prisma.customerCreateInput = {
      ...restOfDto,
      phone, // Ensure phone is explicitly passed if not in restOfDto by mistake
      membership_type: { connect: { membership_type_id } },
    };

    if (account_id) {
      data.account = { connect: { account_id } };
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
            throw new ConflictException(`Customer with phone number '${phone}' already exists.`);
          }
          throw new ConflictException(`A unique constraint violation occurred on: ${field}.`);
        }
        if (error.code === 'P2025') {
          let causeMessage = 'Related record not found.';
          if (error.meta && typeof error.meta.cause === 'string') {
            const cause = error.meta.cause as string; // Safe now due to typeof check
            if (cause.includes('Account')) { // Check for relation name or specific part of message
              throw new BadRequestException(`Account with ID ${account_id} not found.`);
            }
            if (cause.includes('MembershipType')) { // Check for relation name
              throw new BadRequestException(`Membership type with ID ${membership_type_id} not found.`);
            }
            causeMessage = cause; // Use the Prisma cause if more specific and not caught above
          }
          // Fallback messages if specific relations not identified in cause
          if (account_id && !data.account) { /* Check if account_id was provided but failed */ }
          if (membership_type_id && !data.membership_type) { /* Check if membership_type_id was provided but failed */ }

          // More specific check if the main record itself is not found (though P2025 for create is usually about relations)
          // For create, P2025 usually means a related record for a connect operation was not found.
          throw new BadRequestException(causeMessage);
        }
      }
      throw error;
    }
  }

  async findAll(): Promise<customer[]> {
    return this.prisma.customer.findMany({ include: { account: true, membership_type: true } });
  }

  async findOne(id: number): Promise<customer | null> {
    const customerDetails = await this.prisma.customer.findUnique({
      where: { customer_id: id },
      include: { account: true, membership_type: true, order: false }, 
    });
    if (!customerDetails) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
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
    const { account_id, membership_type_id, ...restOfData } = updateCustomerDto;
    
    const data: Prisma.customerUpdateInput = { ...restOfData };

    if (account_id !== undefined) {
        data.account = account_id === null ? { disconnect: true } : { connect: { account_id } };
    }
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
            } else if (account_id && cause.includes('Account')) { // Check if trying to connect to non-existent account
               message = `Account with ID ${account_id} not found.`;
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
            throw new ConflictException(`Customer with phone number '${updateCustomerDto.phone}' already exists.`);
          }
          throw new ConflictException(`A unique constraint violation occurred on: ${field}.`);
        }
      }
      throw error;
    }
  }

  async remove(id: number): Promise<customer> {
    try {
      return await this.prisma.customer.delete({
        where: { customer_id: id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Customer with ID ${id} not found`);
        }
         if (error.code === 'P2003') { 
            throw new ConflictException(`Customer with ID ${id} cannot be deleted as they have existing orders or other dependencies.`);
        }
      }
      throw error;
    }
  }
} 