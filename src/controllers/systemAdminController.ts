import { Request, Response, NextFunction } from 'express';
import { getManager } from 'typeorm';

export class SystemAdminController {
  async test(req: Request, res: Response, next: NextFunction) {
    try {
      let manager = getManager();
      let connection = manager.connection;

      let columns: any = {};
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
        var value = /_view|_metadata|typeorm|db_|system_/.test(table);
        console.log(value);

        if (
          table.includes('_view') ||
          table.includes('_metadata') ||
          table.includes('typeorm')
        )
          continue;
        // let dbColumns = await manager.query(`DESCRIBE ${table}`);

        let dbColumns = connection.getMetadata(table).ownColumns;

        columns[table] = {};

        for (let column of dbColumns) {
          if (ignoreColumns.includes(column.databaseName)) continue;
          columns[table][column.databaseName] = {
            databaseName: column.databaseName,
            typeOrmName: column.propertyName,
          };
        }
      }

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
