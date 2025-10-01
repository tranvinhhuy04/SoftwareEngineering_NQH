import { DeliveryDetailEntity } from "src/users/domain/entities/deliveryDetail.entity";
import { UserEntity } from "../../domain/entities/user.entity";

export class UserMapper {
  // Schema -> Entity
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
  static toPersistence(user: UserEntity): any {
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
}
