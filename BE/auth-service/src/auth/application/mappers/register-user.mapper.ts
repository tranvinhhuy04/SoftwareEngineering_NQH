import { RegisterUserDto } from "../dto/register-user.dto";
import { UserAuth } from "src/auth/domain/entity/auth-user.entity";

export class RegisterUserMapper {
  /**
   * 🔄 Chuyển DTO từ AuthService sang payload để gửi tới UserService (qua RMQ)
   */
  static toUserServicePayload(dto: RegisterUserDto) {
    return {
      name: dto.name,
      email: dto.email,
      password: dto.password,
      phone: dto.phone,
      address: dto.address,
      userType: dto.userType ?? 'customer', // ✅ fallback an toàn
      active: dto.active ?? 'active',
      avatar: dto.avatar,
      staffProfile: dto.staffProfile,
      deliveryProfile: dto.deliveryProfile,
      customerProfile: dto.customerProfile,
    };
  }

  /**
   * 🧱 Tạo entity UserAuth để lưu vào Auth DB (Mongo)
   */
  static toAuthEntity(dto: RegisterUserDto, userId: string, hash: string): UserAuth {
    return new UserAuth(
      '', // Mongo sẽ tự sinh _id
      userId,
      dto.email,
      hash,                        // ✅ mật khẩu đã hash
      true,                        // isActive mặc định
      dto.userType?.trim() || 'customer', // ✅ nếu rỗng thì mặc định customer
      new Date(),                  // createdAt
      new Date(),                  // updatedAt
    );
  }
}
