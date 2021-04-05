import { IncreaseEvery } from '../constants/constants';
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
      enum: IncreaseEvery,
      name: "earns_every"
   }) 
   earnsEvery: IncreaseEvery;

   @Column("int")
   threshold: number;

   @ManyToOne(() => TimeOffPolicy)
   @JoinColumn({ name: "time_off_policy_id" })
   timeOffPolicy: TimeOffPolicy;

   @ManyToOne(() => TimeOffType)
   @JoinColumn({ name: "time_off_type_id" })
   timeOffType: TimeOffType;
}