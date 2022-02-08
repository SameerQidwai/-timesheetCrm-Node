import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Base } from './common/base';

@Entity('leave_request_types')
export class LeaveRequestType extends Base {
  @Column({ name: 'label' })
  label: string;
}
