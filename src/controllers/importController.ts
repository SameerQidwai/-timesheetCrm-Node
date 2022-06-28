import { Request, Response, NextFunction, json } from 'express';
import { getManager, In } from 'typeorm';
import xlsx from 'xlsx';
import fs, { stat } from 'fs';
import path from 'path';
import { Organization } from '../entities/organization';
import { Entities, ImportLogName } from '../constants/constants';
import { Employee } from '../entities/employee';
import { Opportunity } from '../entities/opportunity';
import { ContactPerson } from '../entities/contactPerson';
import { DataImport } from '../entities/dataImport';
import moment from 'moment';

export class ImportController {
  async import(req: Request, res: Response, next: NextFunction) {
    try {
      let manager = getManager();
      let type = req.params.type;
      if (!type) {
        throw new Error('Type is Required');
      }

      let workbook = xlsx.read(req.file.buffer),
        jsonData = xlsx.utils.sheet_to_json(
          workbook.Sheets[workbook.SheetNames[0]]
        ),
        name = '',
        logsData: any = [];

      let statuses = await manager.find(DataImport, { where: { type: type } });
      let status = statuses[0];

      if (!status) {
        throw new Error('Something went wrong');
      }

      status.active = true;
      status.progress = 0;
      status.uploaded = false;

      await manager.save(status);

      switch (type) {
        case Entities.ORGANIZATION:
          name = ImportLogName.ORGANIZATION;
          for (let entry of jsonData as Organization[]) {
            try {
              if (entry.id) {
                if (entry.id == 87) {
                  console.log(
                    '🚀 ~ file: importController.ts ~ line 50 ~ ImportController ~ import ~ entry',
                    entry
                  );
                }
                let org = await manager.findOne(Organization, entry.id);
                org = entry;
                org.createdAt = moment(
                  entry.createdAt,
                  'MM/DD/YYYY H:i:s A'
                ).toDate();
                org.updatedAt = moment(
                  entry.updatedAt,
                  'MM/DD/YYYY H:i:s A'
                ).toDate();
                (org as any).deletedAt = entry.deletedAt
                  ? moment(entry.deletedAt, 'MM/DD/YYYY H:i:s A').toDate()
                  : null;
                (org as any).piInsuranceExpiry = entry.piInsuranceExpiry
                  ? moment(
                      entry.piInsuranceExpiry,
                      'MM/DD/YYYY H:i:s A'
                    ).toDate()
                  : null;
                (org as any).plInsuranceExpiry = entry.plInsuranceExpiry
                  ? moment(
                      entry.plInsuranceExpiry,
                      'MM/DD/YYYY H:i:s A'
                    ).toDate()
                  : null;
                (org as any).wcInsuranceExpiry = entry.wcInsuranceExpiry
                  ? moment(
                      entry.wcInsuranceExpiry,
                      'MM/DD/YYYY H:i:s A'
                    ).toDate()
                  : null;
                await manager.save(Organization, org);
                (entry as any).logStatus = 'UPDATED';
              } else {
                let org = new Organization();
                org = entry;
                org.createdAt = moment().toDate();
                org.updatedAt = moment().toDate();
                (org as any).piInsuranceExpiry = entry.piInsuranceExpiry
                  ? moment(
                      entry.piInsuranceExpiry,
                      'MM/DD/YYYY H:i:s A'
                    ).toDate()
                  : null;
                (org as any).plInsuranceExpiry = entry.plInsuranceExpiry
                  ? moment(
                      entry.plInsuranceExpiry,
                      'MM/DD/YYYY H:i:s A'
                    ).toDate()
                  : null;
                (org as any).wcInsuranceExpiry = entry.wcInsuranceExpiry
                  ? moment(
                      entry.wcInsuranceExpiry,
                      'MM/DD/YYYY H:i:s A'
                    ).toDate()
                  : null;
                await manager.save(Organization, org);
                (entry as any).logStatus = 'CREATED';
              }
            } catch (e) {
              (entry as any).logStatus = 'FAILED';
            }
            logsData.push(entry);
          }
          //PASTE THE DATE CODE AND CHANGE EXPORT ENTITY STUFF
          break;
        case Entities.CONTACT_PERSON:
          name = ImportLogName.CONTACT_PERSON;
          for (let entry of jsonData as ContactPerson[]) {
            try {
              if (entry.id) {
                let org = await manager.findOne(ContactPerson, entry.id);
                org = entry;
                await manager.save(ContactPerson, org);
                (entry as any).logStatus = 'CREATED';
              } else {
                let org = new ContactPerson();
                org = entry;
                await manager.save(ContactPerson, org);
                (entry as any).logStatus = 'UPDATED';
              }
            } catch (e) {
              (entry as any).logStatus = 'FAILED';
            }
            logsData.push(entry);
          }
          //PASTE THE DATE CODE AND CHANGE EXPORT ENTITY STUFF
          break;
        case Entities.PROJECT:
          name = ImportLogName.PROJECT;
          for (let entry of jsonData as Opportunity[]) {
            try {
              if (entry.id) {
                let org = await manager.findOne(Opportunity, entry.id);
                org = entry;
                await manager.save(Opportunity, org);
                (entry as any).logStatus = 'CREATED';
              } else {
                let org = new Opportunity();
                org = entry;
                await manager.save(Opportunity, org);
                (entry as any).logStatus = 'UPDATED';
              }
            } catch (e) {
              (entry as any).logStatus = 'FAILED';
            }
            logsData.push(entry);
          }
          //PASTE THE DATE CODE AND CHANGE EXPORT ENTITY STUFF
          break;
        case Entities.OPPORTUNITY:
          name = ImportLogName.OPPORTUNITY;
          for (let entry of jsonData as Opportunity[]) {
            try {
              if (entry.id) {
                let org = await manager.findOne(Opportunity, entry.id);
                org = entry;
                await manager.save(Opportunity, org);
                (entry as any).logStatus = 'CREATED';
              } else {
                let org = new Opportunity();
                org = entry;
                await manager.save(Opportunity, org);
                (entry as any).logStatus = 'UPDATED';
              }
            } catch (e) {
              (entry as any).logStatus = 'FAILED';
            }
            logsData.push(entry);
          }
          //PASTE THE DATE CODE AND CHANGE EXPORT ENTITY STUFF
          break;
        case Entities.EMPLOYEE:
          name = ImportLogName.EMPLOYEE;
          for (let entry of jsonData as Employee[]) {
            try {
              if (entry.id) {
                let org = await manager.findOne(Employee, entry.id);
                org = entry;
                await manager.save(Employee, org);
                (entry as any).logStatus = 'CREATED';
              } else {
                let org = new Employee();
                org = entry;
                await manager.save(Employee, org);
                (entry as any).logStatus = 'UPDATED';
              }
            } catch (e) {
              (entry as any).logStatus = 'FAILED';
            }
            logsData.push(entry);
          }
          //PASTE THE DATE CODE AND CHANGE EXPORT ENTITY STUFF
          break;
        case Entities.SUB_CONTRACTOR:
          name = ImportLogName.SUB_CONTRACTOR;
          for (let entry of jsonData as Employee[]) {
            try {
              if (entry.id) {
                let org = await manager.findOne(Employee, entry.id);
                org = entry;
                await manager.save(Employee, org);
                (entry as any).logStatus = 'CREATED';
              } else {
                let org = new Employee();
                org = entry;
                await manager.save(Employee, org);
                (entry as any).logStatus = 'UPDATED';
              }
            } catch (e) {
              (entry as any).logStatus = 'FAILED';
            }
            logsData.push(entry);
          }
          //PASTE THE DATE CODE AND CHANGE EXPORT ENTITY STUFF
          break;
        default:
          name = ImportLogName.ORGANIZATION;
          for (let entry of jsonData as Organization[]) {
            if (entry.id) {
              let org = await manager.findOne(Organization, entry.id);
              org = entry;
              await manager.save(Organization, org);
            } else {
              let org = new Organization();
              org = entry;
              await manager.save(Organization, org);
            }
          }
          //PASTE THE DATE CODE AND CHANGE EXPORT ENTITY STUFF
          break;
      }

      fs.writeFileSync(
        path.join(__dirname, `../../public/exports/${name}`),
        ''
      );

      let logBook = xlsx.utils.book_new();

      const ws = xlsx.utils.json_to_sheet(logsData);

      xlsx.utils.book_append_sheet(logBook, ws, 'main');

      // Writing to our file
      xlsx.writeFile(logBook, `./public/exports/${name}`);

      status.active = false;
      status.progress = 100;
      status.uploaded = true;

      await manager.save(status);

      return res.status(200).json({
        success: true,
        message: 'File Uploaded Successfully',
        data: status,
      });
    } catch (e) {
      next(e);
    }
  }
}
