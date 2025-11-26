import { RegisterUserDto } from "../dto/register-user.dto";
import { AuthUserEntity } from "../../domain/entity/auth-user.entity";

export class RegisterUserMapper {

  static toUserServicePayload(dto: RegisterUserDto) {
    return {
      name: dto.name ?? '',
      phone: dto.phone ?? '',
      address: dto.address ?? '',
      userType: dto.userType ?? 'customer',
      active: dto.active ?? 'active',
      avatar: dto.avatar,
      staffProfile: dto.staffProfile,
      deliveryProfile: dto.deliveryProfile,
      customerProfile: dto.customerProfile,
      email: dto.email,
      password: dto.password,
    };
  }

  static toAuthEntity(dto: RegisterUserDto, userId: string, hash: string): AuthUserEntity {
    return new AuthUserEntity(
      '',
      userId,
      dto.email,
      hash,
      true,
      dto.userType ?? 'customer',
      new Date(),
      new Date(),
    );
  }
}
