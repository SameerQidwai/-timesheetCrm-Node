import { Entity, Column, OneToMany } from 'typeorm'; 
import { Base } from './common/base';
import { StandardSkillStandardLevel } from './standardSkillStandardLevel';

@Entity("standard_skills")
export class StandardSkill extends Base {

  @Column({ name: "label" })
  label: string;

  @OneToMany(() => StandardSkillStandardLevel, standardSkillStandardLevel => standardSkillStandardLevel.standardSkill, { 
    cascade: true 
  })
  standardSkillStandardLevels: StandardSkillStandardLevel[];

}