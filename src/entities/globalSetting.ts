import { Entity, Column } from 'typeorm'; 
import { Base } from './common/base';

@Entity("global_settings") 
export class GlobalSetting extends Base { 

   @Column({ name: "time_zone"}) 
   timeZone: number;
   
   @Column({ name: "records_per_page"}) 
   recordsPerPage: number;
   
   @Column({ name: "from_email"}) 
   fromEmail: string;
}