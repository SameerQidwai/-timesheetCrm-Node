import { TimeoffTriggerFrequency } from '../constants/constants';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm'; 
import { Base } from './common/base';
import { TimeOffPolicy } from './timeOffPolicy';
import { TimeOffType } from './timeOffType';

@Entity("time_off_policy_time_off_types") 
export class TimeOffPolicyTimeOffType extends Base { 

   @Column({ name: "time_off_policy_id" }) 
   timeOffPolicyId: number;

   @Column({ name: "time_off_type_id" }) 
   timeOffTypeId: number;

   @Column({ type: "int", name: "earn_hours" }) 
   earnHours: number;

   @Column({
      type: "enum",
      enum: TimeoffTriggerFrequency,
      name: "earn_every"
   }) 
   earnEvery: TimeoffTriggerFrequency;

   @Column({ type: "int", name: "reset_hours" }) 
   resetHours: number;

   @Column({
      type: "enum",
      enum: TimeoffTriggerFrequency,
      name: "reset_every"
   }) 
   resetEvery: TimeoffTriggerFrequency;

   @Column("int")
   threshold: number;

   @ManyToOne(() => TimeOffPolicy)
   @JoinColumn({ name: "time_off_policy_id" })
   timeOffPolicy: TimeOffPolicy;

   @ManyToOne(() => TimeOffType)
   @JoinColumn({ name: "time_off_type_id" })
   timeOffType: TimeOffType;
}