import { Entity, Column, JoinColumn, ManyToOne } from 'typeorm';
import { Base } from './common/base';
import { ExpenseType } from './expenseType';
import { Milestone } from './milestone';
import { ProjectSchedule } from './projectSchedule';

@Entity('project_schedule_segments')
export class ProjectScheduleSegment extends Base {
  @Column({ name: 'start_date', precision: 3 })
  startDate: Date;

  @Column({ name: 'end_date', precision: 3 })
  endDate: Date;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    name: 'amount',
    nullable: false,
  })
  amount: number;

  @Column({ name: 'schedule_id', nullable: false })
  scheduleId: number;

  @ManyToOne(() => ProjectSchedule)
  @JoinColumn({ name: 'schedule_id' })
  schedule: ProjectSchedule;
}
