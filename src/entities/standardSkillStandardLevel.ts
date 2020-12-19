import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm'; 
import { Base } from './common/base';
import { StandardSkill } from './standardSkill';
import { StandardLevel } from './standardLevel';

@Entity("standard_skill_standard_levels") 
export class StandardSkillStandardLevel extends Base { 

   @ManyToOne(() => StandardSkill)
   @JoinColumn({ name: "standard_skill_id" })
    standardSkill: StandardSkill;

   @ManyToOne(() => StandardLevel)
   @JoinColumn({ name: "standard_level_id" })
   standardLevel: StandardLevel;

   @Column({ type: "int", name: "priority" }) 
   priority: number;

}