import { Types } from "mongoose";
import { StaffProfileEntity } from "src/users/domain/entities/staffProfile.entity";
import { UserEntity } from "src/users/domain/entities/user.entity";

export class StaffMapper {
    static toEntity(staffDoc: any): StaffProfileEntity | null {
        if (!staffDoc) return null;

        return new StaffProfileEntity(
            staffDoc._id,
            staffDoc.ID,
            staffDoc.user,
            staffDoc.shift,
            staffDoc.isActive,
            staffDoc.handledOrders
        );
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
}