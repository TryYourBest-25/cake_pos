import { Module } from '@nestjs/common';
import { PaymentMethodService } from './payment-method.service';
import { PaymentMethodController } from './payment-method.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PaymentMethodController],
  providers: [PaymentMethodService],
  exports: [PaymentMethodService], // Export service nếu PaymentService cần được inject ở module khác
})
export class PaymentMethodModule {}
