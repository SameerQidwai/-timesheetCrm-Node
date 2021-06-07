import { EntityType } from '../constants/constants';
import { Entity, Column, OneToMany, JoinColumn } from 'typeorm';
import { Base } from './common/base';
import { Attachment } from './attachment';

@Entity('comments')
export class Comment extends Base {
  @Column({ name: 'content' })
  content: string;
  @Column({ name: 'target_type' })
  targetType: EntityType;
  @Column({ name: 'target_id' })
  targetId: number;
  @Column({ name: 'user_id', nullable: false })
  userId: number;
}
