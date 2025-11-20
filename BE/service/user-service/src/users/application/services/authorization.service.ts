import { ForbiddenException, Injectable } from '@nestjs/common';
import { UserEntity } from '../../domain/entities/user.entity';
import { UserType } from '../../domain/enum/user-type.enum';

@Injectable()
export class AuthorizationService {
  ensureAdmin(user: UserEntity) {
    if (user.userType !== UserType.RESTAURANT_ADMIN) {
      throw new ForbiddenException('Chỉ ADMIN mới được phép thực hiện hành động này');
    }
  }

  ensureAdminOrStaff(user: UserEntity) {
    if (![UserType.RESTAURANT_ADMIN, UserType.STAFF].includes(user.userType)) {
      throw new ForbiddenException('Chỉ ADMIN hoặc STAFF được phép');
    }
  }

  ensureOwnerOrAdmin(user: UserEntity, targetUserId: string) {
    if (user.userType !== UserType.RESTAURANT_ADMIN && user.ID !== targetUserId) {
      throw new ForbiddenException('Chỉ ADMIN hoặc chính chủ mới được truy cập');
    }
  }
}
