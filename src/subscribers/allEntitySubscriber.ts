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
import {
  DisableConditionType,
  DisableCondtionDataType,
} from '../constants/constants';
import moment from 'moment';

@EventSubscriber()
export class EntitySubscriber implements EntitySubscriberInterface {
  async beforeInsert(event: InsertEvent<any>) {
    const regex = new RegExp(IGNORE_TABLES.join('|'));
    if (regex.test(event.metadata.tableName)) return;

    const manager = getManager();

    const dbColumns = await manager.find(DBColumn, {
      where: { entityName: event.metadata.targetName },
      relations: ['disableConditions', 'disableConditions.conditionColumn'],
    });

    const lastClosedFinancialYear = await manager.findOne(FinancialYear, {
      order: { endDate: 'DESC' },
      where: { closed: true },
    });

    const newData = event.entity;

    for (let column of dbColumns) {
      let columnName = column.typeormName;
      for (let condition of column.disableConditions) {
        if (
          condition.conditionType === DisableConditionType.FINANCIAL_YEAR &&
          condition.dataType === DisableCondtionDataType.DATE &&
          lastClosedFinancialYear
        ) {
          let columnDate = moment(newData[columnName], true).isValid()
            ? moment(newData[columnName])
            : moment(newData[columnName], 'DD-MM-YYYY');

          if (columnDate.isBefore(lastClosedFinancialYear.endDate, 'date')) {
            throw new Error('Cannot make changes in closed financial years');
          }
        }
      }
    }
  }

  async beforeUpdate(event: UpdateEvent<any>) {
    // console.log(event.metadata.targetName);

    const regex = new RegExp(IGNORE_TABLES.join('|'));
    if (regex.test(event.metadata.tableName)) return;

    // console.log(event.metadata.target);

    const manager = getManager();

    const dbColumns = await manager.find(DBColumn, {
      where: { entityName: event.metadata.targetName },
      relations: ['disableConditions', 'disableConditions.conditionColumn'],
    });

    const lastClosedFinancialYear = await manager.findOne(FinancialYear, {
      order: { endDate: 'DESC' },
      where: { closed: true },
    });

    const oldData = event.databaseEntity;
    const newData = event.entity;

    // console.log(event.databaseEntity);
    // console.log(event.entity);

    for (let column of dbColumns) {
      let columnId = column.id;
      let columnName = column.typeormName;
      for (let condition of column.disableConditions) {
        let conditionColumnId = condition.conditionColumnId;
        let conditionColumnName = condition.conditionColumn.typeormName;

        if (
          condition.conditionType === DisableConditionType.FINANCIAL_YEAR &&
          condition.dataType === DisableCondtionDataType.DATE &&
          lastClosedFinancialYear
        ) {
          //IF SAME COLUMN
          if (conditionColumnId === columnId) {
            console.log({
              old: oldData[columnName],
              new: newData[columnName],
              comparision: oldData[columnName] == newData[columnName],
            });
            if (
              moment(oldData[columnName]).isSameOrBefore(
                lastClosedFinancialYear.endDate,
                'date'
              ) &&
              !moment(oldData[columnName]).isSame(newData[columnName])
            ) {
              throw new Error('Cannot make changes in closed financial years');
            }
          } else if (columnId !== conditionColumnId) {
            if (
              moment(oldData[conditionColumnName]).isSameOrBefore(
                lastClosedFinancialYear.endDate,
                'date'
              ) &&
              moment(newData[columnName]).isBefore(
                lastClosedFinancialYear.endDate,
                'date'
              )
            ) {
              throw new Error('Cannot make changes in closed financial years');
            }
          }
        }
      }
    }
  }
}
