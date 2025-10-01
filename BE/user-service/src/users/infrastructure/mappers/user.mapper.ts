import { DeliveryDetailEntity } from "src/users/domain/entities/deliveryDetail.entity";
import { UserEntity } from "../../domain/entities/user.entity";
import { CreateUserDto } from "src/users/application/dto/user/create-user.dto";
import { UserType } from "src/users/domain/enum/user-type.enum";
import { Types } from "mongoose";
import { UserActive } from "src/users/domain/enum/user-active.enum";

export class UserMapper {
  // Document -> Entity
  static toEntity(userDoc: any, deliveryDoc?: any): UserEntity {
    const user = new UserEntity(
      userDoc._id,
      userDoc.ID,
      userDoc.name,
      userDoc.email,
      userDoc.password,
      userDoc.phone,
      userDoc.address,
      userDoc.userType,
      userDoc.active
    );

    if (userDoc.userType === "DELIVERY" && deliveryDoc) {
      user.assignDeliveryDetail(
        new DeliveryDetailEntity(
          deliveryDoc._id,
          deliveryDoc.ID,
          user, 
          deliveryDoc.available,
          deliveryDoc.vehicle_info
        )
      );
    }
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
      userType: user.userType,
      active: user.active,
    };
  }

  static toDeliveryPersistence(detail: any, userId: string): any {
    return {
      ID: detail.ID,
      user: userId,
      available: detail.available,
      vehicle_info: detail.vehicle_info,
    };
  }

  static fromCreateDto(dto: CreateUserDto): UserEntity {
    const user = new UserEntity(
      new Types.ObjectId(),
      dto.ID,
      dto.name,
      dto.email,
      dto.password,
      dto.phone || '',
      dto.address || '',        
      dto.userType ?? UserType.CUSTOMER,
      dto.active ?? UserActive.ACTIVE
    );

    if (dto.userType === UserType.DELIVERY && dto.deliveryDetail) {
      const delivery = new DeliveryDetailEntity(
        new Types.ObjectId(),
        dto.deliveryDetail.ID,
        user,
        dto.deliveryDetail.available,
        dto.deliveryDetail.vehicle_info
      );
      user.assignDeliveryDetail(delivery);
    }

    return user;
  }

}
