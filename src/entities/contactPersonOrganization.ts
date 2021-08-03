import { Entity, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { Base } from './common/base';
import { ContactPerson } from './contactPerson';
import { Employee } from './employee';
import { Organization } from './organization';

@Entity('contact_person_organizations')
export class ContactPersonOrganization extends Base {
  @Column({ name: 'start_date' })
  startDate: Date;

  @Column({ name: 'end_date', nullable: true })
  endDate: Date;

  @Column({ name: 'designation' })
  designation: string;

  @Column({ name: 'organization_id', nullable: true })
  organizationId: number;

  @Column({ name: 'contact_person_id', nullable: true })
  contactPersonId: number;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @ManyToOne(
    () => ContactPerson,
    (contactPerson) => contactPerson.contactPersonOrganizations
  )
  @JoinColumn({ name: 'contact_person_id' })
  contactPerson: ContactPerson;

  @OneToOne(() => Employee, (employee) => employee.contactPersonOrganization)
  employee: Employee;

  @Column({ name: 'status', default: false })
  status: boolean;
}
