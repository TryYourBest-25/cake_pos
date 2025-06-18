import { IsBoolean, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LockAccountDto {
  @ApiProperty({
    description: 'Trạng thái khóa tài khoản (true = khóa, false = mở khóa)',
    example: true,
    type: Boolean,
  })
  @IsBoolean({ message: 'is_locked phải là giá trị boolean' })
  @IsNotEmpty({ message: 'is_locked không được để trống' })
  is_locked: boolean;
}
