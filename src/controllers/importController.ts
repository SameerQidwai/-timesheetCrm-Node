import { Request, Response, NextFunction, json } from 'express';
import { getManager, In, RelationId } from 'typeorm';
import xlsx from 'xlsx';
import fs, { stat } from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { Organization } from '../entities/organization';
import { BusinessType, Entities, ImportLogName } from '../constants/constants';
import { Employee } from '../entities/employee';
import { Opportunity } from '../entities/opportunity';
import { ContactPerson } from '../entities/contactPerson';
import { DataImport } from '../entities/dataImport';
import moment from 'moment';
import { ContactPersonOrganization } from '../entities/contactPersonOrganization';
import {
  ContactPersonEntity,
  EmployeeEntity,
  OpportunityEntity,
  OrganizationEntity,
  ProjectEntity,
  SubContractorEntity,
} from '../dto';
import { State } from '../entities/state';
import { Panel } from '../entities/panel';
import { Milestone } from '../entities/milestone';
import { BankAccount } from '../entities/bankAccount';
import {
  contactPersonXLSXValidator,
  employeeXLSXValidator,
  opportunityXLSXValidator,
  organizationXLSXValidator,
  projectXLSXValidator,
  subContractorXLSXValidator,
} from '../rules';

export class ImportController {
  async import(req: Request, res: Response, next: NextFunction) {
    try {
      let manager = getManager();
      let type = req.params.type;
      if (!type) {
        throw new Error('Type is Required');
      }

      let workbook = xlsx.read(req.file.buffer, {
          cellDates: true,
        }),
        jsonData = xlsx.utils.sheet_to_json(
          workbook.Sheets[workbook.SheetNames[0]],
          { raw: false, dateNF: 'dd/mm/yyyy' }
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
          for (let entry of jsonData as OrganizationEntity[]) {
            try {
              if (!entry.ID) {
                await this._setOrganization(entry);
                (entry as any)['Log Status'] = 'CREATED';
              } else {
                let entity = await manager.findOne(Organization, entry.ID);
                await this._setOrganization(entry, entity);
                (entry as any)['Log Status'] = 'UPDATED';
              }
            } catch (e) {
              (entry as any).Reason = (e as any).message;
              (entry as any)['Log Status'] = 'FAILED';
            }
            logsData.push(entry);
          }
          //PASTE THE DATE CODE AND CHANGE EXPORT ENTITY STUFF
          break;
        case Entities.CONTACT_PERSON:
          name = ImportLogName.CONTACT_PERSON;
          for (let entry of jsonData as ContactPersonEntity[]) {
            try {
              if (!entry.ID) {
                console.log(entry);
                await this._setContactPerson(entry);
                (entry as any)['Log Status'] = 'CREATED';
              } else {
                (entry as any)['Log Status'] = 'SKIPPED';
              }
            } catch (e) {
              (entry as any).Reason = (e as any).message;
              (entry as any)['Log Status'] = 'FAILED';
            }
            logsData.push(entry);
          }
          //PASTE THE DATE CODE AND CHANGE EXPORT ENTITY STUFF
          break;
        case Entities.PROJECT:
          name = ImportLogName.PROJECT;
          for (let entry of jsonData as ProjectEntity[]) {
            try {
              if (!entry.ID) {
                await this._setProject(entry);
                (entry as any)['Log Status'] = 'CREATED';
              } else {
                (entry as any)['Log Status'] = 'SKIPPED';
              }
            } catch (e) {
              (entry as any).Reason = (e as any).message;
              (entry as any)['Log Status'] = 'FAILED';
            }
            logsData.push(entry);
          }
          //PASTE THE DATE CODE AND CHANGE EXPORT ENTITY STUFF
          break;
        case Entities.OPPORTUNITY:
          name = ImportLogName.OPPORTUNITY;
          for (let entry of jsonData as OpportunityEntity[]) {
            try {
              console.log(entry);
              if (!entry.ID) {
                await this._setOpportunity(entry);
                (entry as any)['Log Status'] = 'CREATED';
              } else {
                (entry as any)['Log Status'] = 'SKIPPED';
              }
            } catch (e) {
              (entry as any).Reason = (e as any).message;
              (entry as any)['Log Status'] = 'FAILED';
            }
            logsData.push(entry);
          }
          //PASTE THE DATE CODE AND CHANGE EXPORT ENTITY STUFF
          break;
        case Entities.EMPLOYEE:
          name = ImportLogName.EMPLOYEE;
          for (let entry of jsonData as EmployeeEntity[]) {
            try {
              if (!entry.ID) {
                await this._setEmployee(entry);
                (entry as any)['Log Status'] = 'CREATED';
              } else {
                (entry as any)['Log Status'] = 'SKIPPED';
              }
            } catch (e) {
              (entry as any).Reason = (e as any).message;
              (entry as any)['Log Status'] = 'FAILED';
            }
            logsData.push(entry);
          }
          //PASTE THE DATE CODE AND CHANGE EXPORT ENTITY STUFF
          break;
        case Entities.SUB_CONTRACTOR:
          name = ImportLogName.SUB_CONTRACTOR;
          for (let entry of jsonData as SubContractorEntity[]) {
            try {
              if (!entry.ID) {
                await this._setSubContractor(entry);
                (entry as any)['Log Status'] = 'CREATED';
              } else {
                (entry as any)['Log Status'] = 'SKIPPED';
              }
            } catch (e) {
              (entry as any).Reason = (e as any).message;
              (entry as any)['Log Status'] = 'FAILED';
            }
            logsData.push(entry);
          }
          //PASTE THE DATE CODE AND CHANGE EXPORT ENTITY STUFF
          break;
        default:
          throw new Error('Unknown Type');
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

  async _setOrganization(
    body: OrganizationEntity,
    organization: Organization | null = null
  ) {
    let manager = getManager();
    return await manager.transaction(async (transactionalEntityManager) => {
      await organizationXLSXValidator.validateCreate.validateAsync(body);

      if (organization) {
        var organizationObj = organization;
      } else {
        var organizationObj = new Organization();
      }

      organizationObj.name = body.Name;
      organizationObj.title = body.Title;
      organizationObj.phoneNumber = body.Phone;
      organizationObj.email = body.Email;
      organizationObj.address = body.Address;
      organizationObj.website = body.Website;
      organizationObj.abn = body.ABN;
      organizationObj.businessType = body['Business Type'];
      organizationObj.taxCode = body['Tax Code'];
      organizationObj.currentFinancialYearTotalForecast =
        body['Current Year Forecast'];
      organizationObj.nextFinancialYearTotalForecast =
        body['Next Year Forecast'];
      organizationObj.invoiceEmail = body['Email for Invoices'];
      organizationObj.invoiceContactNumber =
        body['Contact Number for Invoices'];
      organizationObj.piInsurer = body['Professional Indemnity Insurer'];
      organizationObj.plInsurer = body['Public Liability Insurer'];
      organizationObj.wcInsurer = body["Worker's Compensation Insurer"];
      organizationObj.piSumInsured = body['Professional Indemnity Sum Insured'];
      organizationObj.plSumInsured = body['Public Liability Sum Insured'];
      organizationObj.wcSumInsured = body["Worker's Compensation Sum Insured"];
      organizationObj.piPolicyNumber = body['Public Liability Policy Number'];
      organizationObj.plPolicyNumber = body['Public Liability Policy Number'];
      organizationObj.wcPolicyNumber =
        body["Worker's Compensation Policy Number"];
      if (body['Professional Indemnity Expiry'])
        organizationObj.piInsuranceExpiry = moment(
          body['Professional Indemnity Expiry'],
          'DD//MM//YYYY'
        ).toDate();
      if (body['Public Liability Expiry'])
        organizationObj.plInsuranceExpiry = moment(
          body['Public Liability Expiry'],
          'DD//MM//YYYY'
        ).toDate();
      if (body["Worker's Compensation Expiry"])
        organizationObj.wcInsuranceExpiry = moment(
          body["Worker's Compensation Expiry"],
          'DD//MM//YYYY'
        ).toDate();
      if (body['Parent Organization ID'])
        organizationObj.parentOrganization = await manager.findOne(
          Organization,
          body['Parent Organization ID']
        );
      if (body['Delegate Contact Person ID'] && organizationObj.id) {
        let contactPersonOrganizationObjFound = await manager.find(
          ContactPersonOrganization,
          {
            where: {
              contactPersonId: body['Delegate Contact Person ID'],
              organizationId: organizationObj.id,
            },
          }
        );
        if (contactPersonOrganizationObjFound.length > 0) {
          organizationObj.delegateContactPersonId =
            body['Delegate Contact Person ID'] || null;
        }
      }

      organizationObj = await transactionalEntityManager.save(organizationObj);
      if (!organization) {
        let bankAccount = new BankAccount();
        bankAccount.accountNo = '';
        bankAccount.bsb = '';
        bankAccount.name = '';
        bankAccount.organizationId = organizationObj.id;
        await transactionalEntityManager.save(bankAccount);
      }
      return;
    });
  }

  async _setContactPerson(body: ContactPersonEntity) {
    let manager = getManager();
    return await manager.transaction(async (transactionalEntityManager) => {
      await contactPersonXLSXValidator.validateCreate.validateAsync(body);

      let contactPersonObj = new ContactPerson();
      contactPersonObj.firstName = body['First Name'];
      contactPersonObj.lastName = body['Last Name'];
      contactPersonObj.email = body.Email;
      contactPersonObj.address = body.Address;
      contactPersonObj.gender = body.Gender;
      contactPersonObj.phoneNumber = body.Phone;

      let state: State | undefined;
      if (body['State ID']) {
        state = await manager.findOne(State, body['State ID']);
        if (!state) {
          throw new Error('State not found');
        }
        contactPersonObj.stateId = state.id;
      }

      if (
        body['Clearance Level'] &&
        body['Clearance Date Granted'] &&
        body['Clearance Expiry Date']
      ) {
        contactPersonObj.clearanceLevel = body['Clearance Level'];

        contactPersonObj.clearanceGrantedDate = moment(
          body['Clearance Date Granted'],
          'DD//MM//YYYY'
        ).toDate();
        contactPersonObj.clearanceExpiryDate = moment(
          body['Clearance Expiry Date'],
          'DD//MM//YYYY'
        ).toDate();
      }

      let clearanceSponsor: Organization | undefined;
      if (body['Current Sponsor ID']) {
        clearanceSponsor = await manager.findOne(
          Organization,
          body['Current Sponsor ID']
        );
        if (!clearanceSponsor) {
          throw new Error('Clearance Sponsor not found');
        }
        contactPersonObj.clearanceSponsorId = clearanceSponsor.id;
      }

      if (body['Organization ID']) {
        let association = new ContactPersonOrganization();
        association.contactPersonId = contactPersonObj.id;
        association.organizationId = body['Organization ID'];
        association.designation = '';
        association.startDate = moment().toDate();
        contactPersonObj.contactPersonOrganizations = [association];
      }

      return transactionalEntityManager.save(contactPersonObj);
    });
  }

  async _setOpportunity(body: OpportunityEntity) {
    let manager = getManager();

    return await manager.transaction(async (transactionalEntityManager) => {
      await opportunityXLSXValidator.validateCreate.validateAsync(body);
      let opportunityObj = new Opportunity();
      opportunityObj.title = body.Name;
      if (body['Expected Start Date']) {
        opportunityObj.startDate = moment(
          body['Expected Start Date'],
          'DD//MM//YYYY'
        ).toDate();
      }
      if (body['Expected End Date']) {
        opportunityObj.endDate = moment(
          body['Expected End Date'],
          'DD//MM//YYYY'
        ).toDate();
      }
      if (body['Bid Due Date']) {
        opportunityObj.bidDate = moment(
          body['Bid Due Date'],
          'DD//MM//YYYY'
        ).toDate();
      }
      if (body['Entry Date']) {
        opportunityObj.entryDate = moment(
          body['Entry Date'],
          'DD//MM//YYYY'
        ).toDate();
      }
      opportunityObj.qualifiedOps =
        body['Qualified Ops'] === 'TRUE' ? true : false;
      opportunityObj.value = body['Estimated Value'];
      opportunityObj.type = body['Type ID'];
      opportunityObj.tender = body['Tender Title'];
      opportunityObj.tenderNumber = body['Tender Number'];
      opportunityObj.hoursPerDay = body['Work Hours Per Day'];
      opportunityObj.cmPercentage = body['Contribution Margin as a %'];
      opportunityObj.goPercentage = body.Go;
      opportunityObj.getPercentage = body.Get;
      opportunityObj.stage = body.Stage;

      if (body['Linked Project ID']) {
        let linkedProject = await manager.findOne(
          Opportunity,
          body['Linked Project ID'],
          { where: { status: In(['P', 'C']) } }
        );
        if (linkedProject)
          opportunityObj.linkedWorkId = body['Linked Project ID'];
      }

      // validate organization
      let organization: Organization | undefined;
      if (body['Organization ID']) {
        organization = await manager.findOne(
          Organization,
          body['Organization ID']
        );
        if (!organization) {
          throw new Error('Organization not found');
        }
        opportunityObj.organizationId = organization.id;
      }

      // validate panel
      let panel: Panel | undefined;
      if (body['Panel ID']) {
        panel = await manager.findOne(Panel, body['Panel ID']);
        if (!panel) {
          throw new Error('Panel not found');
        }
        opportunityObj.panelId = panel.id;
      }

      let contactPerson: ContactPerson | undefined;
      if (body['Delegate Contact Person ID']) {
        contactPerson = await manager.findOne(
          ContactPerson,
          body['Delegate Contact Person ID']
        );
        if (!contactPerson) {
          throw new Error('Contact Person not found');
        }
        opportunityObj.contactPersonId = contactPerson.id;
      }

      let state: State | undefined;
      if (body['State ID']) {
        state = await manager.findOne(State, body['State ID']);
        if (!state) {
          throw new Error('State not found');
        }
        opportunityObj.stateId = state.id;
      }

      // let accountDirector: Employee | undefined;
      // if (body['Account Manager ID']) {
      //   accountDirector = await manager.findOne(
      //     Employee,
      //     body['Account Manager ID']
      //   );
      //   if (!accountDirector) {
      //     throw new Error('Account Director not found');
      //   }
      //   opportunityObj.accountDirectorId = accountDirector.id;
      //   // opportunityObj.accountDirectorId = 1;
      // }

      // let accountManager: Employee | undefined;

      // if (body['Account Manager ID']) {
      //   accountManager = await manager.findOne(
      //     Employee,
      //     body['Account Manager ID']
      //   );
      //   if (!accountManager) {
      //     throw new Error('Account Manager not found');
      //   }
      //   opportunityObj.accountManagerId = accountManager.id;
      //   // opportunityObj.accountManagerId = 1;
      // }

      // let opportunityManager: Employee | undefined;
      // if (body['Opportunity Manager ID']) {
      //   opportunityManager = await manager.findOne(
      //     Employee,
      //     body['Opportunity Manager ID']
      //   );
      //   if (!opportunityManager) {
      //     throw new Error('Opportunity Manager not found');
      //   }

      //   opportunityObj.opportunityManagerId = opportunityManager.id;
      //   // opportunityObj.opportunityManagerId = 1;
      // }

      opportunityObj.status = 'O';

      let newOpportunity = await transactionalEntityManager.save(
        opportunityObj
      );

      //CREATING BASE MILESTONE
      let milestoneObj = new Milestone();
      milestoneObj.title = 'Default Milestone';
      milestoneObj.description = '-';
      milestoneObj.startDate = newOpportunity.startDate;
      milestoneObj.endDate = newOpportunity.endDate;
      milestoneObj.isApproved = false;
      milestoneObj.projectId = newOpportunity.id;
      milestoneObj.progress = 0;

      let newMilestone = await transactionalEntityManager.save(
        Milestone,
        milestoneObj
      );
    });
  }

  async _setProject(body: ProjectEntity) {
    let manager = getManager();
    return await manager.transaction(async (transactionalEntityManager) => {
      await projectXLSXValidator.validateCreate.validateAsync(body);
      let projectObj = new Opportunity();
      projectObj.title = body.Name;
      if (body['Start Date']) {
        projectObj.startDate = moment(
          body['Start Date'],
          'DD//MM//YYYY'
        ).toDate();
      } else {
        throw new Error('Start date is required in project');
      }
      if (body['End Date']) {
        projectObj.endDate = moment(body['End Date'], 'DD//MM//YYYY').toDate();
      } else {
        throw new Error('End date is required in project');
      }

      if (body['Entry Date']) {
        projectObj.entryDate = moment(
          body['Entry Date'],
          'DD//MM//YYYY'
        ).toDate();
      }
      projectObj.qualifiedOps = body['Qualified Ops'] == 'TRUE' ? true : false;
      projectObj.value = body['Estimated Value'];
      projectObj.type = body['Type ID'];
      projectObj.tender = body['Tender Title'];
      projectObj.tenderNumber = body['Tender Number'];
      projectObj.hoursPerDay = body['Work Hours Per Day'];
      projectObj.cmPercentage = body['Contribution Margin as a %'];
      projectObj.stage = body.Stage;

      if (body['Linked Project ID']) {
        let linkedProject = await manager.findOne(
          Opportunity,
          body['Linked Project ID'],
          { where: { status: In(['P', 'C']) } }
        );
        if (linkedProject) projectObj.linkedWorkId = body['Linked Project ID'];
      }

      // validate organization
      let organization: Organization | undefined;
      if (body['Organization ID']) {
        organization = await manager.findOne(
          Organization,
          body['Organization ID']
        );
        if (!organization) {
          throw new Error('Organization not found');
        }
        projectObj.organizationId = organization.id;
      }

      // validate panel
      let panel: Panel | undefined;
      if (body['Panel ID']) {
        panel = await manager.findOne(Panel, body['Panel ID']);
        if (!panel) {
          throw new Error('Panel not found');
        }
        projectObj.panelId = panel.id;
      }

      let contactPerson: ContactPerson | undefined;
      if (body['Delegate Contact Person ID']) {
        contactPerson = await manager.findOne(
          ContactPerson,
          body['Delegate Contact Person ID']
        );
        if (!contactPerson) {
          throw new Error('Contact Person not found');
        }
        projectObj.contactPersonId = contactPerson.id;
      }

      let state: State | undefined;
      if (body['State ID']) {
        state = await manager.findOne(State, body['State ID']);
        if (!state) {
          throw new Error('State not found');
        }
        projectObj.stateId = state.id;
      }

      // let accountDirector: Employee | undefined;
      // if (body['Account Director ID']) {
      //   accountDirector = await manager.findOne(
      //     Employee,
      //     body['Account Director ID']
      //   );
      //   if (!accountDirector) {
      //     throw new Error('Account Director not found');
      //   }
      //   projectObj.accountDirectorId = accountDirector.id;
      // }
      // // projectObj.accountDirectorId = 1;

      // let accountManager: Employee | undefined;
      // if (body['Account Manager ID']) {
      //   accountManager = await manager.findOne(
      //     Employee,
      //     body['Account Manager ID']
      //   );
      //   if (!accountManager) {
      //     throw new Error('Account Manager not found');
      //   }
      //   projectObj.accountManagerId = accountManager.id;
      // }
      // // projectObj.accountManagerId = 1;

      // let projectManager: Employee | undefined;
      // if (body['Project Manager ID']) {
      //   projectManager = await manager.findOne(
      //     Employee,
      //     body['Project Manager ID']
      //   );
      //   if (!projectManager) {
      //     throw new Error('project Manager not found');
      //   }
      //   projectObj.projectManagerId = projectManager.id;
      // }
      // projectObj.projectManagerId = 1;

      projectObj.status = 'P';

      let newProject = await transactionalEntityManager.save(projectObj);

      //CREATING BASE MILESTONE
      let milestoneObj = new Milestone();
      milestoneObj.title = 'Default Milestone';
      milestoneObj.description = '-';
      milestoneObj.startDate = newProject.startDate;
      milestoneObj.endDate = newProject.endDate;
      milestoneObj.isApproved = false;
      milestoneObj.projectId = newProject.id;
      milestoneObj.progress = 0;

      let newMilestone = await transactionalEntityManager.save(
        Milestone,
        milestoneObj
      );
    });
  }

  async _setEmployee(body: EmployeeEntity) {
    let manager = getManager();
    return await manager.transaction(async (transactionalEntityManager) => {
      await employeeXLSXValidator.validateCreate.validateAsync(body);
      if (!body['Contact Person ID']) {
        throw new Error('Must provide contact person');
      }
      let contactPersonObj = await manager.findOne(
        ContactPerson,
        body['Contact Person ID'],
        { relations: ['contactPersonOrganizations'] }
      );
      if (!contactPersonObj) {
        throw new Error('Must provide contact person');
      }

      // find contactpersonorganization id for oneLM

      let contactPersonOrganization =
        contactPersonObj.contactPersonOrganizations.filter(
          (x) => x.organizationId == 1
        )[0];
      if (!contactPersonOrganization) {
        throw new Error('Not associated with oneLM');
      } else {
        let oldOrganization =
          contactPersonObj.contactPersonOrganizations.filter(
            (x) => x.status == true
          )[0];
        if (oldOrganization) {
          oldOrganization.status = false;

          await transactionalEntityManager.save(
            ContactPersonOrganization,
            oldOrganization
          );
        }

        contactPersonOrganization.status = true;
        await transactionalEntityManager.save(
          ContactPersonOrganization,
          contactPersonOrganization
        );
      }

      let employeeObj = new Employee();
      employeeObj.contactPersonOrganizationId = contactPersonOrganization.id;
      employeeObj.username = body.Email;
      // Math.random().toString(36).substring(4)
      employeeObj.password = bcrypt.hashSync(
        body.Password,
        bcrypt.genSaltSync(8)
      );

      employeeObj.nextOfKinName = body['Next Of Kin Name'];
      employeeObj.nextOfKinPhoneNumber = body['Next Of Kin Phone'];
      employeeObj.nextOfKinEmail = body['Next Of Kin Email'];
      employeeObj.nextOfKinRelation = body['Next Of Kin Relationship'];
      employeeObj.tfn = body.TFN;
      employeeObj.taxFreeThreshold =
        body['Tax-free Threshold'] == 'TRUE' ? true : false;
      employeeObj.helpHECS = body['Help (HECS)'] == 'TRUE' ? true : false;
      employeeObj.training = body.Training;
      employeeObj.roleId = body['Role ID'];

      // if (body['Line Manager ID']) {
      //   let resEmployee = await manager.findOne(
      //     Employee,
      //     body['Line Manager ID']
      //   );
      //   if (!resEmployee) {
      //     throw new Error('Line Manager not found');
      //   }

      //   employeeObj.lineManagerId = body['Line Manager ID'];
      // } else {
      //   employeeObj.lineManagerId = null;
      // }
      employeeObj = await transactionalEntityManager.save(employeeObj);

      let bankAccount = new BankAccount();
      bankAccount.name = body['Bank Account Holder Name'] ?? '';
      bankAccount.accountNo = body['Bank Account Number'] ?? '';
      bankAccount.bsb = body['BSB Number'] ?? '';
      bankAccount.employeeId = employeeObj.id;

      await transactionalEntityManager.save(bankAccount);

      return 1;
    });
  }

  async _setSubContractor(body: SubContractorEntity) {
    let manager = getManager();

    return await manager.transaction(async (transactionalEntityManager) => {
      await subContractorXLSXValidator.validateCreate.validateAsync(body);
      if (!body['Organization ID']) {
        throw new Error('Must provide organization');
      }
      let organizationObj = await manager.findOne(
        Organization,
        body['Organization ID']
      );
      if (!organizationObj) {
        throw new Error('Must provide organization');
      }

      if (!body['Contact Person ID']) {
        throw new Error('Must provide contact person');
      }
      let contactPersonObj = await manager.findOne(
        ContactPerson,
        body['Contact Person ID'],
        { relations: ['contactPersonOrganizations'] }
      );
      if (!contactPersonObj) {
        throw new Error('Must provide contact person');
      }

      // find contactpersonorganization id for oneLM
      let contactPersonOrganization =
        contactPersonObj.contactPersonOrganizations.filter(
          (x) => x.organizationId == body['Organization ID']
        )[0];
      if (!contactPersonOrganization) {
        throw new Error('Not associated with this organization');
      } else {
        let oldOrganization =
          contactPersonObj.contactPersonOrganizations.filter(
            (x) => x.status == true
          )[0];
        if (oldOrganization) {
          oldOrganization.status = false;

          await transactionalEntityManager.save(
            ContactPersonOrganization,
            oldOrganization
          );
        }

        contactPersonOrganization.status = true;
        await transactionalEntityManager.save(
          ContactPersonOrganization,
          contactPersonOrganization
        );
      }

      let employeeObj = new Employee();
      employeeObj.contactPersonOrganizationId = contactPersonOrganization.id;
      employeeObj.username = body.Email;
      employeeObj.password = bcrypt.hashSync(
        body.Password ?? '123123',
        bcrypt.genSaltSync(8)
      );

      employeeObj.nextOfKinName = body['Next Of Kin Name'];
      employeeObj.nextOfKinPhoneNumber = body['Next Of Kin Phone'];
      employeeObj.nextOfKinEmail = body['Next Of Kin Email'];
      employeeObj.nextOfKinRelation = body['Next Of Kin Relationship'];
      employeeObj.roleId = body['Role ID'];

      // if (body['Contractor Manager ID']) {
      //   let lineManager = await manager.findOne(
      //     Employee,
      //     body['Contractor Manager ID']
      //   );
      //   if (!lineManager) {
      //     throw new Error('Line Manager not found');
      //   }
      // }

      // employeeObj.lineManagerId = body['Contractor Manager ID'];
      employeeObj = await transactionalEntityManager.save(employeeObj);
    });
  }
}
