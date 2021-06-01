import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { Base } from './common/base';
import { File } from './file';
import { EntityType } from '../constants/constants';

@Entity('attachments')
export class Attachment extends Base {
  @Column({ name: 'target_type' })
  targetType: EntityType;
  @Column({ name: 'file_id' })
  fileId: number;
  @Column({ name: 'target_id' })
  targetId: number;

  @OneToOne(() => File)
  @JoinColumn({ name: 'file_id' })
  file: File;
}
