import { PartialType } from '@nestjs/swagger'; // Hoặc '@nestjs/mapped-types'
import { CreatePaymentMethodDto } from './create-payment-method.dto';

export class UpdatePaymentMethodDto extends PartialType(
  CreatePaymentMethodDto,
) {}
