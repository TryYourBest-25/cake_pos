import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthTokenService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async generateTokens(account: any) {
    const payload: JwtPayload = {
      sub: account.account_id,
      username: account.username,
      role_id: account.role_id,
      role_name: account.role.name,
    };

    const access_token = this.jwtService.sign(payload);
    const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' });

    return {
      access_token,
      refresh_token,
    };
  }

  async refreshToken(refresh_token: string) {
    try {
      const payload = this.jwtService.verify(refresh_token);

      // Kiểm tra account vẫn còn active và không bị khóa
      const account = await this.prisma.account.findFirst({
        where: {
          account_id: payload.sub,
          is_active: true,
          is_locked: false,
        },
        include: {
          role: true,
        },
      });

      if (!account) {
        throw new UnauthorizedException(
          'Tài khoản không hợp lệ hoặc đã bị khóa',
        );
      }

      // Tạo tokens mới
      return this.generateTokens(account);
    } catch (error) {
      throw new UnauthorizedException(
        'Refresh token không hợp lệ hoặc đã hết hạn',
      );
    }
  }
}
