import { RegisterUserDto } from "../dto/register-user.dto";
import { UserAuth } from "src/auth/domain/entity/auth-user.entity";

export class RegisterUserMapper {
  static toUserServicePayload(dto: RegisterUserDto) {
    return {
      name: dto.name,
      email: dto.email,
      password: dto.password,
      phone: dto.phone,
      address: dto.address,
      userType: dto.userType,
      active: dto.active ?? 'active',
      avatar: dto.avatar,
      staffProfile: dto.staffProfile,
      deliveryProfile: dto.deliveryProfile,
      customerProfile: dto.customerProfile,
    };
  }

  static toAuthEntity(dto: RegisterUserDto, userId: string, hash: string): UserAuth {
    return new UserAuth(
      '',                // id sẽ được Mongo tự sinh khi save
      userId,            // _id từ UserService (Mongo)
      dto.email,
      hash,
      true,
      new Date(),
      new Date(),
    );
  }
}
