import { Entity, Column, OneToMany } from 'typeorm'; 
import { Base } from './common/base';

@Entity("time_off_policies")
export class TimeOffPolicy extends Base {

  @Column({ name: "label" })
  label: string;

}