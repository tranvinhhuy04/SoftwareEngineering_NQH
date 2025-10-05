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
      user.assignDeliveryProfile(
        new DeliveryProfileEntity(
          deliveryDoc._id,
          deliveryDoc.ID,
          user.get_Id(),
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

  static toDeliveryPersistence(detail: any, user: UserEntity): any {
    return {
      _id: new Types.ObjectId(),
      ID: detail.ID,
      user: user.get_Id(),
      available: detail.available,
      vehicle_info: detail.vehicle_info,
    };
  }

  static toStaffPersistence(staff: any, user: UserEntity): any {
    return {
      _id: new Types.ObjectId(),
      ID: staff.ID,
      user: user.get_Id(),
      shift: staff.shift,
      isActive: staff.isActive,
      handledOrders: staff.handledOrders,
    };
  }

  static toCustomerPersistence(customer: any, user: UserEntity): any {
    return {
      _id: new Types.ObjectId(),
      ID: customer.ID,
      user: user.get_Id(),
      defaultAddress: customer.defaultAddress,
      preferredPaymentMethod: customer.preferredPaymentMethod,
      savedPaymentMethods: customer.savedPaymentMethods || [],
      favoriteItems: customer.favoriteItems || []
    };
  }

  // DTO -> Entity
  static mapperUserDtoToEntity(dto: CreateUserDto, userId: string): UserEntity {
    const user = new UserEntity(
      new Types.ObjectId(), // hoặc nhận từ Use Case
      userId,
      dto.name,
      dto.email,
      dto.password,
      dto.phone || '',
      dto.address || '',
      dto.avatar || '',
      dto.userType ?? UserType.CUSTOMER,
      dto.active ?? UserActive.ACTIVE,

    );
    return user;
  }

  static mapperDeliveryDtoToEntity(dto: any, user: UserEntity, deliveryProfileID: string): DeliveryProfileEntity {
    return new DeliveryProfileEntity(
      new Types.ObjectId(), // hoặc nhận từ Use Case
      deliveryProfileID,
      user.get_Id(),
      dto.available ?? Available.ASSIGN,
      dto.vehicle_info ?? Vehicle.MOTORBIKE
    );
  }

  static mapperStaffDtoToEntity(dto: any, user: UserEntity, staffProfileID: string): StaffProfileEntity {
    return new StaffProfileEntity(
      new Types.ObjectId(), // hoặc nhận từ Use Case
      staffProfileID,
      user.get_Id(),
      dto.shift || '',
      dto.isActive || true,
      dto.handledOrders || 0,
    );
  }

  static mapperCustomerDtoToEntity(dto: any, user: UserEntity, customerProfileID: string): any {
    return {
      _id: new Types.ObjectId(), // hoặc nhận từ Use Case
      ID: customerProfileID,
      user: user.get_Id(),
      defaultAddress: dto.defaultAddress ?? '',
      preferredPaymentMethod: dto.preferredPaymentMethod ?? '',
      savedPaymentMethods: dto.savedPaymentMethods ?? [],
      favoriteItems: dto.favoriteItems ?? []
    };
  }
}

