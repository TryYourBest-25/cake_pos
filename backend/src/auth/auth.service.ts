import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AuthTokenService } from './auth-token.service';
import { Prisma } from '../generated/prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private authTokenService: AuthTokenService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { username, password, role_id } = registerDto;

    // Kiểm tra username đã tồn tại
    const existingAccount = await this.prisma.account.findUnique({
      where: { username },
    });

    if (existingAccount) {
      throw new ConflictException('Tên đăng nhập đã tồn tại');
    }

    // Kiểm tra role có tồn tại
    const role = await this.prisma.role.findUnique({
      where: { role_id },
    });

    if (!role) {
      throw new BadRequestException('Role không tồn tại');
    }

    // Hash password
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Tạo account mới
    const account = await this.prisma.account.create({
      data: {
        username,
        password_hash,
        role_id,
        is_active: true,
        is_locked: false,
      },
      include: {
        role: true,
      },
    });

    // Tạo tokens
    const tokens = await this.authTokenService.generateTokens(account);

    return {
      ...tokens,
      user: {
        account_id: account.account_id,
        username: account.username,
        role_id: account.role_id,
        role_name: account.role.name,
        is_active: account.is_active,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    // Tìm account theo username
    const account = await this.prisma.account.findUnique({
      where: { username },
      include: {
        role: true,
      },
    });

    if (!account) {
      throw new UnauthorizedException('Tên đăng nhập hoặc mật khẩu không đúng');
    }

    // Kiểm tra account có bị khóa hoặc không active
    if (!account.is_active) {
      throw new UnauthorizedException('Tài khoản đã bị vô hiệu hóa');
    }

    if (account.is_locked) {
      throw new UnauthorizedException('Tài khoản đã bị khóa');
    }

    // Kiểm tra password
    const isPasswordValid = await bcrypt.compare(
      password,
      account.password_hash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Tên đăng nhập hoặc mật khẩu không đúng');
    }

    // Cập nhật last_login
    await this.prisma.account.update({
      where: { account_id: account.account_id },
      data: {
        last_login: new Date(),
      },
    });

    // Tạo tokens
    const tokens = await this.authTokenService.generateTokens(account);

    return {
      ...tokens,
      user: {
        account_id: account.account_id,
        username: account.username,
        role_id: account.role_id,
        role_name: account.role.name,
        is_active: account.is_active,
      },
    };
  }

  async validateUser(account_id: number) {
    const account = await this.prisma.account.findUnique({
      where: { account_id },
      include: {
        role: true,
      },
    });

    if (!account || !account.is_active || account.is_locked) {
      return null;
    }

    return {
      account_id: account.account_id,
      username: account.username,
      role_id: account.role_id,
      role_name: account.role.name,
      is_active: account.is_active,
      is_locked: account.is_locked,
    };
  }

  async updateProfile(account_id: number, updateProfileDto: UpdateProfileDto) {
    const { username, password, ...profileData } = updateProfileDto;

    // Tìm account hiện tại
    const currentAccount = await this.prisma.account.findUnique({
      where: { account_id },
      include: {
        role: true,
        manager: true,
        employee: true,
        customer: true,
      },
    });

    if (!currentAccount) {
      throw new NotFoundException('Tài khoản không tồn tại');
    }

    // Kiểm tra username conflict nếu có thay đổi
    if (username && username !== currentAccount.username) {
      const existingAccount = await this.prisma.account.findUnique({
        where: { username },
      });
      if (existingAccount) {
        throw new ConflictException('Tên đăng nhập đã tồn tại');
      }
    }

    // Chuẩn bị dữ liệu cập nhật cho account
    const accountUpdateData: Prisma.accountUpdateInput = {};
    if (username) accountUpdateData.username = username;
    if (password) {
      accountUpdateData.password_hash = await bcrypt.hash(password, 12);
    }

    // Chuẩn bị dữ liệu cập nhật cho profile tùy theo role
    const roleName = currentAccount.role.name;
    let profileUpdateData: any = {};

    // Lọc dữ liệu profile theo role
    const { position, ...commonProfileData } = profileData;
    
    if (roleName === 'MANAGER' && currentAccount.manager) {
      profileUpdateData = {
        ...commonProfileData,
      };
    } else if (roleName === 'STAFF' && currentAccount.employee) {
      profileUpdateData = {
        ...commonProfileData,
        ...(position && { position }),
      };
    } else if (roleName === 'CUSTOMER' && currentAccount.customer) {
      // Customer chỉ có thể cập nhật một số trường nhất định
      const { email, ...customerData } = commonProfileData;
      profileUpdateData = customerData;
    }

    try {
      // Sử dụng transaction để đảm bảo tính nhất quán
      const result = await this.prisma.$transaction(async (prisma) => {
        // Cập nhật account nếu có thay đổi
        let updatedAccount = currentAccount;
        if (Object.keys(accountUpdateData).length > 0) {
          updatedAccount = await prisma.account.update({
            where: { account_id },
            data: accountUpdateData,
            include: {
              role: true,
              manager: true,
              employee: true,
              customer: true,
            },
          });
        }

        // Cập nhật profile tùy theo role
        if (Object.keys(profileUpdateData).length > 0) {
          if (roleName === 'MANAGER' && updatedAccount.manager) {
            await prisma.manager.update({
              where: { manager_id: updatedAccount.manager.manager_id },
              data: profileUpdateData,
            });
          } else if (roleName === 'STAFF' && updatedAccount.employee) {
            await prisma.employee.update({
              where: { employee_id: updatedAccount.employee.employee_id },
              data: profileUpdateData,
            });
          } else if (roleName === 'CUSTOMER' && updatedAccount.customer) {
            // Customer có thể có nhiều record, cập nhật tất cả
            await prisma.customer.updateMany({
              where: { account_id },
              data: profileUpdateData,
            });
          }
        }

        return updatedAccount;
      });

      // Trả về thông tin user đã cập nhật
      let profile: any = null;
      if (roleName === 'MANAGER') {
        profile = result.manager;
      } else if (roleName === 'STAFF') {
        profile = result.employee;
      } else if (roleName === 'CUSTOMER') {
        profile = result.customer || null;
      }

      return {
        account_id: result.account_id,
        username: result.username,
        role_id: result.role_id,
        role_name: result.role.name,
        is_active: result.is_active,
        profile,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          // Unique constraint violation
          const target = error.meta?.target as string[];
          if (target?.includes('username')) {
            throw new ConflictException('Tên đăng nhập đã tồn tại');
          }
          if (target?.includes('email')) {
            throw new ConflictException('Email đã tồn tại');
          }
          if (target?.includes('phone')) {
            throw new ConflictException('Số điện thoại đã tồn tại');
          }
        }
      }
      throw error;
    }
  }

  async getProfile(account_id: number) {
    const account = await this.prisma.account.findUnique({
      where: { account_id },
      include: {
        role: true,
        manager: true,
        employee: true,
        customer: true,
      },
    });

    if (!account) {
      throw new NotFoundException('Tài khoản không tồn tại');
    }

    const roleName = account.role.name;
    let profile: any = null;

    if (roleName === 'MANAGER' && account.manager) {
      profile = account.manager;
    } else if (roleName === 'STAFF' && account.employee) {
      profile = account.employee;
    } else if (roleName === 'CUSTOMER' && account.customer) {
      profile = account.customer;
    }

    return {
      account_id: account.account_id,
      username: account.username,
      role_id: account.role_id,
      role_name: account.role.name,
      is_active: account.is_active,
      is_locked: account.is_locked,
      last_login: account.last_login,
      created_at: account.created_at,
      profile,
    };
  }
}
