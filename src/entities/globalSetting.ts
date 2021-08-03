import { Entity, Column } from 'typeorm'; 
import { Base } from './common/base';

@Entity("global_settings") 
export class GlobalSetting extends Base { 

   @Column({ name: "key_label"}) 
   keyLabel: string;
   
   @Column({ name: "key_value"}) 
   keyValue: string;
   
   @Column({ name: "data_type"}) 
   dataType: string;
}