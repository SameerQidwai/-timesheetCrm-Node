import { createConnection } from 'typeorm';
import { getManager } from 'typeorm';
import { FinancialYear } from './entities/financialYear';

import moment from 'moment-timezone';
import { GlobalSetting } from './entities/globalSetting';

const connection = createConnection();

let execution = async () => {
  moment.tz.setDefault('Etc/UTC');
  const manager = getManager();

  await manager.transaction(async (trx) => {
    let year = await manager.findOne(FinancialYear, {
      where: { closing: true },
    });

    if (!year) {
      throw new Error('Nothing is closing');
    }

    var systemLock = await trx.findOne(GlobalSetting, {
      where: { keyLabel: 'systemLock' },
    });

    if (!systemLock) {
      throw new Error('Something went wrong');
    }

    systemLock.keyValue = '1';

    await trx.save(systemLock);

    let dbTableNames = await trx.query(`SHOW FULL TABLES`);
    let dependencyRows = await trx.query(
      "SELECT views.TABLE_NAME As `View`, tab.TABLE_NAME AS `Input` FROM information_schema.`TABLES` AS tab INNER JOIN information_schema.VIEWS AS views ON views.VIEW_DEFINITION LIKE CONCAT('%`',tab.TABLE_NAME,'`%') WHERE tab.TABLE_NAME LIKE '%_view';"
    );
    let createViewQuery = ``;
    let pushedViews: Array<string> = [];
    let tableNames: string[] = [];

    const prefix = `z_backup_${year.id}_`;

    dbTableNames.forEach((table: any) => {
      tableNames.push(table[Object.keys(table)[0]]);
    });

    for (let dependency of dependencyRows) {
      if (!pushedViews.includes(dependency.Input)) {
        let definition = await trx.query(
          `SHOW CREATE VIEW ${dependency.Input}`
        );
        createViewQuery += `${definition[0]['Create View']}; `;
        pushedViews.push(dependency.Input);
      }
    }

    let renameQuery = ``;
    let deleteTableQuery = `DROP TABLE IF EXISTS `;
    let deleteViewQuery = `DROP VIEW IF EXISTS `;

    for (let tableName of tableNames) {
      if (!tableName.includes('z_backup')) {
        if (tableName.includes('view')) {
          if (!pushedViews.includes(tableName)) {
            let definition = await trx.query(`SHOW CREATE VIEW ${tableName}`);
            createViewQuery += `${definition[0]['Create View']}; `;
          }
          deleteViewQuery += ` \`${tableName}\`,`;
        } else deleteTableQuery += ` \`${tableName}\`,`;
      } else if (tableName.includes(prefix))
        renameQuery += `RENAME TABLE \`${tableName}\` TO \`${tableName.replace(
          prefix,
          ''
        )}\`; `;
    }

    deleteTableQuery = deleteTableQuery.substring(
      0,
      deleteTableQuery.length - 1
    );
    deleteViewQuery = deleteViewQuery.substring(0, deleteViewQuery.length - 1);

    await trx.query('SET FOREIGN_KEY_CHECKS=0;');

    await trx.query(deleteTableQuery);
    await trx.query(deleteViewQuery);
    await trx.query(renameQuery);
    await trx.query(createViewQuery);

    await trx.query('SET FOREIGN_KEY_CHECKS=1;');

    year.closed = false;
    (year.closedBy as any) = null;
    (year.closedAt as any) = null;
    year.closing = false;

    if (!systemLock) {
      throw new Error('Something went wrong');
    }

    systemLock.keyValue = '0';

    await trx.save(systemLock);

    return trx.save(year);
  });

  return true;
};

connection
  .then(async () => {
    await execution();

    console.log('EXITING');
    process.exit();
  })
  .catch(async (error) => {
    const manager = getManager();
    console.error('error in DB connection: ', error);
    await manager.transaction(async (trx) => {
      let year = await manager.findOne(FinancialYear, {
        where: { closing: true },
      });

      if (year) {
        year.closing = false;
        (year.closedBy as any) = null;

        await trx.save(year);

        var systemLock = await manager.findOne(GlobalSetting, {
          where: { keyLabel: 'systemLock' },
        });

        if (!systemLock) {
          throw new Error('Something went wrong');
        }

        systemLock.keyValue = '0';

        await trx.save(systemLock);

        console.log('Rolled back');
      }
    });
  });
