import { Entity, Column, PrimaryColumn, OneToOne, JoinColumn } from 'typeorm';
import { StaffShift } from '../../../domain/enum/staff-shift.enum';
import { UserSql } from './user.entity';

@Entity('staff_profiles')
export class StaffProfileSql {
  @PrimaryColumn({ length: 50 })
  ID: string;

  @Column({ length: 50 })
  userId: string;

  @Column({
    type: 'enum',
    enum: StaffShift,
    default: StaffShift.MORNING,
  })
  shift: StaffShift;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  handledOrders: number;

}
