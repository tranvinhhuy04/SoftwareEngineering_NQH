import { Types } from "mongoose";
import { StaffProfileEntity } from "src/users/domain/entities/staffProfile.entity";
import { UserEntity } from "src/users/domain/entities/user.entity";

export class StaffMapper {
  /** Convert Mongo Document -> Entity */
  static toEntity(staffDoc: any): StaffProfileEntity | null {
    if (!staffDoc) return null;

    return new StaffProfileEntity(
      staffDoc.ID,
      staffDoc.user,             // ObjectId của user
      staffDoc.shift,
      staffDoc.isActive,
      staffDoc.handledOrders,
      staffDoc._id,              // _id của StaffProfile (nếu có)
    );
  }

  /** Convert Entity -> Mongo persistence object */
  static toStaffPersistence(staff: any, user: UserEntity): any {
    return {
      // ❌ Không ép tạo ObjectId mới nếu lưu trong user
      // Nếu lưu collection riêng thì dùng new ObjectId()
      ID: staff.ID,
      user: new Types.ObjectId(user.get_Id()), // ✅ tham chiếu user._id Mongo
      shift: staff.shift,
      isActive: staff.isActive,
      handledOrders: staff.handledOrders,
    };
  }

  /** Convert DTO -> Entity */
  static mapperStaffDtoToEntity(
    dto: any,
    user: UserEntity,
    staffProfileID: string
  ): StaffProfileEntity {
    return new StaffProfileEntity(
      staffProfileID,
      new Types.ObjectId(user.get_Id()), // ✅ userId = _id Mongo của User
      dto.shift || '',
      dto.isActive ?? true,
      dto.handledOrders ?? 0,
      undefined, // Mongo sẽ tự sinh _id khi save StaffProfile riêng
    );
  }
}
