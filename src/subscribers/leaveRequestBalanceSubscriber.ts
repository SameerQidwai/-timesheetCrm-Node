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

    const oldData = event.databaseEntity;
    const newData = event.entity;
    const deltaColumns = [];

    for (const key in event.entity) {
      const newDataKey = parseInt((newData as any)[key]);
      const oldDataKey = parseInt((oldData as any)[key]);

      console.log('NEW AND OLD DATA', oldDataKey, newDataKey);

      if (!isNaN(newDataKey))
        if (newDataKey > oldDataKey) {
          deltaColumns.push(`Added ${newDataKey - oldDataKey} hours in ${key}`);
        } else if (oldDataKey > newDataKey) {
          deltaColumns.push(
            `Subtracted ${newDataKey - oldDataKey} hours from ${key}`
          );
        }
    }

    let transaction = manager.create(LeaveRequestBalanceTransaction, {
      previousState: event.databaseEntity,
      newState: event.entity,
      employeeId: event.databaseEntity.employeeId,
      delta: deltaColumns,
      // delta: event.updatedColumns.map((column) => column.propertyName),
    });
    await manager.save(transaction);
  }
}
