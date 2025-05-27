import { PartialType } from '@nestjs/swagger'; // Hoặc '@nestjs/mapped-types'
import { CreateMembershipTypeDto } from './create-membership-type.dto';

export class UpdateMembershipTypeDto extends PartialType(CreateMembershipTypeDto) {} 