import { Entity, Column, JoinColumn, ManyToMany } from 'typeorm';
import { Base } from './common/base';
import { Organization } from './organization';
import { Opportunity } from './opportunity';

@Entity('invoice')
export class Invoice extends Base {
  @Column({ name: 'invoiceId' })
  invoiceId: string;

  @Column({ name: 'invoice_ref', default: '' })
  invoice_ref: Text;


  @Column({ name: 'project_id' })
  projectId: number;

  @ManyToMany(() => Opportunity)
  @JoinColumn({ name: 'project_id' })
  project: Opportunity;

  @Column({ name: 'organization_id' })
  organizationId: number;

  @ManyToMany(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;
}

