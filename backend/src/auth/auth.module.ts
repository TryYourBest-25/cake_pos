import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthTokenService } from './auth-token.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: {
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      },
    }),
    PrismaModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthTokenService,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
  ],
  exports: [
    AuthService,
    AuthTokenService,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    PassportModule,
  ],
})
export class AuthModule {}
