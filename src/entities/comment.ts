import { EntityType } from '../constants/constants';
import { Entity, Column, OneToMany } from 'typeorm';
import { Base } from './common/base';

@Entity('comments')
export class Comment extends Base {
  @Column({ name: 'content' })
  content: string;
  @Column({ name: 'target_type' })
  type: EntityType;
  @Column({ name: 'target_id' })
  targetId: number;
}
