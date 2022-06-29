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
import { ContactPersonOrganization } from '../entities/contactPersonOrganization';

export class ImportController {
  async import(req: Request, res: Response, next: NextFunction) {
    try {
      let manager = getManager();
      let type = req.params.type;
      if (!type) {
        throw new Error('Type is Required');
      }

      let workbook = xlsx.read(req.file.buffer, { cellDates: true }),
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
                let org = await manager.findOne(Organization, entry.id);
                org = entry;
                await manager.save(Organization, org);
                (entry as any).logStatus = 'UPDATED';
              } else {
                let org = new Organization();
                org = entry;
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
                // let cp = await manager.findOne(ContactPerson, entry.id);
                // cp = entry;
                // await manager.save(ContactPerson, cp);
                (entry as any).logStatus = 'SKIPPED';
              } else {
                let contactPersonObj = new ContactPerson();
                contactPersonObj = entry;
                let contactPerson = await manager.save(
                  ContactPerson,
                  contactPersonObj
                );
                if ((entry as any).organizationId) {
                  let asso = new ContactPersonOrganization();
                  asso.contactPersonId = contactPerson.id;
                  asso.organizationId = (entry as any).organizationId;
                  asso.startDate = moment().toDate();
                  asso.status = true;
                  await manager.save(ContactPersonOrganization, asso);
                }
                (entry as any).logStatus = 'CREATED';
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
                // let org = await manager.findOne(Opportunity, entry.id);
                // org = entry;
                // await manager.save(Opportunity, org);
                (entry as any).logStatus = 'SKIPPED';
              } else {
                let org = new Opportunity();
                org = entry;
                await manager.save(Opportunity, org);
                (entry as any).logStatus = 'CREATED';
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
                // let org = await manager.findOne(Opportunity, entry.id);
                // org = entry;
                // await manager.save(Opportunity, org);
                (entry as any).logStatus = 'SKIPPED';
              } else {
                let org = new Opportunity();
                org = entry;
                await manager.save(Opportunity, org);
                (entry as any).logStatus = 'CREATED';
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
                // let org = await manager.findOne(Employee, entry.id);
                // org = entry;
                // await manager.save(Employee, org);
                (entry as any).logStatus = 'SKIPPED';
              } else {
                let employeeObj = new Employee();
                employeeObj = entry;
                if (
                  (entry as any).organizationId &&
                  (entry as any).contactPersonId
                ) {
                  let associations = await manager.find(
                    ContactPersonOrganization,
                    {
                      where: {
                        contactPersonId: (entry as any).contactPersonId,
                        organizationId: (entry as any).organizationId,
                      },
                    }
                  );
                  let association = associations[0];
                  if (!association) {
                    throw new Error('Associaton not found');
                  }
                  employeeObj.contactPersonOrganizationId = association.id;
                }
                await manager.save(Employee, employeeObj);
                (entry as any).logStatus = 'CREATED';
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
                // let org = await manager.findOne(Employee, entry.id);
                // org = entry;
                // await manager.save(Employee, org);
                (entry as any).logStatus = 'SKIPPED';
              } else {
                let subcontractorObj = new Employee();
                subcontractorObj = entry;
                if (
                  (entry as any).organizationId &&
                  (entry as any).contactPersonId
                ) {
                  let associations = await manager.find(
                    ContactPersonOrganization,
                    {
                      where: {
                        contactPersonId: (entry as any).contactPersonId,
                        organizationId: (entry as any).organizationId,
                      },
                    }
                  );
                  let association = associations[0];
                  if (!association) {
                    throw new Error('Associaton not found');
                  }
                  subcontractorObj.contactPersonOrganizationId = association.id;
                }
                await manager.save(Employee, subcontractorObj);
                (entry as any).logStatus = 'CREATED';
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
