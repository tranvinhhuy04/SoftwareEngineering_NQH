import { Inject, Injectable, Logger } from "@nestjs/common";
import * as userRepository from "src/users/domain/respositories/user.repository";
import { CreateUserDto } from "../dto/user/create-user.dto";
import { UserEntity } from "src/users/domain/entities/user.entity";
import { UserMapper } from "src/users/infrastructure/mappers/user.mapper";
import { UserType } from "src/users/domain/enum/user-type.enum";
import { IdGeneratorService } from "src/users/domain/services/id-generator.service";
import { USER_REPOSITORY } from "src/users/constants";
import { BcryptPasswordService } from "src/users/infrastructure/services/bcrypt-password.service";
import { RpcException } from "@nestjs/microservices";
import { DeliveryMapper } from "src/users/infrastructure/mappers/delivery.mapper";
import { StaffMapper } from "src/users/infrastructure/mappers/staff.mapper";
import { CustomerMapper } from "src/users/infrastructure/mappers/customer.mapper";

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: userRepository.IUserRepository,
    private readonly hashService: BcryptPasswordService,
  ) {}

  async execute(dto: CreateUserDto): Promise<UserEntity> {
    this.validateInput(dto);
    Logger.debug(dto)
    // ✅ Kiểm tra email trùng
    const existingUser = await this.userRepo.findByEmail(dto.email);
    if (existingUser) {
      throw new RpcException({
        statusCode: 409,
        message: "Email already in use",
      });
    }

    // ✅ Sinh ID user tùy loại DB
    const dbType = process.env.DB_TYPE || "mongo";
    Logger.debug(`OL`);
    const userId = IdGeneratorService.generateId(dto.userType);
    Logger.debug(`OK`);
    // ✅ Mapping DTO → Entity
    const user = UserMapper.mapperUserDtoToEntity(dto, userId);

    // ✅ Hash password
    user.password = await this.hashService.hashPassword(dto.password);

    // ✅ Gán profile phù hợp với userType
    this.assignProfile(dto, user);
    Logger.debug(this.assignProfile(dto, user))
    Logger.debug(`🚀 Saving user = ${JSON.stringify(user)}`);
    Logger.debug(`🚀 user.deliveryProfile = ${JSON.stringify(user.getDeliveryProfile())}`);


    // ✅ Lưu vào repo (Mongo hoặc SQL đều được)
    const savedUser = await this.userRepo.save(user);

    return savedUser;
  }

  // ============================ PRIVATE HELPERS ============================

  private validateInput(dto: CreateUserDto): void {
    if (!dto) {
      throw new RpcException({ statusCode: 400, message: "Invalid user data" });
    }

    if (!dto.email?.trim()) {
      throw new RpcException({ statusCode: 400, message: "Email is required" });
    }

    if (!dto.password?.trim()) {
      throw new RpcException({ statusCode: 400, message: "Password is required" });
    }

    if (!dto.userType || !(Object.values(UserType) as string[]).includes(dto.userType)) {
      throw new RpcException({ statusCode: 400, message: "Invalid user type" });
    }
  }

  /** Gán profile tương ứng theo loại user */
  private assignProfile(dto: CreateUserDto, user: UserEntity): void {
    const dbType = process.env.DB_TYPE || "mongo";

    switch (user.userType) {
      case UserType.DELIVERY:
      if (dto.deliveryProfile) {
        const deliveryId = IdGeneratorService.generateDeliveryProfileId();
        const delivery = DeliveryMapper.mapperDeliveryDtoToEntity(dto.deliveryProfile, user, deliveryId);
        user.assignDeliveryProfile(delivery);
        Logger.debug(`✅ assignProfile: created deliveryProfile = ${JSON.stringify(delivery)}`);
      } else {
        Logger.warn("⚠️ dto.deliveryProfile is null or undefined");
      }
      break;


      case UserType.STAFF:
        if (dto.staffProfile) {
          const staffId = IdGeneratorService.generateStaffProfileId();

          const staff = StaffMapper.mapperStaffDtoToEntity(
            dto.staffProfile,
            user,
            staffId,
          );

          user.assignStaffProfile(staff);
        }
        break;

      case UserType.CUSTOMER:
        if (dto.customerProfile) {
          const customerId = IdGeneratorService.generateCustomerProfileId();

          const customer = CustomerMapper.mapperCustomerDtoToEntity(
            dto.customerProfile,
            user,
            customerId,
          );

          user.assignCustomerProfile(customer);
        }
        break;
    }
  }
}
