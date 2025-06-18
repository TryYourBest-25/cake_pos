import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsInt,
  Min,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductSizeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string; // e.g., "S", "M", "L", "10 inch"

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  unit: string; // e.g., "cái", "phần", "inch", "cm"

  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity: number; // e.g., if name="10 inch", unit="inch", then quantity=10

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}
