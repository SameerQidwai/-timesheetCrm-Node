import { Request, Response, NextFunction } from 'express';
import { getCustomRepository, getManager } from 'typeorm';
import { FinancialYear } from '../entities/financialYear';
import { FinancialYearRepository } from '../repositories/financialYearRepository';

export class FinancialYearController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(FinancialYearRepository);

      let years = await repository.getAllActive();

      res.status(200).json({
        success: true,
        message: 'All years',
        data: years,
      });
    } catch (e) {
      next(e);
    }
  }

  async createAndSave(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(FinancialYearRepository);
      const { user } = res.locals;

      let year = await repository.createAndSave(req.body, user.id);

      res.status(200).json({
        success: true,
        message: 'Year Created',
        data: year,
      });
    } catch (e) {
      next(e);
    }
  }

  async findOne(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(FinancialYearRepository);
      const { user } = res.locals;
      let id = parseInt(req.params.id);

      let year = await repository.findOneCustom(id);

      res.status(200).json({
        success: true,
        message: 'Year Created',
        data: year,
      });
    } catch (e) {
      next(e);
    }
  }

  async updateOne(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(FinancialYearRepository);
      const { user } = res.locals;
      let id = parseInt(req.params.id);

      let year = await repository.updateOne(req.body, user.id, id);

      res.status(200).json({
        success: true,
        message: 'Year Created',
        data: year,
      });
    } catch (e) {
      next(e);
    }
  }

  async deleteCustom(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(FinancialYearRepository);
      const { user } = res.locals;
      let id = parseInt(req.params.id);

      let year = await repository.deleteCustom(user.id, id);

      res.status(200).json({
        success: true,
        message: 'Year Created',
        data: year,
      });
    } catch (e) {
      next(e);
    }
  }

  async closeYear(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(FinancialYearRepository);
      let id = req.params.id;
      let queryConfirm = req.query.confirm;
      let confirm = queryConfirm === 'true' ? true : false;

      const { user } = res.locals;

      const response = await repository.closeYear(
        parseInt(id),
        user.id,
        confirm
      );

      res.status(200).json({
        success: true,
        message: 'All years',
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }

  async replicateDatabase(req: Request, res: Response, next: NextFunction) {
    try {
      const manager = getManager();
      let dbTableNames = await manager.query(`SHOW FULL TABLES`);

      let tableNames: string[] = [];

      let id = 1;

      dbTableNames.forEach((table: any) => {
        tableNames.push(table[Object.keys(table)[0]]);
      });
      let createTableQuery = ``;
      // let createViewQuery = ``;
      let insertQuery = ``;
      for (let tableName of tableNames) {
        if (tableName.includes('backup')) continue;

        if (tableName.includes('view')) {
          // createViewQuery += `CREATE VIEW \`z_backup_${id}_${tableName}\` AS SELECT * FROM \`${tableName}\`; `;
        } else {
          createTableQuery += `CREATE TABLE \`z_backup_${id}_${tableName}\` LIKE \`${tableName}\`; `;
          insertQuery += `INSERT INTO \`z_backup_${id}_${tableName}\` SELECT * FROM \`${tableName}\`; `;
        }
      }

      // console.log(createTableQuery);
      // console.log(createViewQuery);
      // console.log(insertQuery);

      await manager.query(createTableQuery);
      // await manager.query(createViewQuery);
      await manager.query(insertQuery);

      res.status(200).json({
        success: true,
        message: 'Hello',
        data: tableNames,
      });
    } catch (e) {
      next(e);
    }
  }

  async revertYear(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(FinancialYearRepository);
      let id = req.params.id;

      const response = await repository.revertYear(parseInt(id));

      res.status(200).json({
        success: true,
        message: 'Reverting year',
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }

  async rollbackDatabase(req: Request, res: Response, next: NextFunction) {
    try {
      const manager = getManager();

      let dbTableNames = await manager.query(`SHOW FULL TABLES`);
      let dependencyRows = await manager.query(
        "SELECT views.TABLE_NAME As `View`, tab.TABLE_NAME AS `Input` FROM information_schema.`TABLES` AS tab INNER JOIN information_schema.VIEWS AS views ON views.VIEW_DEFINITION LIKE CONCAT('%`',tab.TABLE_NAME,'`%') WHERE tab.TABLE_NAME LIKE '%_view';"
      );
      let createViewQuery = ``;
      let pushedViews: Array<string> = [];
      let tableNames: string[] = [];

      const id = 1;
      const prefix = `z_backup_${id}_`;

      dbTableNames.forEach((table: any) => {
        tableNames.push(table[Object.keys(table)[0]]);
      });

      for (let dependency of dependencyRows) {
        if (!pushedViews.includes(dependency.Input)) {
          let definition = await manager.query(
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
              let definition = await manager.query(
                `SHOW CREATE VIEW ${tableName}`
              );
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
      deleteViewQuery = deleteViewQuery.substring(
        0,
        deleteViewQuery.length - 1
      );

      // console.log(deleteTableQuery);
      // console.log(deleteViewQuery);
      // console.log(renameQuery);

      await manager.query('SET FOREIGN_KEY_CHECKS=0;');

      await manager.query(deleteTableQuery);
      await manager.query(deleteViewQuery);
      await manager.query(renameQuery);
      await manager.query(createViewQuery);

      await manager.query('SET FOREIGN_KEY_CHECKS=1;');

      res.status(200).json({
        success: true,
        message: 'Hello',
        data: tableNames,
      });
    } catch (e) {
      next(e);
    }
  }
}
