// src/auth/application/dto/register/register-user.dto.ts
import { IsEmail, IsOptional, IsString, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class StaffProfileDto {
  @IsOptional()
  @IsString()
  shift?: string;

  @IsOptional()
  isActive?: boolean;

  @IsOptional()
  handledOrders?: number;
}

class DeliveryProfileDto {
  @IsOptional()
  @IsString()
  vehicleType?: string;

  @IsOptional()
  isAvailable?: boolean;
}

class CustomerProfileDto {
  @IsOptional()
  @IsString()
  loyaltyLevel?: string;

  @IsOptional()
  totalOrders?: number;
}

export class RegisterUserDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  userType?: string;

  @IsOptional()
  @IsString()
  creatorRole?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  active?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => StaffProfileDto)
  staffProfile?: StaffProfileDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => DeliveryProfileDto)
  deliveryProfile?: DeliveryProfileDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CustomerProfileDto)
  customerProfile?: CustomerProfileDto;
}
