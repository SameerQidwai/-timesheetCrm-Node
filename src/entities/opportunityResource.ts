import { Gender, ProjectType } from '../constants/constants';
import { Entity, Column, ManyToOne, JoinColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { Base } from './common/base';
import { StandardSkillStandardLevel } from './standardSkillStandardLevel';
import { State } from './state';
import { ContactPersonOrganization } from './contactPersonOrganization';
import { Organization } from './organization';
import { Panel } from './panel';
import { PanelSkill } from './panelSkill';
import { PanelSkillStandardLevel } from './panelSkillStandardLevel';
import { Opportunity } from './opportunity';
import { Employee } from './employee';

@Entity("opportunity_resources")
export class OpportunityResource extends Base {

   @Column({ name: "panel_skill_id" })
   panelSkillId: number;

   @ManyToOne(() => PanelSkill)
   @JoinColumn({ name: "panel_skill_id" })
   panelSkill: PanelSkill;

   @Column({ name: "panel_skill_standard_level_id" })
   panelSkillStandardLevelId: number;

   @ManyToOne(() => PanelSkillStandardLevel)
   @JoinColumn({ name: "panel_skill_standard_level_id" })
   panelSkillStandardLevel: PanelSkillStandardLevel;

   @Column({ type: 'decimal', precision: 10, scale: 3, name: "billable_hours" })
   billableHours: number;

   @Column({ name: "opportunity_id" })
   opportunityId: number;

   @ManyToOne(() => Opportunity)
   @JoinColumn({ name: "opportunity_id" })
   opportunity: Opportunity;

   @Column({ type: 'decimal', precision: 10, scale: 3, name: "selling_rate", nullable: true })
   sellingRate: number;

   @Column({ type: 'decimal', precision: 10, scale: 3, name: "buying_rate", nullable: true })
   buyingRate: number;

   @Column({ name: "user_id", nullable: true})
   userId: number | null;
   
   @ManyToOne(() => Employee)
   @JoinColumn({ name: "user_id" })
   user: Employee;

}