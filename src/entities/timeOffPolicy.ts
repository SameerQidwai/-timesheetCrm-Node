import { Entity, Column, OneToMany } from 'typeorm'; 
import { Base } from './common/base';
import { TimeOffPolicyTimeOffType } from './timeOffPolicyTimeOffType';

@Entity("time_off_policies")
export class TimeOffPolicy extends Base {

  @Column({ name: "label" })
  label: string;

  @OneToMany(() => TimeOffPolicyTimeOffType, timeOffPolicyTimeOffType => timeOffPolicyTimeOffType.timeOffPolicy, { 
    onDelete: "CASCADE",
    onUpdate: "CASCADE", 
    cascade: true 
  })
  timeOffPolicyTimeOffTypes: TimeOffPolicyTimeOffType[];

}