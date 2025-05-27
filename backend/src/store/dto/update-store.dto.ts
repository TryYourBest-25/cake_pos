import { PartialType } from '@nestjs/swagger'; // Hoặc '@nestjs/mapped-types'
import { CreateStoreDto } from './create-store.dto';

export class UpdateStoreDto extends PartialType(CreateStoreDto) {} 