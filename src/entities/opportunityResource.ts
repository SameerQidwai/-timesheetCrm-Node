import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Base } from './common/base';
import { PanelSkill } from './panelSkill';
import { PanelSkillStandardLevel } from './panelSkillStandardLevel';
import { Opportunity } from './opportunity';
import { Employee } from './employee';
import { OpportunityResourceAllocation } from './opportunityResourceAllocation';
import { Milestone } from './milestone';

@Entity('opportunity_resources')
export class OpportunityResource extends Base {
  @Column({ name: 'panel_skill_id' })
  panelSkillId: number;

  @ManyToOne(() => PanelSkill)
  @JoinColumn({ name: 'panel_skill_id' })
  panelSkill: PanelSkill;

  @Column({ name: 'panel_skill_standard_level_id' })
  panelSkillStandardLevelId: number;

  @ManyToOne(() => PanelSkillStandardLevel)
  @JoinColumn({ name: 'panel_skill_standard_level_id' })
  panelSkillStandardLevel: PanelSkillStandardLevel;

  @Column({ type: 'decimal', precision: 10, scale: 3, name: 'billable_hours' })
  billableHours: number;

  @Column({ name: 'opportunity_id' })
  opportunityId: number;

  @ManyToOne(() => Opportunity)
  @JoinColumn({ name: 'opportunity_id' })
  opportunity: Opportunity;

  @Column({ name: 'milestone_id' })
  milestoneId: number;

  @ManyToOne(() => Milestone)
  @JoinColumn({ name: 'milestone_id' })
  milestone: Milestone;

  @OneToMany(
    () => OpportunityResourceAllocation,
    (opportunityResourceAllocation) =>
      opportunityResourceAllocation.opportunityResource,
    {
      cascade: true,
    }
  )
  opportunityResourceAllocations: OpportunityResourceAllocation[];
}
