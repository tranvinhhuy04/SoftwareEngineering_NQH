import { DeliveryDetailEntity } from "src/users/domain/entities/deliveryDetail.entity";
import { UserEntity } from "../../domain/entities/user.entity";
import { CreateUserDto } from "src/users/application/dto/user/create-user.dto";
import { UserType } from "src/users/domain/enum/user-type.enum";
import { Types } from "mongoose";
import { UserActive } from "src/users/domain/enum/user-active.enum";

export class UserMapper {
  // Document -> Entity
  static docToEntity(userDoc: any, deliveryDoc?: any): UserEntity {
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

  static DtoToEntity(dto: CreateUserDto, userId: string): UserEntity {
    const user = new UserEntity(
      new Types.ObjectId(), // hoặc nhận từ Use Case
      userId,
      dto.name,
      dto.email,
      dto.password,
      dto.phone || '',
      dto.address || '',
      dto.userType,
      dto.active ?? UserActive.ACTIVE
    );

    // Nếu DTO có deliveryDetail thì tạo entity, nhưng Use Case mới quyết định khi nào gán
    let deliveryDetail: DeliveryDetailEntity | undefined = undefined;
    if (dto.deliveryDetail) {
      deliveryDetail = new DeliveryDetailEntity(
        new Types.ObjectId(),
        dto.deliveryDetail.ID,
        user,
        dto.deliveryDetail.available,
        dto.deliveryDetail.vehicle_info
      );
    }

    return user;
  }
}

