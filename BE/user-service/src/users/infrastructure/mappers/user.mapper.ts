import { DeliveryProfileEntity } from "src/users/domain/entities/deliveryProfile.entity";
import { UserEntity } from "../../domain/entities/user.entity";
import { CreateUserDto } from "src/users/application/dto/user/create-user.dto";
import { UserType } from "src/users/domain/enum/user-type.enum";
import { Types } from "mongoose";
import { UserActive } from "src/users/domain/enum/user-active.enum";
import { StaffProfileEntity } from "src/users/domain/entities/staffProfile.entity";
import { Available } from "src/users/domain/enum/delivery-available.enum";
import { Vehicle } from "src/users/domain/enum/delivery-vehicle.enum";
import { UpdateUserDto } from "src/users/application/dto/user/update-user.dto";

export class UserMapper {

  // 🧩 1️⃣ Khai báo overload signatures (chỉ có khai báo, không có body)
  static toEntity(userDoc: any): UserEntity;
  static toEntity(row: any): UserEntity;

  // 🧩 2️⃣ Thân hàm thực thi (chỉ một cái duy nhất)
  static toEntity(input: any): UserEntity {
    // Nếu là Mongo document (có _id)
    if (input._id !== undefined) {
      return new UserEntity(
        input.ID,
        input.name,
        input.email,
        input.password,
        input.phone,
        input.address,
        input.avatar,
        input.userType,
        input.active,
        input._id
      );
    }

    // Nếu là SQL row (có id thay vì _id)
    return new UserEntity(
      input.id,
      input.name,
      input.email,
      input.password,
      input.phone,
      input.address,
      input.avatar,
      input.userType,
      input.active
    );
  }

  // Entity -> Schema object
static toUserPersistence(user: UserEntity): any {
  const db = process.env.DB_TYPE === 'mysql' ? 'sql' : 'mongo';

  return db === 'sql'
    ? {
        id: user.ID,
        name: user.name,
        email: user.email,
        password: user.password,
        phone: user.phone,
        address: user.address,
        avatar: user.avatar,
        userType: user.userType,
        active: user.active,
      }
    : {
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

  static mergeEntityWithUpdateDto(
    user: UserEntity,
    dto: UpdateUserDto
  ): UserEntity {
    if (dto.name !== undefined) user.name = dto.name;
    if (dto.email !== undefined) user.email = dto.email;
    if (dto.phone !== undefined) user.phone = dto.phone;
    if (dto.address !== undefined) user.address = dto.address;
    if (dto.active !== undefined) user.active = dto.active;

    // ✅ Cập nhật profile an toàn
    if (dto.deliveryProfile) {
      const profile = user.getDeliveryProfile();
      if (profile) Object.assign(profile, dto.deliveryProfile);
    }

    if (dto.customerProfile) {
      const profile = user.getCustomerProfile();
      if (profile) Object.assign(profile, dto.customerProfile);
    }

    if (dto.staffProfile) {
      const profile = user.getStaffProfile();
      if (profile) Object.assign(profile, dto.staffProfile);
    }

    return user;
  }

}

