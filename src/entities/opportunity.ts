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
import { ContactPerson } from './contactPerson';
import { Organization } from './organization';
import { Panel } from './panel';
import { OpportunityResource } from './opportunityResource';
import { PurchaseOrder } from './purchaseOrder';
import { Employee } from './employee';
import { Milestone } from './milestone';
import { LeaveRequest } from './leaveRequest';
import { Invoice } from './invoice';

@Entity('opportunities')
export class Opportunity extends Base {
  @Column({ name: 'title' })
  title: String;

  @Column({ name: 'value', type: 'float', precision: 11, scale: 2 })
  value: number;

  @Column({
    type: 'enum',
    enum: ProjectType,
    name: 'type',
  })
  type: ProjectType;

  @Column({ name: 'start_date', nullable: true, precision: 3 })
  startDate: Date;

  @Column({ name: 'end_date', nullable: true, precision: 3 })
  endDate: Date;

  @Column({ name: 'bid_date', type: 'date', nullable: true })
  bidDate: Date;

  @Column({ name: 'entry_date', type: 'date', nullable: true })
  entryDate: Date;

  @Column({ name: 'qualified_ops', nullable: true })
  qualifiedOps: boolean;

  @Column()
  tender: string;

  @Column({ name: 'tender_number', nullable: true })
  tenderNumber: String;

  @Column({
    name: 'cm_percentage',
    nullable: true,
    type: 'float',
    precision: 11,
    scale: 2,
  })
  cmPercentage: number;

  @Column({
    name: 'go_percentage',
    nullable: true,
    type: 'float',
    precision: 11,
    scale: 2,
  })
  goPercentage: number;

  @Column({
    name: 'get_percentage',
    nullable: true,
    type: 'float',
    precision: 11,
    scale: 2,
  })
  getPercentage: number;

  @Column({
    name: 'hours_per_day',
    nullable: true,
    type: 'float',
    precision: 11,
    scale: 2,
  })
  hoursPerDay: number;

  @Column({ name: 'linked_work_id', nullable: true })
  linkedWorkId: number | null;

  @ManyToOne(() => Opportunity)
  @JoinColumn({ name: 'linked_work_id' })
  linkedWork: Opportunity;

  @Column({ name: 'organization_id', nullable: true })
  organizationId: number;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ name: 'panel_id', nullable: true })
  panelId: number;

  @ManyToOne(() => Panel)
  @JoinColumn({ name: 'panel_id' })
  panel: Panel;

  @Column({ name: 'contact_person_id', nullable: true })
  contactPersonId: number | null;

  @ManyToOne(() => ContactPerson)
  @JoinColumn({ name: 'contact_person_id' })
  contactPerson: ContactPerson;

  @Column({ name: 'state_id', nullable: true })
  stateId: number;

  @Column({ name: 'account_director_id', nullable: true })
  accountDirectorId: number | null;

  @Column({ name: 'account_manager_id', nullable: true })
  accountManagerId: number | null;

  @Column({ name: 'opportunity_manager_id', nullable: true })
  opportunityManagerId: number | null;

  @Column({ name: 'project_manager_id', nullable: true })
  projectManagerId: number | null;

  @Column({ name: 'won_date', nullable: true, precision: 3 })
  wonDate: Date;

  @Column({ name: 'lost_date', nullable: true, precision: 3 })
  lostDate: Date;

  @Column({ name: 'completed_date', nullable: true, precision: 3 })
  completedDate: Date;

  @Column({ name: 'winning_price', nullable: true })
  winningPrice: number;

  @Column({ name: 'won_by_id', nullable: true })
  wonById: number;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'won_by_id' })
  wonBy: Organization;

  @Column({ name: 'status', default: 'O' })
  status: string;
  //{L = Lost: //NB = Not Bid //DNP = Did Not Proceed} //O = Opportunity //P = Project //C = Completed

  @Column({ name: 'stage', nullable: true })
  stage: string;
  //L = Lead // TR = Tender Released //BS = Bid Submitted

  @Column({ name: 'phase', nullable: false, default: 1 })
  phase: boolean;
  // Project (1) Open /  (0) Closed

  @Column({ name: 'reason', nullable: true })
  reason: string;

  @Column({ name: 'feedback', nullable: true })
  feedback: string;

  @ManyToOne(() => State)
  @JoinColumn({ name: 'state_id' })
  state: State;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'account_director_id' })
  accountDirector: Employee;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'account_manager_id' })
  accountManager: Employee;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'opportunity_manager_id' })
  opportunityManager: Employee;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'project_manager_id' })
  projectManager: Employee;

  @OneToMany(
    () => OpportunityResource,
    (opportunityResource) => opportunityResource.opportunity,
    {
      cascade: true,
    }
  )
  opportunityResources: OpportunityResource[];

  @OneToMany(() => PurchaseOrder, (purchaseOrder) => purchaseOrder.project, {
    cascade: true,
  })
  purchaseOrders: PurchaseOrder[];

  @OneToMany(() => Milestone, (milestone) => milestone.project, {
    cascade: true,
  })
  milestones: Milestone[];

  @OneToMany(() => LeaveRequest, (leaveRequest) => leaveRequest.work, {
    cascade: true,
  })
  leaveRequests: LeaveRequest[];

  @OneToMany(() => Invoice, (invoice) => invoice.project, {
    cascade: true,
  })
  invoices: Invoice[];
}
