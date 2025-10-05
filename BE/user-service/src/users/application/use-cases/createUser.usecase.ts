import { Inject, Injectable } from "@nestjs/common";
import * as userRepository from "src/users/domain/respositories/user.repository";
import { CreateUserDto } from "../dto/user/create-user.dto";
import { UserEntity } from "src/users/domain/entities/user.entity";
import { UserMapper } from "src/users/infrastructure/mappers/user.mapper";
import { UserType } from "src/users/domain/enum/user-type.enum";
import { IdGeneratorService } from "src/users/domain/services/id-generator.service";
import { USER_REPOSITORY } from "src/users/constants";
import { BcryptPasswordService } from "src/users/infrastructure/services/bcrypt-password.service";
import { RpcException } from "@nestjs/microservices";

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: userRepository.IUserRepository,
    private readonly hashService: BcryptPasswordService,
  ) {}

  async execute(dto: CreateUserDto): Promise<UserEntity> {
    this.validateInput(dto);

    // Kiểm tra email trùng
    const existingUser = await this.userRepo.findByEmail(dto.email);
    if (existingUser) {
      throw new RpcException({
        statusCode: 409,
        message: 'Email already in use',
      });
    }

    // Sinh ID và entity user
    const userId = IdGeneratorService.generateId(dto.userType);
    const user = UserMapper.mapperUserDtoToEntity(dto, userId);

    // Hash password
    user.password = await this.hashService.hashPassword(dto.password);

    // Gán profile theo loại user
    this.assignProfile(dto, user);

    // Lưu user vào repository
    return this.userRepo.save(user);
  }

  // ============================ PRIVATE HELPERS ============================

  /** Validate DTO input logic */
  private validateInput(dto: CreateUserDto): void {
    if (!dto) {
      throw new RpcException({ statusCode: 400, message: 'Invalid user data' });
    }

    if (!dto.email?.trim()) {
      throw new RpcException({ statusCode: 400, message: 'Email is required' });
    }

    if (!dto.password?.trim()) {
      throw new RpcException({ statusCode: 400, message: 'Password is required' });
    }

    if (!dto.userType || !(Object.values(UserType) as string[]).includes(dto.userType)) {
      throw new RpcException({ statusCode: 400, message: 'Invalid user type' });
    }
  }

  /** Assign the correct profile type based on userType */
  private assignProfile(dto: CreateUserDto, user: UserEntity): void {
    switch (user.userType) {
      case UserType.DELIVERY:
        if (dto.deliveryProfile) {
          const deliveryId = IdGeneratorService.generateDeliveryProfileId();
          const delivery = UserMapper.mapperDeliveryDtoToEntity(dto.deliveryProfile, user, deliveryId);
          user.assignDeliveryProfile(delivery);
        }
        break;

      case UserType.STAFF:
        if (dto.staffProfile) {
          const staffId = IdGeneratorService.generateStaffProfileId();
          const staff = UserMapper.mapperStaffDtoToEntity(dto.staffProfile, user, staffId);
          user.assignStaffProfile(staff);
        }
        break;

      case UserType.CUSTOMER:
        if (dto.customerProfile) {
          const customerId = IdGeneratorService.generateCustomerProfileId();
          const customer = UserMapper.mapperCustomerDtoToEntity(dto.customerProfile, user, customerId);
          user.assignCustomerProfile(customer);
        }
        break;
    }
  }
}
