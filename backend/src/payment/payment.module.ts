import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { VnpayModule } from 'nestjs-vnpay';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { VNPayService } from './vnpay.service';
import { PrismaModule } from '../prisma/prisma.module';
import { InvoiceModule } from '../invoice/invoice.module';

@Module({
  imports: [
    PrismaModule,
    InvoiceModule,
    ConfigModule,
    VnpayModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        tmnCode: configService.get<string>('VNPAY_TMN_CODE') || 'your_tmn_code',
        secureSecret:
          configService.get<string>('VNPAY_SECRET_KEY') || 'your_secret_key',
        vnpayHost:
          configService.get<string>('VNPAY_HOST') ||
          'https://sandbox.vnpayment.vn',
        testMode: configService.get<boolean>('VNPAY_TEST_MODE') !== false, // Default to test mode
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [PaymentController],
  providers: [PaymentService, VNPayService],
  exports: [PaymentService, VNPayService], // Export services nếu cần sử dụng ở module khác
})
export class PaymentModule {}
