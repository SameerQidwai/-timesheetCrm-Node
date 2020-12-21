import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm'; 
import { Base } from './common/base';
import { StandardSkill } from './standardSkill';
import { StandardLevel } from './standardLevel';
import { PanelSkill } from './panelSkill';

@Entity("panel_skill_standard_levels") 
export class PanelSkillStandardLevel extends Base { 

   @Column({ name: "level_label" })
   levelLabel: string;

   @Column({ type: 'decimal', precision: 10, scale: 3, default: 0, name: "short_term_ceil" })
   shortTermCeil: number;

   @Column({ type: 'decimal', precision: 10, scale: 3, default: 0, name: "long_term_ceil" })
   longTermCeil: number;

   @ManyToOne(() => PanelSkill)
   @JoinColumn({ name: "panel_skill_id" })
    panelSkill: PanelSkill;

   @ManyToOne(() => StandardLevel)
   @JoinColumn({ name: "standard_level_id" })
   standardLevel: StandardLevel;

}