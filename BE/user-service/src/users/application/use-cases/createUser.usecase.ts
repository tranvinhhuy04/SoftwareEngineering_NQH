import { Inject, Injectable } from "@nestjs/common";
import * as userRepository from "src/users/domain/respositories/user.repository";
import { CreateUserDto } from "../dto/user/create-user.dto";
import { UserEntity } from "src/users/domain/entities/user.entity";
import { UserMapper } from "src/users/infrastructure/mappers/user.mapper";
import { UserType } from "src/users/domain/enum/user-type.enum";
import { DeliveryDetailEntity } from "src/users/domain/entities/deliveryDetail.entity";
import { Types } from "mongoose";
import { IdGeneratorService } from "src/users/domain/services/id-generator.service";
import { USER_REPOSITORY } from "src/users/constants";

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) 
    private readonly userRepo: userRepository.IUserRepository
) {}

  async execute(dto: CreateUserDto): Promise<UserEntity> {
    const userId = dto.ID ?? IdGeneratorService.generateId(dto.userType); // tạo ID nếu chưa có

    const user = UserMapper.DtoToEntity(dto, userId);

    // Nếu userType là DELIVERY, gán deliveryDetail
    if (user.userType === UserType.DELIVERY && dto.deliveryDetail) {
      const delivery = new DeliveryDetailEntity(
        new Types.ObjectId(),
        IdGeneratorService.generateId(dto.userType),
        user,
        dto.deliveryDetail.available,
        dto.deliveryDetail.vehicle_info
      );
      user.assignDeliveryDetail(delivery);
    }

    return this.userRepo.save(user);
  }
}

