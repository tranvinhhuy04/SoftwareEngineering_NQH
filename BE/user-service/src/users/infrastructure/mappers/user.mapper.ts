import { DeliveryProfileEntity } from "src/users/domain/entities/deliveryProfile.entity";
import { UserEntity } from "../../domain/entities/user.entity";
import { CreateUserDto } from "src/users/application/dto/user/create-user.dto";
import { UserType } from "src/users/domain/enum/user-type.enum";
import { Types } from "mongoose";
import { UserActive } from "src/users/domain/enum/user-active.enum";
import { StaffProfileEntity } from "src/users/domain/entities/staffProfile.entity";
import { Available } from "src/users/domain/enum/delivery-available.enum";
import { Vehicle } from "src/users/domain/enum/delivery-vehicle.enum";

export class UserMapper {
  // Document -> Entity
  static toEntity(userDoc: any): UserEntity {
    const user = new UserEntity(
      userDoc.ID,
      userDoc.name,
      userDoc.email,
      userDoc.password,
      userDoc.phone,
      userDoc.address,
      userDoc.avatar,
      userDoc.userType,
      userDoc.active,
      userDoc._id,

    );
    return user;
  }

  // Entity -> Schema object
  static toUserPersistence(user: UserEntity): any {
    return {
      ID: user.ID,
      name: user.name,
      email: user.email,
      password: user.password,
      phone: user.phone,
      address: user.address,
      avatar: user.avatar,
      userType: user.userType,
      active: user.active,
    };
  }

  // DTO -> Entity
  static mapperUserDtoToEntity(dto: CreateUserDto, userId: string): UserEntity {
    const user = new UserEntity(
      userId,
      dto.name,
      dto.email,
      dto.password,
      dto.phone || '',
      dto.address || '',
      dto.avatar || '',
      dto.userType ?? UserType.CUSTOMER,
      dto.active ?? UserActive.ACTIVE,
      undefined, 

    );
    return user;
  }


}

