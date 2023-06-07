import { createConnection, getManager } from 'typeorm';
import { DBColumn } from './entities/dbColumn';
import { IGNORE_COLUMNS, IGNORE_TABLES } from './constants/globals';
import { DBColumnDisableCondition } from './entities/dbColumnDisableCondition';
import {
  DisableConditionType,
  DisableCondtionDataType,
} from './constants/constants';

const connection = createConnection();

connection
  .then(async () => {
    let conditionObject = (
      columnId: number,
      columnDataType: DisableCondtionDataType,
      conditionColumnId: number,
      conditionColumnDataType: DisableCondtionDataType,
      conditionType: DisableConditionType
    ) => {
      let conditionObj = manager.create(DBColumnDisableCondition, {
        columnId,
        columnDataType,
        conditionColumnId,
        conditionColumnDataType,
        conditionType,
      });

      return conditionObj;
    };
    let manager = getManager();

    let CONDITION_CRITERIA: { [key: string]: any } = {
      attachments: {},
      bank_accounts: {},
      budget_report_label_values: {},
      budget_report_labels: {},
      calendar_days: {},
      calendar_holidays: { date: 'date', '...rest': 'date' },
      calendars: {},
      cashflow_report_label_values: {},
      cashflow_report_labels: {},
      comments: {},
      contact_person_organizations: {},
      contact_person_standard_skill_standard_level: {},
      contact_persons: {},
      data_exports: {},
      data_imports: {},
      employees: {},
      employment_contracts: {
        start_date: 'start_date',
        end_date: 'end_date',
        '...rest': 'start_date',
      },
      expense_sheet_expenses: {
        submitted_at: 'submitted_at',
        '...rest': 'submitted_at',
      },
      expense_sheets: {},
      expense_types: {},
      expenses: {},
      files: {},
      forecast_report_label_values: {},
      forecast_report_labels: {},
      global_settings: {},
      global_variable_labels: {},
      global_variable_values: {},
      holiday_types: {},
      leases: {},
      leave_request_balance: {},
      leave_request_entries: {
        date: 'date',
        '...rest': 'date',
      },
      leave_request_policies: {},
      leave_request_policy_leave_request_types: {},
      leave_request_types: {},
      leave_requests: {},
      milestone_expenses: {},
      milestones: {
        start_date: 'start_date',
        end_date: 'end_date',
        '...rest': 'end_date',
      },
      opportunities: {
        start_date: 'start_date',
        end_date: 'end_date',
        '...rest': 'end_date',
      },
      opportunity_resource_allocations: {},
      opportunity_resources: {
        start_date: 'start_date',
        end_date: 'end_date',
        '...rest': 'end_date',
      },
      organizations: {},
      panel_skill_standard_levels: {},
      panel_skills: {},
      panels: {},
      password_resets: {},
      permissions: {},
      project_schedule_segments: {},
      project_schedules: {},
      project_shutdown_periods: {},
      purchase_orders: {},
      roles: {},
      samples: {},
      standard_levels: {},
      standard_skill_standard_levels: {},
      standard_skills: {},
      states: {},
      timesheet_entries: {
        date: 'date',
        '...rest': 'date',
      },
      timesheet_project_entries: {},
      timesheets: {
        start_date: 'start_date',
        end_date: 'end_date',
        '...rest': 'end_date',
      },
    };

    let conditions: Array<DBColumnDisableCondition> = [];

    for (let table of Object.keys(CONDITION_CRITERIA)) {
      let tableConditions = Object.keys(CONDITION_CRITERIA[table]);
      let conditionedColumns: Array<string> = [];
      if (!tableConditions.length) continue;

      let allColumns = await manager.find(DBColumn, {
        where: { tableName: table },
      });

      let ALL_COLUMNS: { [key: string]: DBColumn } = {};

      for (let columnData of allColumns) {
        ALL_COLUMNS[columnData.dbName] = columnData;
      }

      for (let column of tableConditions) {
        let conditionColumn = CONDITION_CRITERIA[table][column];
        console.log(table, column, conditionColumn);
        if (column === '...rest') {
          for (let dbColumn of Object.keys(ALL_COLUMNS)) {
            if (conditionedColumns.includes(dbColumn)) continue;
            let conditionObj = conditionObject(
              ALL_COLUMNS[dbColumn].id,
              DisableCondtionDataType.ANY,
              ALL_COLUMNS[conditionColumn].id,
              DisableCondtionDataType.DATE,
              DisableConditionType.FINANCIAL_YEAR
            );
            conditions.push(conditionObj);
          }
        } else {
          // let conditionObj = new DBColumnDisableCondition();
          // conditionObj.columnId = ALL_COLUMNS[column].id;
          // conditionObj.columnDataType = DisableCondtionDataType.ANY;
          // conditionObj.conditionColumnId = ALL_COLUMNS[conditionColumn].id;
          // conditionObj.conditionColumnDataType = DisableCondtionDataType.DATE;
          // conditionObj.conditionType = DisableConditionType.FINANCIAL_YEAR;
          let conditionObj = conditionObject(
            ALL_COLUMNS[column].id,
            DisableCondtionDataType.DATE,
            ALL_COLUMNS[conditionColumn].id,
            DisableCondtionDataType.DATE,
            DisableConditionType.FINANCIAL_YEAR
          );
          conditions.push(conditionObj);
          conditionedColumns.push(column);
        }
      }
    }

    await manager.save(conditions);

    process.exit();

    // console.log(en);
  })
  .catch((error) => {
    console.error('error in DB connection: ', error);
  });
