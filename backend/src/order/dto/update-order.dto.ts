import { PartialType } from '@nestjs/swagger';
import { CreateOrderDto, OrderStatusEnum } from './create-order.dto';
import {
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  IsString,
  MaxLength,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CreateOrderProductDto } from './create-order-product.dto'; // Giả sử có thể cập nhật products
import { CreateOrderDiscountDto } from './create-order-discount.dto'; // Giả sử có thể cập nhật discounts

// Có thể cần UpdateOrderProductDto và UpdateOrderDiscountDto nếu muốn logic cập nhật chi tiết hơn

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @ApiProperty({
    description: 'ID của nhân viên cập nhật (nếu có thay đổi)',
    example: 2,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  employee_id?: number;

  @ApiProperty({
    description: 'ID của khách hàng cập nhật (nếu có thay đổi)',
    example: 2,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  customer_id?: number;

  @ApiProperty({
    description: 'Ghi chú tùy chỉnh cập nhật',
    example: 'Đã xác nhận, giao gấp',
    maxLength: 1000,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  customize_note?: string;

  // status chỉ được cập nhật thông qua business logic, không cho phép client gửi trực tiếp

  // Cập nhật products và discounts: client gửi lại toàn bộ mảng mới.
  // Nếu mảng rỗng hoặc không gửi, service có thể giữ nguyên hoặc xóa hết tùy logic.
  // Để có logic thêm/sửa/xóa chi tiết từng item, cần DTOs và service phức tạp hơn.
  @ApiProperty({
    description: '(Thay thế) Danh sách sản phẩm trong đơn hàng',
    type: [CreateOrderProductDto],
    required: false,
  })
  @IsOptional()
  @ArrayMinSize(0) // Cho phép gửi mảng rỗng để xóa hết sản phẩm (tùy logic service)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderProductDto)
  products?: CreateOrderProductDto[];

  @ApiProperty({
    description: '(Thay thế) Danh sách mã giảm giá áp dụng',
    type: [CreateOrderDiscountDto],
    required: false,
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderDiscountDto)
  discounts?: CreateOrderDiscountDto[];
}
