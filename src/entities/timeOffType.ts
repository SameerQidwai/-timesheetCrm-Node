import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm'; 
import { Base } from './common/base';

@Entity("time_off_types") 
export class TimeOffType extends Base {

   @Column({ name: "label" })
   label: string;

}