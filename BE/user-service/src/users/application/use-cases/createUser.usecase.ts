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
import { BcryptPasswordService } from "src/users/infrastructure/services/bcrypt-password.service";
import { RpcException } from "@nestjs/microservices";

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) 
    private readonly userRepo: userRepository.IUserRepository,
    private readonly hashService: BcryptPasswordService
) {}

  async execute(dto: CreateUserDto): Promise<UserEntity> {
    const userId = IdGeneratorService.generateId(dto.userType); // tạo ID nếu chưa có

    const user = UserMapper.mapperUserDtoToEntity(dto, userId);

    const validUser = await this.userRepo.findByEmail(dto.email);
    if (validUser) {
      throw new RpcException({
        statusCode: 409,
        message: 'Email already in use',
      });
    }

    // hash password
    await this.hashService.hashPassword(dto.password).then(hashed => {
      user.password = hashed;
    });

    // Nếu userType là DELIVERY, gán deliveryDetail
    if (user.userType === UserType.DELIVERY && dto.deliveryDetail) {
      const deliveryDetailID = IdGeneratorService.generateId(UserType.DELIVERY);
      const delivery = UserMapper.mapperDeliveryDtoToEntity(dto.deliveryDetail, user, deliveryDetailID);
      user.assignDeliveryDetail(delivery);

    }
    
    return this.userRepo.save(user);
  }
}

