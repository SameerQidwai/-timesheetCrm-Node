import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm'; 
import { Base } from './common/base';

@Entity("standard_levels") 
export class StandardLevel extends Base {

   @Column({ name: "label" })
   label: string;

}