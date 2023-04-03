import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Base } from './common/base';
import { Organization } from './organization';
import { Employee } from './employee';

@Entity('bank_accounts')
export class BankAccount extends Base {
  @Column({ name: 'name' })
  name: String;

  @Column({ name: 'account_no' })
  accountNo: String;

  @Column({ name: 'bsb' })
  bsb: string;

  @Column({ name: 'file_id', nullable: true })
  fileId: number;

  @Column({ name: 'organization_id', nullable: true })
  organizationId: number;

  @Column({ name: 'employee_id', nullable: true })
  employeeId: number;

  @ManyToOne(() => Organization, (organization) => organization.bankAccounts)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @ManyToOne(() => Employee, (employee) => employee.bankAccounts)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;
}
