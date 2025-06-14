import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { role } from '../generated/prisma/client';

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) {}

  async create(createRoleDto: CreateRoleDto): Promise<role> {
    return this.prisma.role.create({
      data: createRoleDto,
    });
  }

  async findAll(): Promise<role[]> {
    return this.prisma.role.findMany();
  }

  async findOne(id: number): Promise<role | null> {
    return this.prisma.role.findUnique({
      where: { role_id: id },
    });
  }

  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<role> {
    return this.prisma.role.update({
      where: { role_id: id },
      data: updateRoleDto,
    });
  }

  async remove(id: number): Promise<role> {
    return this.prisma.role.delete({
      where: { role_id: id },
    });
  }
} 