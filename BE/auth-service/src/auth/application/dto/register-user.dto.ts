import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  userType?: string = 'customer';

  @IsString()
  @IsOptional()
  active?: string = 'active';

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsOptional()
  staffProfile?: any;

  @IsOptional()
  deliveryProfile?: any;

  @IsOptional()
  customerProfile?: any;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
