import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm'; 
import { Base } from './common/base';
import { TimeOffPolicy } from './timeOffPolicy';
import { TimeOffType } from './timeOffType';

export enum IncreaseEvery {
   MONTHLY = 'M',
   YEARLY = 'Y'
} 

@Entity("time_off_policy_time_off_types") 
export class TimeOffPolicyTimeOffType extends Base { 

   @ManyToOne(() => TimeOffPolicy)
   @JoinColumn({ name: "time_off_policy_id" })
    timeOffPolicy: TimeOffPolicy;

   @ManyToOne(() => TimeOffType)
   @JoinColumn({ name: "time_off_type_id" })
   timeOffType: TimeOffType;

   @Column({ type: "int", name: "hours" }) 
   hours: number;

   @Column({
      type: "enum",
      enum: IncreaseEvery,
      name: "increase_every"
   }) 
   increaseEvery: IncreaseEvery;

   @Column("int") 
   threshold: number;
   
}