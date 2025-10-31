
## 📂 `infrastructure/`

Thư mục **infrastructure** chứa các phần triển khai chi tiết để kết nối domain với thế giới bên ngoài: cơ sở dữ liệu, API, thư viện framework.

Nó là  **implementation layer** , đóng vai trò **cầu nối** giữa `domain/` và các công nghệ cụ thể (NestJS, Mongoose, Redis, …).

---

### 📁 Cấu trúc

```
infrastructure/
 ├── database/
 │    ├── user.schema.ts
 |── mappers/
 │    └── user.mapper.ts
 └── repositories/
      └── user.repository.impl.ts
```

---

### 📌 Chi tiết các thành phần

#### 1. **Database**

* Chứa các cấu hình liên quan đến **ORM/ODM** hoặc framework DB.
* **`user.schema.ts`** : định nghĩa schema cho MongoDB bằng `@nestjs/mongoose`.
* **`user.mapper.ts`** : ánh xạ (mapping) giữa **Entity (domain)** và  **Schema (db model)** .

👉 Ví dụ `user.schema.ts`

```ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'Users' })
export class UserSchemaClass {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  role: string;
}

export type UserSchemaDocument = UserSchemaClass & Document;
export const UserSchema = SchemaFactory.createForClass(UserSchemaClass);
```

👉 Ví dụ `user.mapper.ts`

```ts
import { UserEntity } from '../../domain/entities/user.entity';
import { UserSchemaClass } from './user.schema';

export class UserMapper {
  static toEntity(user: UserSchemaClass): UserEntity {
    return new UserEntity(user._id.toString(), user.name, user.email, user.role);
  }

  static toPersistence(user: UserEntity): any {
    return {
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }
}
```

---

#### 2. **Repositories**

* Chứa **implementation (impl)** của các repository interface trong `domain/repositories/`.
* Kết nối Entity ↔ DB bằng  **mapper** .
* Đặt tại `infrastructure/repositories/`.

👉 Ví dụ `user.repository.impl.ts`

```ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { UserEntity } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UserSchemaClass, UserSchemaDocument } from '../database/user.schema';
import { UserMapper } from '../database/user.mapper';

@Injectable()
export class UserRepositoryImpl implements UserRepository {
  constructor(
    @InjectModel(UserSchemaClass.name) private userModel: Model<UserSchemaDocument>,
  ) {}

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.userModel.findById(id).exec();
    return user ? UserMapper.toEntity(user) : null;
  }
}
```
