import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../database/user.schema';
import { DeliveryDetail, DeliveryDetailDocument } from '../database/deliveryDetail.schema';
import { IUserService } from '../../application/Interface/user-services.interface';
import { CreateUserDto } from 'src/users/application/dto/user/create-user.dto';
import { UpdateUserDto } from 'src/users/application/dto/user/update-user.dto';
import { UpdateDeliveryDetailDto } from 'src/users/application/dto/delivery-detail/update-deliveryDetail.dto';

@Injectable()
export class UsersService implements IUserService{
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(DeliveryDetail.name) private deliveryDetail: Model<DeliveryDetailDocument>,

  ) {}
  create(createUserDto: CreateUserDto): Promise<User> {
    throw new Error('Method not implemented.');
  }
  updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    throw new Error('Method not implemented.');
  }
  updateDeliveryDetail(id: string, updateDeliveryDetailDto: UpdateDeliveryDetailDto): Promise<DeliveryDetail> {
    throw new Error('Method not implemented.');
  }
  remove(id: string): Promise<User> {
    throw new Error('Method not implemented.');
  }
  findAll(): Promise<User[]> {
    throw new Error('Method not implemented.');
  }
  findById(id: string): Promise<User | null> {
    throw new Error('Method not implemented.');
  }
  findByEmail(email: string): Promise<User | null> {
    throw new Error('Method not implemented.');
  }
  findByPhone(phone: string): Promise<User | null> {
    throw new Error('Method not implemented.');
  }
  findByUserType(userType: string): Promise<User[]> {
    throw new Error('Method not implemented.');
  }
  findByStatus(active: string): Promise<User[]> {
    throw new Error('Method not implemented.');
  }
  findByVehicle(vehicleInfo: string): Promise<User[]> {
    throw new Error('Method not implemented.');
  }
  search(keyword: string): Promise<User[]> {
    throw new Error('Method not implemented.');
  }
  paginate(page: number, limit: number): Promise<{ data: User[]; total: number; }> {
    throw new Error('Method not implemented.');
  }
  getDeliveryDetailByUserId(userId: string): Promise<DeliveryDetail | null> {
    throw new Error('Method not implemented.');
  }
}
