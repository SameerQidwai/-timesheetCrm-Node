import { Entity, Column } from 'typeorm'; 
import { Base } from './common/base';

@Entity("samples") 
export class Sample extends Base { 

   @Column() 
   title: string;
    
}