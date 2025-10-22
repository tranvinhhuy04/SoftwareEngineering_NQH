import { Entity, Column, PrimaryColumn, OneToOne, JoinColumn } from 'typeorm';
import { Available } from '../../../domain/enum/delivery-available.enum';
import { Vehicle } from '../../../domain/enum/delivery-vehicle.enum';
import { UserSql } from './user.entity';
@Entity('delivery_profiles')
export class DeliveryProfileSql {
  @PrimaryColumn({ length: 50 })
  ID: string;

  @Column({ name: 'userId', length: 50 })
  userId: string;

  @Column({ type: 'enum', enum: Available })
  available: Available;

  @Column({ type: 'enum', enum: Vehicle })
  vehicle_info: Vehicle;
}
