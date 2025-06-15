import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthTokenService } from './auth-token.service';
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
    const isPasswordValid = await bcrypt.compare(password, account.password_hash);
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
} 