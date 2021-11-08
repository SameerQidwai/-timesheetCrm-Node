import { EntityType } from '../constants/constants';
import { Entity, Column, JoinColumn, ManyToOne } from 'typeorm';
import { Base } from './common/base';
import { Attachment } from './attachment';
import { Employee } from './employee';

@Entity('comments')
export class Comment extends Base {
  @Column({ name: 'content' })
  content: string;
  @Column({ type: "varchar", length: "20", name: 'target_type' })
  targetType: EntityType;
  @Column({ name: 'target_id' })
  targetId: number;
  @Column({ name: 'user_id', nullable: false })
  userId: number;

  // @ManyToOne(() => Employee)
  // @JoinColumn({ name: 'user_id' })
  // employee: Employee;
}
