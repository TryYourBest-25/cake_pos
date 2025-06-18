import {
  IsArray,
  IsOptional,
  ValidateNested,
  IsNumber,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CalculateOrderProductDto {
  @IsNumber()
  product_price_id: number;

  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsString()
  option?: string;
}

export class CalculateOrderDiscountDto {
  @IsNumber()
  discount_id: number;
}

export class CalculateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CalculateOrderProductDto)
  products: CalculateOrderProductDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CalculateOrderDiscountDto)
  discounts?: CalculateOrderDiscountDto[];
}

export interface OrderCalculationResult {
  total_amount: number;
  final_amount: number;
  total_discount_applied: number;
  products: {
    product_price_id: number;
    quantity: number;
    unit_price: number;
    subtotal: number;
    product_name: string;
    size_name: string;
  }[];
  discounts: {
    discount_id: number;
    discount_name: string;
    discount_value: number;
    discount_amount: number;
    max_discount_amount: number;
  }[];
}
