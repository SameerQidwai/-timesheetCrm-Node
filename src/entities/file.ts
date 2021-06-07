import { Entity, Column, OneToMany } from 'typeorm';
import { Base } from './common/base';

@Entity('files')
export class File extends Base {
  @Column({ name: 'unique_name' })
  uniqueName: string;
  @Column({ name: 'original_name' })
  originalName: string;
  @Column({ name: 'type' })
  type: string;
  @Column({ name: 'user_id', nullable: false })
  userId: number;
}
