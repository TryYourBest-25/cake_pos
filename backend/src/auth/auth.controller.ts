import { Controller, Post, Body, Get, UseGuards, Request, HttpCode, HttpStatus, Res, Req, UnauthorizedException } from '@nestjs/common';
import { Response, Request as ExpressRequest } from 'express';
import { AuthService } from './auth.service';
import { AuthTokenService } from './auth-token.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authTokenService: AuthTokenService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(loginDto);
    
    // Set refresh token as HTTP-only cookie
    res.cookie('refresh_token', result.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    });

    // Chỉ trả về access token trong response
    return {
      access_token: result.access_token,
      user: result.user,
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req, @Res({ passthrough: true }) res: Response) {
    // Xóa refresh token cookie
    res.clearCookie('refresh_token');
    return { message: 'Đăng xuất thành công' };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: any) {
    return {
      user,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Req() req: ExpressRequest, @Res({ passthrough: true }) res: Response) {
    const refresh_token = req.cookies.refresh_token;
    
    if (!refresh_token) {
      throw new UnauthorizedException('Refresh token không tìm thấy');
    }

    const result = await this.authTokenService.refreshToken(refresh_token);
    
    // Set refresh token mới vào cookie
    res.cookie('refresh_token', result.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    });

    // Chỉ trả về access token
    return {
      access_token: result.access_token,
    };
  }

  @Post('revoke')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async revokeToken(@Res({ passthrough: true }) res: Response) {
    // Xóa refresh token cookie
    res.clearCookie('refresh_token');
    return { message: 'Token đã được thu hồi thành công' };
  }

  @Get('test')
  @HttpCode(HttpStatus.OK)
  async test() {
    return { message: 'Auth controller is working!' };
  }
} 