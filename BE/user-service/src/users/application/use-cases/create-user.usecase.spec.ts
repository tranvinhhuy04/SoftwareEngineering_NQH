import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserUseCase } from './createUser.usecase';
import { IUserRepository } from '../../domain/respositories/user.repository';
import { USER_REPOSITORY } from '../../constants';
import { UserType } from '../../domain/enum/user-type.enum';
import { UserActive } from '../../domain/enum/user-active.enum';
import { Available } from '../../domain/enum/delivery-available.enum';
import { Vehicle } from '../../domain/enum/delivery-vehicle.enum';
import { UserEntity } from '../../domain/entities/user.entity';
import { CreateUserDto } from '../dto/user/create-user.dto';
import { IdGeneratorService } from '../../domain/services/id-generator.service';

// Mock repository
class MockUserRepository implements IUserRepository {
  findById(id: string): Promise<UserEntity | null> {
    throw new Error('Method not implemented.');
  }
  findByEmail(email: string): Promise<UserEntity | null> {
    throw new Error('Method not implemented.');
  }
  findAll(): Promise<UserEntity[]> {
    throw new Error('Method not implemented.');
  }
  remove(id: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  save = jest.fn((user: UserEntity) => Promise.resolve(user));
}

// Mock IdGeneratorService
jest.spyOn(IdGeneratorService, 'generateId').mockImplementation((userType) => {
  if (userType === UserType.CUSTOMER) return 'U001';
  if (userType === UserType.DELIVERY) return 'U002';
  return 'U000';
});

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let repo: MockUserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserUseCase,
        { provide: USER_REPOSITORY, useClass: MockUserRepository },
      ],
    }).compile();

    useCase = module.get<CreateUserUseCase>(CreateUserUseCase);
    repo = module.get<MockUserRepository>(USER_REPOSITORY);
  });

  it('should create a normal user', async () => {
    const dto: CreateUserDto = {
      name: 'Nguyen Van Teo',
      email: 'hello@example.com',
      password: 'password123',
      phone: '0901234567',
      address: '123 Le Loi, Hanoi',
      userType: UserType.CUSTOMER,
      active: UserActive.ACTIVE,
    };

    const user = await useCase.execute(dto);

    expect(user).toBeDefined();
    expect(user.ID).toBe('U001');
    expect(repo.save).toHaveBeenCalledWith(user);
  });

  it('should create a delivery user with deliveryDetail', async () => {
    const dto: CreateUserDto = {
      name: 'Tran Thi D',
      email: 'heob@example.com',
      password: 'password456',
      phone: '0912345678',
      address: '456 Tran Hung Dao, HCM',
      userType: UserType.DELIVERY,
      active: UserActive.ACTIVE,
      deliveryDetail: {
        ID: '', // IdGeneratorService sẽ tạo ID
        user: '', // user ID sẽ được set trong use case
        available: Available.ASSIGN,
        vehicle_info: Vehicle.MOTORBIKE,
      },
    };

    const user = await useCase.execute(dto);

    expect(user).toBeDefined();
    expect(user.ID).toBe('U002');
    expect(user.getDeliveryDetail()).toBeDefined();
    expect(user.getDeliveryDetail()?.vehicle_info).toBe(Vehicle.MOTORBIKE);
    expect(repo.save).toHaveBeenCalledWith(user);
  });
});
