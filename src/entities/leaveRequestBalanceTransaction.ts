import { BeforeUpdate, Column, Entity } from 'typeorm';
import { ColumnMetadata } from 'typeorm/metadata/ColumnMetadata';
import { Base } from './common/base';
import { LeaveRequestBalance } from './leaveRequestBalance';

@Entity('')
export class LeaveRequestBalanceTransaction extends Base {
  @Column({ nullable: true, type: 'simple-json' })
  previousState: LeaveRequestBalance;

  @Column({ type: 'simple-json' })
  newState: LeaveRequestBalance;

  @Column({ type: 'simple-json' })
  delta: Partial<LeaveRequestBalance>;

  @BeforeUpdate()
  async saveDelta() {
    console.log(
      '🚀 ~ file: leaveRequestBalanceTransaction.ts:19 ~ LeaveRequestBalanceTransaction ~ saveDelta ~ saveDelta:'
    );
    this.delta = {
      carryForward: 999,
    };
  }
}
