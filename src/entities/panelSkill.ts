import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm'; 
import { Base } from './common/base';
import { Panel } from './panel';
import { StandardSkill } from './standardSkill';
import { PanelSkillStandardLevel } from './panelSkillStandardLevel';

@Entity("panel_skills")
export class PanelSkill extends Base {

  @Column({ name: "label" })
  label: string;

  @ManyToOne(() => StandardSkill, standardSkill => standardSkill.panelSkills)
  @JoinColumn({ name: "standard_skill_id" })
  standardSkill: StandardSkill;

  @ManyToOne(() => Panel)
  @JoinColumn({ name: "panel_id" })
  panel: Panel;

  @OneToMany(() => PanelSkillStandardLevel, panelSkillStandardLevel => panelSkillStandardLevel.panelSkill, { 
    cascade: true 
  })
  panelSkillStandardLevels: PanelSkillStandardLevel[];


}