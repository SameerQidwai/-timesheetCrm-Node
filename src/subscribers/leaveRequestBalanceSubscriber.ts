import { LeaveRequestBalance } from '../entities/leaveRequestBalance';
import {
  EntitySubscriberInterface,
  EventSubscriber,
  getManager,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';
import { LeaveRequestBalanceTransaction } from '../entities/leaveRequestBalanceTransaction';

@EventSubscriber()
export class PostSubscriber
  implements EntitySubscriberInterface<LeaveRequestBalance>
{
  /**
   * Indicates that this subscriber only listen to Post events.
   */
  listenTo() {
    return LeaveRequestBalance;
  }

  /**
   * Called before post insertion.
   */
  async afterInsert(event: InsertEvent<LeaveRequestBalance>) {
    const manager = getManager();
    await manager.save(
      manager.create(LeaveRequestBalanceTransaction, { newState: event.entity })
    );
  }

  async afterUpdate(event: UpdateEvent<LeaveRequestBalance>) {
    const manager = getManager();
    let transaction = manager.create(LeaveRequestBalanceTransaction, {
      previousState: event.databaseEntity,
      newState: event.entity,
      // delta: event.updatedColumns.map((column) => column.propertyName),
    });
    await manager.save(transaction);
  }
}
