import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Res,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { Response, Request as ExpressRequest } from 'express';
import { AuthService } from './auth.service';
import { AuthTokenService } from './auth-token.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authTokenService: AuthTokenService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Đăng ký tài khoản mới',
    description: 'Tạo tài khoản mới cho khách hàng với thông tin cá nhân và thông tin đăng nhập'
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Đăng ký thành công',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', description: 'Thông báo đăng ký thành công' },
        user: {
          type: 'object',
          properties: {
            account_id: { type: 'number', description: 'ID tài khoản' },
            username: { type: 'string', description: 'Tên đăng nhập' },
            email: { type: 'string', description: 'Email' },
            customer_id: { type: 'number', description: 'ID khách hàng' },
            full_name: { type: 'string', description: 'Họ và tên' },
            phone: { type: 'string', description: 'Số điện thoại' }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Yêu cầu không hợp lệ - Dữ liệu đầu vào không đúng định dạng hoặc thiếu thông tin bắt buộc' 
  })
  @ApiResponse({
    status: 409,
    description: 'Xung đột dữ liệu - Tên đăng nhập, email hoặc số điện thoại đã tồn tại',
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Đăng nhập vào hệ thống',
    description: 'Xác thực thông tin đăng nhập và trả về access token cùng với thông tin người dùng'
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Đăng nhập thành công',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string', description: 'JWT access token để xác thực các API khác' },
        user: {
          type: 'object',
          properties: {
            account_id: { type: 'number', description: 'ID tài khoản' },
            username: { type: 'string', description: 'Tên đăng nhập' },
            email: { type: 'string', description: 'Email' },
            phone: { type: 'string', description: 'Số điện thoại' },
            role: { type: 'string', description: 'Vai trò của người dùng' },
            full_name: { type: 'string', description: 'Họ và tên' }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Yêu cầu không hợp lệ - Thiếu thông tin đăng nhập' 
  })
  @ApiResponse({
    status: 401,
    description: 'Thông tin đăng nhập không chính xác - Tên đăng nhập hoặc mật khẩu sai',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy tài khoản - Tài khoản không tồn tại hoặc đã bị vô hiệu hóa',
  })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(loginDto);

    // Set refresh token as HTTP-only cookie
    res.cookie('refresh_token', result.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    });

    // Gọi getProfile để lấy thông tin đầy đủ của user
    const userProfile = await this.authService.getProfile(result.user.account_id);

    // Trả về access token và thông tin user đầy đủ
    return {
      access_token: result.access_token,
      user: userProfile,
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Đăng xuất khỏi hệ thống',
    description: 'Xóa refresh token và đăng xuất người dùng khỏi hệ thống'
  })
  @ApiResponse({
    status: 200,
    description: 'Đăng xuất thành công',
    schema: {
      type: 'object',
      properties: {
        message: { 
          type: 'string', 
          description: 'Thông báo đăng xuất thành công',
          example: 'Đăng xuất thành công'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Chưa xác thực - Token không hợp lệ hoặc đã hết hạn' 
  })
  async logout(@Request() req, @Res({ passthrough: true }) res: Response) {
    // Xóa refresh token cookie
    res.clearCookie('refresh_token');
    return { message: 'Đăng xuất thành công' };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Lấy thông tin profile của người dùng hiện tại',
    description: 'Trả về thông tin chi tiết của người dùng đang đăng nhập dựa trên access token'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Thông tin profile của người dùng',
    schema: {
      type: 'object',
      properties: {
        account_id: { type: 'number', description: 'ID tài khoản' },
        username: { type: 'string', description: 'Tên đăng nhập' },
        email: { type: 'string', description: 'Email' },
        phone: { type: 'string', description: 'Số điện thoại' },
        role: { type: 'string', description: 'Vai trò của người dùng' },
        full_name: { type: 'string', description: 'Họ và tên' },
        avatar: { type: 'string', description: 'URL ảnh đại diện', nullable: true },
        created_at: { type: 'string', format: 'date-time', description: 'Thời gian tạo tài khoản' }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Chưa xác thực - Token không hợp lệ hoặc đã hết hạn' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Không tìm thấy thông tin người dùng' 
  })
  async getProfile(@CurrentUser() user: any) {
    return this.authService.getProfile(user.account_id);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Cập nhật thông tin profile của người dùng hiện tại',
    description: 'Cho phép người dùng cập nhật thông tin cá nhân như họ tên, email, số điện thoại, và thay đổi mật khẩu'
  })
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Cập nhật profile thành công',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', description: 'Thông báo cập nhật thành công' },
        user: {
          type: 'object',
          properties: {
            account_id: { type: 'number', description: 'ID tài khoản' },
            username: { type: 'string', description: 'Tên đăng nhập' },
            email: { type: 'string', description: 'Email đã cập nhật' },
            phone: { type: 'string', description: 'Số điện thoại đã cập nhật' },
            full_name: { type: 'string', description: 'Họ và tên đã cập nhật' },
            updated_at: { type: 'string', format: 'date-time', description: 'Thời gian cập nhật' }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Yêu cầu không hợp lệ - Dữ liệu đầu vào không đúng định dạng' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Chưa xác thực - Token không hợp lệ hoặc đã hết hạn' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Không tìm thấy thông tin người dùng' 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Xung đột dữ liệu - Email hoặc số điện thoại đã được sử dụng bởi tài khoản khác' 
  })
  async updateProfile(
    @CurrentUser() user: any,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(user.account_id, updateProfileDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Làm mới access token',
    description: 'Sử dụng refresh token để tạo access token mới khi token cũ đã hết hạn'
  })
  @ApiResponse({
    status: 200,
    description: 'Làm mới token thành công',
    schema: {
      type: 'object',
      properties: {
        access_token: { 
          type: 'string', 
          description: 'JWT access token mới để xác thực các API khác' 
        }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Không thể làm mới token - Refresh token không hợp lệ, đã hết hạn hoặc không tồn tại',
  })
  async refreshToken(
    @Req() req: ExpressRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Thu hồi token',
    description: 'Thu hồi refresh token hiện tại, buộc người dùng phải đăng nhập lại'
  })
  @ApiResponse({
    status: 200,
    description: 'Thu hồi token thành công',
    schema: {
      type: 'object',
      properties: {
        message: { 
          type: 'string', 
          description: 'Thông báo thu hồi token thành công',
          example: 'Token đã được thu hồi thành công'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Chưa xác thực - Token không hợp lệ hoặc đã hết hạn' 
  })
  async revokeToken(@Res({ passthrough: true }) res: Response) {
    // Xóa refresh token cookie  
    res.clearCookie('refresh_token');
    return { message: 'Token đã được thu hồi thành công' };
  }

  @Get('test')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Kiểm tra hoạt động của Auth Controller',
    description: 'Endpoint để kiểm tra xem Auth Controller có hoạt động bình thường không (smoke test)'
  })
  @ApiResponse({
    status: 200,
    description: 'Kiểm tra thành công',
    schema: {
      type: 'object',
      properties: {
        message: { 
          type: 'string', 
          description: 'Thông báo xác nhận controller hoạt động bình thường',
          example: 'Auth controller is working!'
        }
      }
    }
  })
  async test() {
    return { message: 'Auth controller is working!' };
  }
}
