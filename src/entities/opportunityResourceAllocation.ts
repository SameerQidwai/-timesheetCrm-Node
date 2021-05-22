import { Gender, ProjectType } from '../constants/constants';
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
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
import { ContactPerson } from './contactPerson';
import { OpportunityResource } from './opportunityResource';

@Entity('opportunity_resource_allocations')
export class OpportunityResourceAllocation extends Base {
  @Column({ name: 'opportunity_resource_id' })
  opportunityResourceId: number;

  @ManyToOne(() => OpportunityResource)
  @JoinColumn({ name: 'opportunity_resource_id' })
  opportunityResource: OpportunityResource;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 3,
    name: 'selling_rate',
    nullable: true,
  })
  sellingRate: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 3,
    name: 'buying_rate',
    nullable: true,
  })
  buyingRate: number;

  @Column({ name: 'is_marked_as_selected', default: false })
  isMarkedAsSelected: boolean;

  @Column({ name: 'contact_person_id', nullable: true })
  contactPersonId: number | null;

  @ManyToOne(() => ContactPerson)
  @JoinColumn({ name: 'contact_person_id' })
  contactPerson: ContactPerson;

  @Column({ name: 'start_date', nullable: true })
  startDate: Date;

  @Column({ name: 'end_date', nullable: true })
  endDate: Date;

  @Column({ name: 'effort_rate', default: 100 })
  effortRate: number;
}
