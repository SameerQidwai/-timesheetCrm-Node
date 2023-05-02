import { Request, Response, NextFunction } from 'express';
import { DBColumn } from '../entities/dbColumn';
import { getManager } from 'typeorm';
import { IGNORE_COLUMNS, IGNORE_TABLES } from '../constants/globals';

export class SystemAdminController {
  async addColumns(req: Request, res: Response, next: NextFunction) {
    try {
      let manager = getManager();
      let connection = manager.connection;

      let columns: any = {};
      let pushColumns: DBColumn[] = [];

      const regex = new RegExp(IGNORE_TABLES.join('|'));

      let dbTableNames = await manager.query(`SHOW TABLES`);

      let tableNames: string[] = [];

      dbTableNames.forEach((table: any) => {
        tableNames.push(table[Object.keys(table)[0]]);
      });

      for (let table of tableNames) {
        if (regex.test(table)) continue;
        // let dbColumns = await manager.query(`DESCRIBE ${table}`);

        let dbColumns = connection.getMetadata(table).ownColumns;

        columns[table] = {};

        for (let column of dbColumns) {
          if (IGNORE_COLUMNS.includes(column.databaseName)) continue;
          columns[table][column.databaseName] = manager.create(DBColumn, {
            dbName: column.databaseName,
            typeormName: column.propertyName,
            entityName: column.entityMetadata.targetName,
            tableName: column.entityMetadata.tableName,
            batch: 0,
          });

          pushColumns.push(columns[table][column.databaseName]);
        }
      }

      // await manager.query(`TRUNCATE TABLE db_columns`);
      await manager.save(DBColumn, pushColumns);

      res.status(200).json({
        success: true,
        message: 'Hello',
        data: columns,
      });
    } catch (e) {
      next(e);
    }
  }
}
