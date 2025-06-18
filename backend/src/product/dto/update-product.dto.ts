import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
// import { IsOptional, ValidateNested, ArrayMinSize, ArrayNotEmpty } from 'class-validator';
// import { Type } from 'class-transformer';
// import { UpdateProductPriceDto } from './update-product-price.dto'; // Sẽ tạo sau nếu cần quản lý giá phức tạp khi update

export class UpdateProductDto extends PartialType(
  OmitType(CreateProductDto, ['prices'] as const),
) {
  // Loại bỏ prices field để chỉ cập nhật thông tin sản phẩm
  // Giá sản phẩm sẽ được quản lý qua các endpoint riêng biệt
  // Nếu muốn cho phép cập nhật prices một cách chi tiết (thêm mới, xóa, cập nhật từng price item)
  // thì cần định nghĩa cấu trúc phức tạp hơn ở đây, ví dụ sử dụng một mảng các UpdateProductPriceDto.
  // Hiện tại, PartialType sẽ làm cho `prices` trở thành optional và vẫn giữ kiểu CreateProductPriceDto[].
  // Điều này có nghĩa là client có thể gửi một mảng prices mới hoàn chỉnh để thay thế, hoặc không gửi gì cả.
  // Nếu muốn cho phép client chỉ gửi những price cần thay đổi, hoặc thêm/xóa price, sẽ cần logic phức tạp hơn trong service.
  // @IsOptional()
  // @ArrayMinSize(1) // Nếu cho phép update prices thì vẫn nên có ít nhất 1 price
  // @ValidateNested({ each: true })
  // @Type(() => UpdateProductPriceDto) // Cần UpdateProductPriceDto riêng
  // prices?: UpdateProductPriceDto[];
}
