import { Entity, Column } from 'typeorm'; 
import { Base } from './common/base';

@Entity("holiday_types") 
export class HolidayType extends Base {

   @Column({ name: "label" })
   label: string;

}