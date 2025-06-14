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

    // Lưu refresh token vào database
    await this.prisma.account.update({
      where: { account_id: account.account_id },
      data: { refresh_token },
    });

    return {
      access_token,
      refresh_token,
    };
  }

  async refreshToken(refresh_token: string) {
    try {
      const payload = this.jwtService.verify(refresh_token);
      
      // Kiểm tra refresh token trong database
      const account = await this.prisma.account.findFirst({
        where: {
          account_id: payload.sub,
          refresh_token,
          is_active: true,
          is_locked: false,
        },
        include: {
          role: true,
        },
      });

      if (!account) {
        throw new UnauthorizedException('Refresh token không hợp lệ');
      }

      // Tạo tokens mới
      return this.generateTokens(account);
    } catch (error) {
      throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn');
    }
  }

  async revokeToken(account_id: number) {
    await this.prisma.account.update({
      where: { account_id },
      data: { refresh_token: null },
    });
  }

  async revokeAllTokens(account_id: number) {
    await this.prisma.account.update({
      where: { account_id },
      data: { refresh_token: null },
    });
  }
} 