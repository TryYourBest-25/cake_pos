import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { employee, Prisma } from '../generated/prisma/client'; // Đường dẫn này có thể cần điều chỉnh
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeeService {
  constructor(private prisma: PrismaService) {}

  async create(createEmployeeDto: CreateEmployeeDto): Promise<employee> {
    const { email, account_id, position, ...restOfDto } = createEmployeeDto;

    const existingEmployeeByEmail = await this.prisma.employee.findUnique({
      where: { email },
    });
    if (existingEmployeeByEmail) {
      throw new ConflictException(`Employee with email '${email}' already exists.`);
    }

    const data: Prisma.employeeCreateInput = {
      ...restOfDto,
      email,
      position,
      account: { // Account là bắt buộc
        connect: { account_id },
      },
    };

    try {
      return await this.prisma.employee.create({
        data,
        include: { account: true }, // Include account trong kết quả trả về
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          let fieldDescription = 'provided unique information';
          if (error.meta && error.meta.target) {
            const target = error.meta.target as string[];
            if (target.includes('email')) fieldDescription = `email '${email}'`;
            // Thêm các kiểm tra khác cho các trường unique nếu cần
          }
          throw new ConflictException(`Employee already exists with the ${fieldDescription}.`);
        }
        if (error.code === 'P2025') {
          // Lỗi này thường xảy ra khi account_id không tồn tại
          throw new BadRequestException(`Account with ID ${account_id} not found or other related record is missing.`);
        }
      }
      throw error;
    }
  }

  async findAll(): Promise<employee[]> {
    return this.prisma.employee.findMany({
        include: { account: true }, 
    });
  }

  async findOne(employee_id: number): Promise<employee | null> {
    const emp = await this.prisma.employee.findUnique({
      where: { employee_id },
      include: { account: true },
    });
    if (!emp) {
      throw new NotFoundException(`Employee with ID ${employee_id} not found`);
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
    const { account_id, ...restOfData } = updateEmployeeDto;
    
    const data: Prisma.employeeUpdateInput = { ...restOfData };

    if (account_id !== undefined) {
        // Vì account là bắt buộc, chúng ta chỉ cho phép connect tới một account khác.
        // Việc disconnect hoặc đặt là null không được hỗ trợ nếu quan hệ là bắt buộc.
        data.account = { connect: { account_id } }; 
    }
    // Nếu position có thể được cập nhật, bạn sẽ thêm nó vào đây tương tự như account_id
    // if (restOfData.position !== undefined) {
    //   data.position = restOfData.position;
    // }

    try {
      return await this.prisma.employee.update({
        where: { employee_id },
        data,
        include: { account: true },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          let message = `Update failed: Employee with ID ${employee_id} not found.`;
          if (error.meta && typeof error.meta.cause === 'string' && error.meta.cause.startsWith('Record to update not found')){
            // Mặc định
          } else if (account_id) {
             message = `Update failed: Account with ID ${account_id} not found, or other related record is missing.`
          }
          throw new NotFoundException(message);
        }
        if (error.code === 'P2002') {
          throw new ConflictException('Cannot update employee, unique constraint violation (e.g., email already exists).');
        }
      }
      throw error;
    }
  }

  async remove(employee_id: number): Promise<employee> {
    // Cần kiểm tra xem có ràng buộc nào ngăn cản việc xóa employee không
    // Ví dụ: nếu employee liên quan đến các bản ghi khác không thể cascade delete
    try {
      return await this.prisma.employee.delete({
        where: { employee_id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Employee with ID ${employee_id} not found`);
        }
        if (error.code === 'P2003') { 
            throw new ConflictException(`Employee with ID ${employee_id} cannot be deleted due to existing relations (e.g., assigned to tasks, orders, etc.).`);
        }
      }
      throw error;
    }
  }
} 