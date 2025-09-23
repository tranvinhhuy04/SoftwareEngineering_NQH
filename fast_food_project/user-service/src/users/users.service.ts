import { Injectable, NotFoundException, InternalServerErrorException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClientProxy } from '@nestjs/microservices';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @Inject('USER_SERVICE') private readonly client: ClientProxy, // 👈 inject client
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const createdUser = new this.userModel(createUserDto);
      const savedUser = await createdUser.save();

      // emit event sau khi tạo user
      this.client.emit('user_created', savedUser);

      return savedUser;
    } catch (error) {
      throw new InternalServerErrorException('Error creating user');
    }
  }

  async findAll(): Promise<User[]> {
    try {
      return await this.userModel.find().exec();
    } catch (error) {
      throw new InternalServerErrorException('Error fetching users');
    }
  }

  async findOne(id: string): Promise<User> {
    try {
      const user = await this.userModel.findById(id).exec();
      if (!user) {
        throw new NotFoundException(`User with id ${id} not found`);
      }
      return user;
    } catch (error) {
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException('Error fetching user');
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      const user = await this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true }).exec();
      if (!user) {
        throw new NotFoundException(`User with id ${id} not found`);
      }

      // emit event sau khi update user
      this.client.emit('user_updated', user);

      return user;
    } catch (error) {
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException('Error updating user');
    }
  }

  async remove(id: string): Promise<User> {
    try {
      const user = await this.userModel.findByIdAndDelete(id).exec();
      if (!user) {
        throw new NotFoundException(`User with id ${id} not found`);
      }

      // emit event sau khi delete user
      this.client.emit('user_deleted', { id });

      return user;
    } catch (error) {
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException('Error deleting user');
    }
  }
}
