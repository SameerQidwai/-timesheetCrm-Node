import { FinancialYear } from '../entities/financialYear';
import { IGNORE_TABLES } from '../constants/globals';
import { DBColumn } from '../entities/dbColumn';
import {
  BeforeRemove,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  LoadEvent,
  RemoveEvent,
  UpdateEvent,
  getManager,
} from 'typeorm';
import {
  DisableConditionType,
  DisableCondtionDataType,
  OpportunityStatus,
} from '../constants/constants';
import moment from 'moment-timezone';
import { TransactionCommitEvent } from 'typeorm/subscriber/event/TransactionCommitEvent';
import { LeaveRequestEntry } from 'src/entities/leaveRequestEntry';

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
    const opportunityStatuses = [
      OpportunityStatus.LOST,
      OpportunityStatus.NOT_BID,
      OpportunityStatus.OPPORTUNITY,
      OpportunityStatus.DID_NOT_PROCEED,
    ];

    for (let column of dbColumns) {
      let columnName = column.typeormName;
      for (let condition of column.disableConditions) {
        if (
          condition.conditionType === DisableConditionType.FINANCIAL_YEAR &&
          condition.columnDataType === DisableCondtionDataType.DATE &&
          lastClosedFinancialYear &&
          !opportunityStatuses.includes(newData?.status) &&
          newData?.title !== 'Default Milestone'
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
      cache: 3000,
    });

    const oldData = event.databaseEntity;
    const newData = event.entity;
    const opportunityStatuses = [
      OpportunityStatus.LOST,
      OpportunityStatus.NOT_BID,
      OpportunityStatus.OPPORTUNITY,
      OpportunityStatus.DID_NOT_PROCEED,
    ];

    // console.log(event.databaseEntity);
    // console.log(event.entity);

    // for (let column of dbColumns) {
    //   let columnId = column.id;
    //   let columnName = column.typeormName;
    //   for (let condition of column.disableConditions) {
    //     let conditionColumnId = condition.conditionColumnId;
    //     let conditionColumnName = condition.conditionColumn.typeormName;

    //     if (
    //       condition.conditionType === DisableConditionType.FINANCIAL_YEAR &&
    //       condition.columnDataType === DisableCondtionDataType.DATE &&
    //       newData &&
    //       lastClosedFinancialYear &&
    //       !opportunityStatuses.includes(newData?.status) &&
    //       newData?.title !== 'Default Milestone'
    //     ) {
    //       // console.log('YESSS');
    //       //IF SAME COLUMN
    //       if (conditionColumnId === columnId) {
    //         // console.log(event.metadata.name, newData, oldData);
    //         if (
    //           moment(oldData[columnName]).isSameOrBefore(
    //             lastClosedFinancialYear.endDate,
    //             'date'
    //           ) &&
    //           moment(newData[columnName]).isBefore(
    //             lastClosedFinancialYear.endDate,
    //             'date'
    //           ) &&
    //           !moment(oldData[columnName]).isSame(newData[columnName])
    //         ) {
    //           throw new Error('Cannot make changes in closed financial years');
    //         }
    //         // console.log({
    //         //   old: oldData[columnName],
    //         //   new: newData[columnName],
    //         //   comparision: oldData[columnName] == newData[columnName],
    //         // });
    //       } else if (columnId !== conditionColumnId) {
    //         if (
    //           moment(oldData[conditionColumnName]).isSameOrBefore(
    //             lastClosedFinancialYear.endDate,
    //             'date'
    //           ) &&
    //           moment(oldData[columnName]).isSameOrBefore(
    //             lastClosedFinancialYear.endDate,
    //             'date'
    //           )
    //         ) {
    //           throw new Error('Cannot make changes in closed financial years');
    //         }

    //         if (
    //           moment(oldData[conditionColumnName]).isSameOrBefore(
    //             lastClosedFinancialYear.endDate,
    //             'date'
    //           ) &&
    //           moment(newData[columnName]).isBefore(
    //             lastClosedFinancialYear.endDate,
    //             'date'
    //           ) &&
    //           !moment(oldData[columnName]).isSame(newData[columnName])
    //         ) {
    //           throw new Error('Cannot make changes in closed financial years');
    //         }
    //       }
    //     }
    //   }
    // }

    if (
      newData &&
      lastClosedFinancialYear &&
      !opportunityStatuses.includes(newData?.status) &&
      newData?.title !== 'Default Milestone'
    ) {
      for (let column of dbColumns) {
        // let columnId = column.id;
        let columnName = column.typeormName;
        for (let condition of column.disableConditions) {
          // let conditionColumnId = condition.conditionColumnId;
          let conditionColumnName = condition.conditionColumn.typeormName;

          let oldDataCheckValue: null | string = null;
          let newDataCheckValue: null | string = null;
          if (oldData[columnName] != null) {
            oldDataCheckValue = oldData[columnName].toString();
          }

          if (newData[columnName] != null) {
            newDataCheckValue = newData[columnName].toString();
          }

          if (oldDataCheckValue !== newDataCheckValue) {
            if (
              condition.conditionType === DisableConditionType.FINANCIAL_YEAR
            ) {
              // if (newData[conditionColumnName] === null) continue;

              let dateToValidate = moment(
                newData[conditionColumnName],
                'YYYY-MM-DD'
              );
              if (!dateToValidate.isValid()) {
                dateToValidate = moment(
                  newData[conditionColumnName],
                  'DD-MM-YYYY'
                );
              }

              if (
                conditionColumnName === columnName &&
                moment(newData[columnName]).isValid() &&
                moment(newData[columnName]).isBefore(
                  lastClosedFinancialYear.endDate,
                  'date'
                )
              ) {
                throw new Error('Cannot set date to previous financial year');
              } else if (
                moment(newData[conditionColumnName]).isSameOrBefore(
                  lastClosedFinancialYear.endDate,
                  'date'
                ) &&
                conditionColumnName != columnName
              ) {
                throw new Error(
                  'Cannot make changes in closed financial years'
                );
              }
            }
          }
        }
      }
    }
  }
}
