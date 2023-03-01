import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Base } from './common/base';
import { StandardSkillStandardLevel } from './standardSkillStandardLevel';

@Entity('standard_levels')
export class StandardLevel extends Base {
  @Column({ name: 'label' })
  label: string;

  @OneToMany(
    () => StandardSkillStandardLevel,
    (standardSkillStandardLevel) => standardSkillStandardLevel.standardLevel,
    {
      cascade: true,
    }
  )
  standardSkillStandardLevels: StandardSkillStandardLevel[];
}
