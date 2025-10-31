// src/auth/application/dto/register/register-user.dto.ts
import { 
  IsEmail, 
  IsOptional, 
  IsString, 
  IsNotEmpty, 
  ValidateNested, 
  IsBoolean, 
  IsNumber 
} from 'class-validator';
import { Type } from 'class-transformer';

class StaffProfileDto {
  @IsOptional()
  @IsString()
  shift?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  handledOrders?: number;
}

class DeliveryProfileDto {
  @IsOptional()
  @IsString()
  vehicleType?: string;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}

class CustomerProfileDto {
  @IsOptional()
  @IsString()
  loyaltyLevel?: string;

  @IsOptional()
  @IsNumber()
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

  /** 🔑 Quy định vai trò người dùng (ví dụ: "admin", "restaurant-staff", "customer") */
  @IsOptional()
  @IsString()
  userType?: string; // ✅ Chỉ dùng userType làm role (để đồng bộ với UserService)

  /** 🔒 Dành cho hệ thống hoặc admin khi tạo người dùng mới */
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

  /** 👨‍🍳 Hồ sơ nhân viên */
  @IsOptional()
  @ValidateNested()
  @Type(() => StaffProfileDto)
  staffProfile?: StaffProfileDto;

  /** 🛵 Hồ sơ giao hàng */
  @IsOptional()
  @ValidateNested()
  @Type(() => DeliveryProfileDto)
  deliveryProfile?: DeliveryProfileDto;

  /** 👤 Hồ sơ khách hàng */
  @IsOptional()
  @ValidateNested()
  @Type(() => CustomerProfileDto)
  customerProfile?: CustomerProfileDto;
}
