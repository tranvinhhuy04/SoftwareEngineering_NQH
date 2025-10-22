import { Entity, Column, PrimaryColumn, OneToOne, JoinColumn } from 'typeorm';
import { UserSql } from './user.entity';

@Entity('customer_profiles')
export class CustomerProfileSql {
  @PrimaryColumn({ length: 50 })
  ID: string;

  @Column({ length: 50 })
  userId: string;

  @Column({ length: 255, nullable: true })
  defaultAddress?: string;

  @Column({ length: 100, nullable: true })
  preferredPaymentMethod?: string;

  @Column('simple-array', { nullable: true })
  savedPaymentMethods?: string[];

  @Column('simple-array', { nullable: true })
  favoriteItems?: string[];

}
