import { Request, Response, NextFunction } from 'express';
import xlsx from 'xlsx';
import fs, { stat } from 'fs';
import path from 'path';
import { Organization } from '../entities/organization';
import { getManager, In } from 'typeorm';
import {
  Entities,
  ExportFileName,
  ImportLogName,
} from '../constants/constants';
import { ContactPerson } from '../entities/contactPerson';
import { Opportunity } from '../entities/opportunity';
import { Employee } from '../entities/employee';
import { DataExport } from '../entities/dataExport';
import { DataImport } from '../entities/dataImport';

export class ExportController {
  async status(req: Request, res: Response, next: NextFunction) {
    try {
      let manager = getManager();
      let statuses: any = [];

      let entities = [
        Entities.ORGANIZATION,
        Entities.CONTACT_PERSON,
        Entities.OPPORTUNITY,
        Entities.PROJECT,
        Entities.EMPLOYEE,
        Entities.SUB_CONTRACTOR,
      ];

      let fetchedExportStatuses = await manager.find(DataExport);
      let exportStatuses: any = [];
      let fetchedImportStatuses = await manager.find(DataImport);
      let importStatuses: any = [];

      fetchedExportStatuses.forEach((status) => {
        exportStatuses[status.type] = status;
      });
      fetchedImportStatuses.forEach((status) => {
        importStatuses[status.type] = status;
      });

      entities.forEach((entity) => {
        let logUrl = '';
        let fileUrl = '';
        let status: any = {};

        switch (entity) {
          case Entities.ORGANIZATION:
            logUrl = `${req.headers.host}/api/v1/data/download/${ImportLogName.ORGANIZATION}`;
            fileUrl = `${req.headers.host}/api/v1/data/download/${ExportFileName.ORGANIZATION}`;
            break;
          case Entities.CONTACT_PERSON:
            logUrl = `${req.headers.host}/api/v1/data/download/${ImportLogName.CONTACT_PERSON}`;
            fileUrl = `${req.headers.host}/api/v1/data/download/${ExportFileName.CONTACT_PERSON}`;
            break;
          case Entities.PROJECT:
            logUrl = `${req.headers.host}/api/v1/data/download/${ImportLogName.PROJECT}`;
            fileUrl = `${req.headers.host}/api/v1/data/download/${ExportFileName.PROJECT}`;
            break;
          case Entities.OPPORTUNITY:
            logUrl = `${req.headers.host}/api/v1/data/download/${ImportLogName.OPPORTUNITY}`;
            fileUrl = `${req.headers.host}/api/v1/data/download/${ExportFileName.OPPORTUNITY}`;
            break;
          case Entities.EMPLOYEE:
            logUrl = `${req.headers.host}/api/v1/data/download/${ImportLogName.EMPLOYEE}`;
            fileUrl = `${req.headers.host}/api/v1/data/download/${ExportFileName.EMPLOYEE}`;
            break;
          case Entities.SUB_CONTRACTOR:
            logUrl = `${req.headers.host}/api/v1/data/download/${ImportLogName.SUB_CONTRACTOR}`;
            fileUrl = `${req.headers.host}/api/v1/data/download/${ExportFileName.SUB_CONTRACTOR}`;
            break;
          default:
            logUrl = `${req.headers.host}/api/v1/data/download/${ImportLogName.ORGANIZATION}`;
            fileUrl = `${req.headers.host}/api/v1/data/download/${ExportFileName.ORGANIZATION}`;
            break;
        }

        status.type = entity;
        status.imported = importStatuses[entity].uploaded;
        status.exported = exportStatuses[entity].downloaded;
        status.log = status.imported ? logUrl : null; //EXPORT FILE ROUTE;
        status.file = status.exported ? fileUrl : null; //EXPORT FILE ROUTE;
        status.importing = importStatuses[entity].active;
        status.exporting = exportStatuses[entity].active;
        status.importProgress = importStatuses[entity].progress;
        status.exportProgress = exportStatuses[entity].progress;
        status.lastImported = status.imported
          ? importStatuses[entity].updatedAt
          : 'Never';
        status.lastExported = status.exported
          ? exportStatuses[entity].updatedAt
          : 'Never';

        statuses.push(status);
      });

      return res.status(200).json({
        success: true,
        message: 'Status',
        data: statuses,
      });
    } catch (e) {
      next(e);
    }
  }

  async download(req: Request, res: Response, next: NextFunction) {
    try {
      let name = req.params.name;
      // let response: string = await repository.show(name);
      res.sendFile(path.join(__dirname, '../../public/exports/' + name));
      // if no timesheet found
      // return res.status(200).json({
      //   success: true,
      //   // message: `Win Opportunity ${req.params.id}`,
      //   message: 'Files Uploaded Succesfully',
      //   data: response,
      // });
    } catch (e) {
      next(e);
    }
  }

  async export(req: Request, res: Response, next: NextFunction) {
    try {
      let manager = getManager();
      let type = req.params.type;
      if (!type) {
        throw new Error('Type is Required');
      }
      let entities, name;
      let employees = await manager.find(Employee, {
        relations: ['contactPersonOrganization'],
      });

      switch (type) {
        case Entities.ORGANIZATION:
          entities = await manager.find(Organization);
          name = ExportFileName.ORGANIZATION;
          break;
        case Entities.CONTACT_PERSON:
          entities = await manager.find(ContactPerson);
          name = ExportFileName.CONTACT_PERSON;
          break;
        case Entities.PROJECT:
          entities = await manager.find(Opportunity, {
            where: {
              status: In(['O', 'L', 'NB', 'DNP']),
            },
          });
          name = ExportFileName.PROJECT;
          break;
        case Entities.OPPORTUNITY:
          entities = await manager.find(Opportunity, {
            where: { status: In(['P', 'C']) },
          });
          name = ExportFileName.OPPORTUNITY;
          break;
        case Entities.EMPLOYEE:
          entities = employees.filter(
            (emp) => emp.contactPersonOrganization.organizationId === 1
          );
          // entities = await manager.find(Employee, { where: { roleId: 2 } });
          name = ExportFileName.EMPLOYEE;
          break;
        case Entities.SUB_CONTRACTOR:
          entities = employees.filter(
            (emp) => emp.contactPersonOrganization.organizationId !== 1
          );
          // entities = await manager.find(Employee, { where: { roleId: 3 } });
          name = ExportFileName.SUB_CONTRACTOR;
          break;
        default:
          entities = await manager.find(Organization);
          name = ExportFileName.ORGANIZATION;
          break;
      }

      let statuses = await manager.find(DataExport, { where: { type: type } });
      let status = statuses[0];

      if (!status) {
        throw new Error('Something went wrong');
      }

      status.active = true;
      status.progress = 0;

      await manager.save(status);

      // Reading our test file
      fs.writeFileSync(
        path.join(__dirname, `../../public/exports/${name}`),
        ''
      );

      var workbook = xlsx.utils.book_new();

      const ws = xlsx.utils.json_to_sheet(entities);

      xlsx.utils.book_append_sheet(workbook, ws, 'main');

      // Writing to our file
      xlsx.writeFile(workbook, `./public/exports/${name}`);

      status.active = false;
      status.progress = 100;
      status.downloaded = true;

      await manager.save(status);

      return res.status(200).json({
        success: true,
        message: 'File Created Succesfully',
        data: status,
      });
    } catch (e) {
      next(e);
    }
  }
}
