import { Entity, Column, ManyToOne, JoinColumn, ManyToMany } from 'typeorm';
import { Base } from './common/base';
import { StandardSkill } from './standardSkill';
import { StandardLevel } from './standardLevel';
import { ContactPerson } from './contactPerson';

@Entity('standard_skill_standard_levels')
export class StandardSkillStandardLevel extends Base {
  @Column({ name: 'standard_skill_id', nullable: true })
  standardSkillId: number;

  @Column({ name: 'standard_level_id', nullable: true })
  standardLevelId: number;

  @ManyToOne(() => StandardSkill)
  @JoinColumn({ name: 'standard_skill_id' })
  standardSkill: StandardSkill;

  @ManyToOne(() => StandardLevel)
  @JoinColumn({ name: 'standard_level_id' })
  standardLevel: StandardLevel;

  @Column({ type: 'int', name: 'priority' })
  priority: number;

  @ManyToMany(
    () => ContactPerson,
    (contactPerson) => contactPerson.standardSkillStandardLevels
  )
  contactPersons: ContactPerson[];
}
