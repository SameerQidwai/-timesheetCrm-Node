import { Entity, Column } from 'typeorm'; 
import { Base } from './common/base';

@Entity("states") 
export class State extends Base {

   @Column({ name: "label" })
   label: string;

}