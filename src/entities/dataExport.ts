import { Entity, Column } from 'typeorm';
import { Base } from './common/base';
import { Entities } from '../constants/constants';

@Entity('data_exports')
export class DataExport extends Base {
  @Column({ type: 'varchar', length: '20', name: 'type', unique: true })
  type: Entities;
  @Column({ name: 'progress', default: 0 })
  progress: number;
  @Column({ name: 'active', default: false })
  active: boolean;
  @Column({ name: 'downloaded', default: false })
  downloaded: boolean;
}
