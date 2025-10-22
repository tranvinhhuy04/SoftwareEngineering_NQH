import { StaffProfileEntity } from "src/users/domain/entities/staffProfile.entity";
import { UserEntity } from "src/users/domain/entities/user.entity";

export class StaffMapper {
  // 🧩 1️⃣ Document hoặc Row -> Entity
  static toEntity(staff: any): StaffProfileEntity | null {
    if (!staff) return null;

    return new StaffProfileEntity(
      staff.ID || staff.id,
      staff.user || staff.userId, // Mongo dùng 'user', SQL dùng 'userId'
      staff.shift,
      staff.isActive,
      staff.handledOrders,
      staff._id || staff.id || undefined
    );
  }

  // 🧩 2️⃣ Entity -> Object để lưu DB
  static toStaffPersistence(staff: StaffProfileEntity, user: UserEntity): any {
    const dbType = process.env.DB_TYPE || 'mongo';

    // MongoDB
    if (dbType === 'mongo') {
      return {
        ID: staff.ID,
        user: user.get_Id(),
        shift: staff.shift,
        isActive: staff.isActive,
        handledOrders: staff.handledOrders,
      };
    }

    // MySQL
    return {
      id: staff.ID,
      userId: user.get_Id(),
      shift: staff.shift,
      isActive: staff.isActive,
      handledOrders: staff.handledOrders,
    };
  }

  // 🧩 3️⃣ DTO -> Entity (dùng cho CreateUserUseCase)
  static mapperStaffDtoToEntity(
    dto: any,
    user: UserEntity,
    staffProfileID: string
  ): StaffProfileEntity {
    return new StaffProfileEntity(
      staffProfileID,
      user.get_Id() as string,
      dto.shift || null,
      dto.isActive ?? true,
      dto.handledOrders ?? 0,
      undefined
    );
  }
}
