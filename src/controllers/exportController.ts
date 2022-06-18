import { Request, Response, NextFunction } from 'express';
import { Organization } from '../entities/organization';
import { getManager } from 'typeorm';
import xlsx from 'xlsx';
import fs from 'fs';

export class ExportController {
  async export(req: Request, res: Response, next: NextFunction) {
    let type = req.params.type;
    let ENTITY;
    try {
      switch (type) {
        case 'ORG':
          ENTITY = Organization;
        default:
          ENTITY = Organization;
      }
      let manager = getManager();
      let organizations = await manager.find(ENTITY);

      console.log(req.file);

      // Reading our test file
      // fs.writeFileSync('test.xlsx', '');

      // const file = reader.readFile('./test.xlsx');

      var workbook = xlsx.utils.book_new();

      const ws = xlsx.utils.json_to_sheet(organizations);

      xlsx.utils.book_append_sheet(workbook, ws, 'Sheet1');

      // Writing to our file
      xlsx.writeFile(workbook, './test.xlsx');

      return res.status(200).json({
        success: true,
        message: 'Here here',
        data: organizations,
      });
    } catch (e) {
      next(e);
    }
  }
}
