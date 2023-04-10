import { Request, Response, NextFunction } from 'express';
import { DBColumn } from '../entities/dbColumn';
import { getManager } from 'typeorm';

export class SystemAdminController {
  async test(req: Request, res: Response, next: NextFunction) {
    try {
      let manager = getManager();
      let connection = manager.connection;

      let columns: any = {};
      let pushColumns: DBColumn[] = [];

      const ignoreColumns: Array<string> = [
        'id',
        'created_at',
        'updated_at',
        'deleted_at',
      ];

      const systemTables: Array<string> = ['_view', '_metadata', 'typeorm'];

      let dbTableNames = await manager.query(`SHOW TABLES`);

      let tableNames: string[] = [];

      dbTableNames.forEach((table: any) => {
        tableNames.push(table.Tables_in_onelm);
      });

      for (let table of tableNames) {
        var checkFlag = /_view|_metadata|typeorm|db_|system_/.test(table);
        console.log(checkFlag);

        if (checkFlag) continue;
        // if (
        //   table.includes('_view') ||
        //   table.includes('_metadata') ||
        //   table.includes('typeorm')
        // )
        //   continue;
        // let dbColumns = await manager.query(`DESCRIBE ${table}`);

        let dbColumns = connection.getMetadata(table).ownColumns;

        columns[table] = {};

        for (let column of dbColumns) {
          if (ignoreColumns.includes(column.databaseName)) continue;
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
