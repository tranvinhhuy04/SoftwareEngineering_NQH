import {Entity, Column, PrimaryColumn, OneToOne,JoinColumn,CreateDateColumn,UpdateDateColumn,} from 'typeorm';
import { UserType } from '../../../domain/enum/user-type.enum';
import { UserActive } from '../../../domain/enum/user-active.enum';
import { CustomerProfile } from '../mongo/customerProfile.schema';
import { StaffProfile } from '../mongo/staffProfile.schema';
import { DeliveryProfile } from '../mongo/deliveryProfile.schema';

@Entity('users')
export class UserSql {
  @PrimaryColumn({ length: 50 })
  ID: string;

  @Column({ length: 100, nullable: false })
  name: string;

  @Column({ length: 100, unique: true, nullable: false })
  email: string;

  @Column({ length: 255, nullable: false })
  password: string;

  @Column({ length: 20, nullable: false })
  phone: string;

  @Column({ length: 255, nullable: true })
  address?: string;

  @Column({ length: 255, nullable: true })
  avatar?: string;

  @Column({
    type: 'enum',
    enum: UserType,
    default: UserType.CUSTOMER,
  })
  userType: UserType;

  @Column({
    type: 'enum',
    enum: UserActive,
    default: UserActive.ACTIVE,
  })
  active: UserActive;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
