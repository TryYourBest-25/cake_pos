import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CustomerModule } from './customer/customer.module';
import { EmployeeModule } from './employee/employee.module';
import { ManagerModule } from './manager/manager.module';
import { DiscountModule } from './discount/discount.module';
import { AccountModule } from './account/account.module';
import { RoleModule } from './role/role.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Joi from 'joi';
import { VnpayModule } from 'nestjs-vnpay';
import { ReportsModule } from './reports/reports.module';
import { InvoiceModule } from './invoice/invoice.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.development'],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production').required(),
        PORT: Joi.number().default(3000),
        DATABASE_URL: Joi.string().required(),
        DATABASE_HOST: Joi.string().required(),
        DATABASE_PORT: Joi.number().required(),
        DATABASE_USER: Joi.string().required(),
        DATABASE_PASSWORD: Joi.string().required(),
        DATABASE_NAME: Joi.string().required(),
        DATABASE_SCHEMA: Joi.string().required(),
        VNP_TMN_CODE: Joi.string().required(),
        VNP_SECURE_HASH_SECRET_KEY: Joi.string().required(),
        VNP_HOST: Joi.string().required(),
        VNP_TEST_MODE: Joi.boolean().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRES_IN: Joi.string().default('24h'),
      }),
    }),
    VnpayModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        tmnCode: configService.getOrThrow<string>('VNP_TMN_CODE'),
        secureSecret: configService.getOrThrow<string>(
          'VNP_SECURE_HASH_SECRET_KEY',
        ),
        vnpayHost: configService.getOrThrow<string>('VNP_HOST'),
        testMode: configService.getOrThrow<boolean>('VNP_TEST_MODE'),
      }),
      inject: [ConfigService],
    }),
    PrismaModule,
    AuthModule,
    AccountModule,
    CustomerModule,
    EmployeeModule,
    ManagerModule,
    DiscountModule,
    RoleModule,
    ReportsModule,
    InvoiceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
