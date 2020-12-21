import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm'; 
import { Base } from './common/base';
import { PanelSkill } from './panelSkill';

@Entity("panels") 
export class Panel extends Base {

   @Column({ name: "label" })
   label: string;
   
   @OneToMany(() => PanelSkill, panelSkill => panelSkill.panel, { 
      cascade: true 
    })
    panelSkills: PanelSkill[];

}