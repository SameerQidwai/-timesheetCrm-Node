import { Entity, Column } from 'typeorm'; 
import { Base } from './common/base';

@Entity("organizations") 
export class Organization extends Base { 

   @Column() 
   name: string;
   
   @Column({ name: "phone_number" }) 
   phoneNumber: string;
   
   @Column() 
   email: string;

   @Column({ type: "text", name: "address" }) 
   address: string;

   @Column() 
   website: string;

}