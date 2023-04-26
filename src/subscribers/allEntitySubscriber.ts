import { FinancialYear } from '../entities/financialYear';
import { IGNORE_TABLES } from '../constants/globals';
import { DBColumn } from '../entities/dbColumn';
import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  LoadEvent,
  UpdateEvent,
  getManager,
} from 'typeorm';
import { DisableConditionTye } from '../constants/constants';
import moment from 'moment';

@EventSubscriber()
export class EntitySubscriber implements EntitySubscriberInterface {
  async beforeUpdate(event: UpdateEvent<any>) {
    // console.log(event.metadata.targetName);

    const regex = new RegExp(IGNORE_TABLES.join('|'));
    if (regex.test(event.metadata.tableName)) return;

    // console.log(event.metadata.target);

    const manager = getManager();

    const dbColumns = await manager.find(DBColumn, {
      where: { entityName: event.metadata.targetName },
      relations: ['disableConditions'],
    });

    const lastClosedFinancialYear = await manager.findOne(FinancialYear, {
      order: { endDate: 'DESC' },
      where: { closed: true },
    });

    console.log(lastClosedFinancialYear);

    const entity = event.entity;

    for (let column of dbColumns) {
      for (let condition of column.disableConditions) {
        if (
          condition.conditionType === DisableConditionTye.FINANCIAL_YEAR &&
          lastClosedFinancialYear
        ) {
          if (
            moment(entity[column.typeormName]).isBefore(
              lastClosedFinancialYear.endDate,
              'date'
            )
          ) {
            throw new Error('NEW HAA');
          }
        }
      }
    }

    throw new Error('Haaaaaa');
  }
}
