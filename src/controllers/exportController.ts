import { Request, Response, NextFunction } from 'express';
import xlsx from 'xlsx';
import fs, { stat } from 'fs';
import path from 'path';
import { Organization } from '../entities/organization';
import { getManager, In } from 'typeorm';
import {
  BusinessType,
  ClearanceLevel,
  Entities,
  ExportFileName,
  Gender,
  ImportLogName,
  ProjectType,
} from '../constants/constants';
import { ContactPerson } from '../entities/contactPerson';
import { Opportunity } from '../entities/opportunity';
import { Employee } from '../entities/employee';
import { DataExport } from '../entities/dataExport';
import { DataImport } from '../entities/dataImport';
import {
  ContactPersonEntity,
  EmployeeEntity,
  OpportunityEntity,
  OrganizationEntity,
  ProjectEntity,
  SubContractorEntity,
} from '../dto';

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
      let entities, name, response;

      switch (type) {
        case Entities.ORGANIZATION:
          response = await this._getOrganizations();
          name = response.name;
          entities = response.entities;
          break;
        case Entities.CONTACT_PERSON:
          response = await this._getContactPersons();
          name = response.name;
          entities = response.entities;
          break;
        case Entities.PROJECT:
          response = await this._getProjects();
          name = response.name;
          entities = response.entities;
          break;
        case Entities.OPPORTUNITY:
          response = await this._getOpportunities();
          name = response.name;
          entities = response.entities;
          break;
        case Entities.EMPLOYEE:
          response = await this._getEmployees();
          name = response.name;
          entities = response.entities;
          break;
        case Entities.SUB_CONTRACTOR:
          response = await this._getSubContractors();
          name = response.name;
          entities = response.entities;
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

  async _getOrganizations() {
    let manager = getManager();

    let dbOrganizations = await manager.find(Organization, {
      relations: ['delegateContactPerson', 'parentOrganization'],
    });
    let organizations: OrganizationEntity[] = [];

    dbOrganizations.forEach((org) => {
      let entity: OrganizationEntity = {
        ID: org.id,
        Name: org.name,
        Title: org.title,
        Phone: org.phoneNumber,
        Email: org.email,
        'Business Type': org.businessType,
        Address: org.address,
        Website: org.website,
        'Parent Organization ID': org.parentOrganizationId,
        'Parent Organization': org.parentOrganization?.name,
        'Delegate Contact Person ID': org.delegateContactPersonId,
        'Delegate Contact Person': `${org.delegateContactPerson?.firstName} ${org.delegateContactPerson?.lastName}`,
        ABN: org.abn,
        'Tax Code': org.taxCode,
        'Email for Invoices': org.invoiceEmail,
        'Contact Number for Invoices': org.invoiceContactNumber,
        'Professional Indemnity Insurer': org.piInsurer,
        'Professional Indemnity Policy Number': org.piPolicyNumber,
        'Professional Indemnity Sum Insured': org.piSumInsured,
        'Professional Indemnity Expiry': org.plInsuranceExpiry,
        'Public Liability Insurer': org.plInsurer,
        'Public Liability Policy Number': org.plPolicyNumber,
        'Public Liability Sum Insured': org.plSumInsured,
        'Public Liability Expiry': org.plInsuranceExpiry,
        "Worker's Compensation Insurer": org.wcInsurer,
        "Worker's Compensation Policy Number": org.wcPolicyNumber,
        "Worker's Compensation Sum Insured": org.wcSumInsured,
        "Worker's Compensation Expiry": org.wcInsuranceExpiry,
        'Current Year Forecast': org.currentFinancialYearTotalForecast,
        'Next Year Forecast': org.nextFinancialYearTotalForecast,
      };

      organizations.push(entity);
    });
    return {
      entities: organizations,
      name: ExportFileName.ORGANIZATION,
    };
  }

  async _getContactPersons() {
    let manager = getManager();

    let dbContactPersons = await manager.find(ContactPerson, {
      relations: [
        'contactPersonOrganizations',
        'contactPersonOrganizations.employee',
        'contactPersonOrganizations.employee.contactPersonOrganization',
        'contactPersonOrganizations.employee.contactPersonOrganization.organization',
        'state',
        'clearanceSponsor',
      ],
    });
    let contactPersons: ContactPersonEntity[] = [];

    dbContactPersons.forEach((cp) => {
      let entity: ContactPersonEntity = {
        ID: cp.id,
        'First Name': cp.firstName,
        'Last Name': cp.lastName,
        Phone: cp.phoneNumber,
        Email: cp.email,
        Gender: cp.gender,
        'State ID': cp.stateId,
        State: cp.state.label,
        Address: cp.address,
        'Clearance Level': cp.clearanceLevel,
        'Clearance Date Granted': cp.clearanceGrantedDate,
        'Clearance Expiry Date': cp.clearanceExpiryDate,
        'Current Sponsor ID': cp.clearanceSponsorId,
        'Current Sponsor': cp.clearanceSponsor?.name,
        'Organization ID':
          cp.getEmployee?.contactPersonOrganization.organizationId,
        Organization:
          cp.getEmployee?.contactPersonOrganization.organization.name,
      };

      contactPersons.push(entity);
    });

    return {
      entities: contactPersons,
      name: ExportFileName.CONTACT_PERSON,
    };
  }

  async _getOpportunities() {
    let manager = getManager();

    let dbOpportunities = await manager.find(Opportunity, {
      where: {
        status: In(['O', 'L', 'NB', 'DNP']),
      },
      relations: [
        'panel',
        'contactPerson',
        'organization',
        'linkedWork',
        'state',
        'accountDirector',
        'accountDirector.contactPersonOrganization',
        'accountDirector.contactPersonOrganization.contactPerson',
        'accountManager',
        'accountManager.contactPersonOrganization',
        'accountManager.contactPersonOrganization.contactPerson',
        'opportunityManager',
        'opportunityManager.contactPersonOrganization',
        'opportunityManager.contactPersonOrganization.contactPerson',
      ],
    });
    let opportunities: OpportunityEntity[] = [];

    dbOpportunities.forEach((opportunity) => {
      let entity: OpportunityEntity = {
        ID: opportunity.id,
        'Panel ID': opportunity.panelId,
        Panel: opportunity.panel.label,
        'Organization ID': opportunity.organizationId,
        Organization: opportunity.organization.title,
        'Delegate Contact Person ID': opportunity.contactPersonId,
        'Delegate Contact Person': `${opportunity.contactPerson?.firstName} ${opportunity.contactPerson?.lastName}`,
        Name: opportunity.title,
        'Type ID': opportunity.type,
        'State ID': opportunity.stateId,
        State: opportunity.state.label,
        'Qualified Ops': opportunity.qualifiedOps,
        Stage: opportunity.stage,
        'Linked Project ID': opportunity.linkedWorkId,
        'Linked Project': opportunity.linkedWork?.title,
        'Tender Title': opportunity.tender,
        'Tender Number': opportunity.tenderNumber,
        'Expected Start Date': opportunity.startDate,
        'Expected End Date': opportunity.endDate,
        'Work Hours Per Day': opportunity.hoursPerDay,
        'Bid Due Date': opportunity.bidDate,
        'Entry Date': opportunity.entryDate,
        'Estimated Value': opportunity.value,
        'Contribution Margin as a %': opportunity.cmPercentage,
        Go: opportunity.goPercentage,
        Get: opportunity.getPercentage,
        'Account Director ID': opportunity.accountDirectorId,
        'Account Director': opportunity.accountDirector?.getFullName,
        'Account Manager ID': opportunity.accountManagerId,
        'Account Manager': opportunity.accountManager?.getFullName,
        'Opportunity Manager ID': opportunity.opportunityManagerId,
        'Opportunity Manager': opportunity.opportunityManager?.getFullName,
      };

      opportunities.push(entity);
    });

    return {
      entities: opportunities,
      name: ExportFileName.OPPORTUNITY,
    };
  }

  async _getProjects() {
    let manager = getManager();

    let dbProjects = await manager.find(Opportunity, {
      where: { status: In(['P', 'C']) },
      relations: [
        'panel',
        'contactPerson',
        'organization',
        'linkedWork',
        'state',
        'accountDirector',
        'accountDirector.contactPersonOrganization',
        'accountDirector.contactPersonOrganization.contactPerson',
        'accountManager',
        'accountManager.contactPersonOrganization',
        'accountManager.contactPersonOrganization.contactPerson',
        'projectManager',
        'projectManager.contactPersonOrganization',
        'projectManager.contactPersonOrganization.contactPerson',
      ],
    });
    let projects: ProjectEntity[] = [];

    dbProjects.forEach((project) => {
      let entity: ProjectEntity = {
        ID: project.id,
        'Panel ID': project.panelId,
        Panel: project.panel.label,
        'Organization ID': project.organizationId,
        Organization: project.organization.title,
        'Delegate Contact Person ID': project.contactPersonId,
        'Delegate Contact Person': `${project.contactPerson?.firstName} ${project.contactPerson?.lastName}`,
        Name: project.title,
        'Type ID': project.type,
        'State ID': project.stateId,
        State: project.state?.label,
        'Qualified Ops': project.qualifiedOps,
        Stage: project.stage,
        'Linked Project ID': project.linkedWorkId,
        'Tender Title': project.tender,
        'Tender Number': project.tenderNumber,
        'Start Date': project.startDate,
        'End Date': project.endDate,
        'Work Hours Per Day': project.hoursPerDay,
        'Bid Due Date': project.bidDate,
        'Entry Date': project.entryDate,
        'Estimated Value': project.value,
        'Contribution Margin as a %': project.cmPercentage,
        Go: project.goPercentage,
        Get: project.getPercentage,
        'Account Director ID': project.accountDirectorId,
        'Account Director': project.accountDirector?.getFullName,
        'Account Manager ID': project.accountManagerId,
        'Account Manager': project.accountManager?.getFullName,
        'Project Manager ID': project.projectManagerId,
        'Project Manager': project.projectManager?.getFullName,
      };

      projects.push(entity);
    });

    return {
      entities: projects,
      name: ExportFileName.PROJECT,
    };
  }

  async _getEmployees() {
    let manager = getManager();

    let fetchedEmployees = await manager.find(Employee, {
      relations: [
        'contactPersonOrganization',
        'contactPersonOrganization.contactPerson',
        'role',
        'lineManager',
        'lineManager.contactPersonOrganization',
        'lineManager.contactPersonOrganization.contactPerson',
      ],
    });

    let dbEmployees = fetchedEmployees.filter((emp) => {
      if (emp.contactPersonOrganization.organizationId === 1) {
        return emp;
      }
    });

    let employees: EmployeeEntity[] = [];

    dbEmployees.forEach((employee) => {
      let entity: EmployeeEntity = {
        ID: employee.id,
        Email: employee.username,
        Password: '---------',
        'Role ID': employee.roleId,
        Role: employee.role.label,
        'Next Of Kin Name': employee.nextOfKinName,
        'Next Of Kin Phone': employee.nextOfKinPhoneNumber,
        'Next Of Kin Email': employee.nextOfKinEmail,
        'Next Of Kin Relationship': employee.nextOfKinRelation,
        TFN: employee.tfn,
        'Tax-free Threshold': employee.taxFreeThreshold,
        'Help (HECS)': employee.helpHECS,
        Training: employee.training,
        'Line Manager ID': employee.lineManagerId,
        'Line Manager': employee.lineManager?.getFullName,
        'Contact Person ID': employee.contactPersonOrganization.contactPersonId,
        'Contact Person': `${employee.contactPersonOrganization.contactPerson?.firstName} ${employee.contactPersonOrganization.contactPerson?.lastName}`,
      };

      employees.push(entity);
    });

    return {
      entities: employees,
      name: ExportFileName.EMPLOYEE,
    };
  }

  async _getSubContractors() {
    let manager = getManager();

    let fetchedEmployees = await manager.find(Employee, {
      relations: [
        'contactPersonOrganization',
        'contactPersonOrganization.contactPerson',
        'contactPersonOrganization.organization',
        'role',
        'lineManager',
        'lineManager.contactPersonOrganization',
        'lineManager.contactPersonOrganization.contactPerson',
      ],
    });

    let dbSubContractors = fetchedEmployees.filter((sub) => {
      if (sub.contactPersonOrganization.organizationId !== 1) {
        return sub;
      }
    });

    let subContractors: SubContractorEntity[] = [];

    dbSubContractors.forEach((subContractor) => {
      let entity: SubContractorEntity = {
        ID: subContractor.id,
        Email: subContractor.username,
        Password: '---------',
        'Role ID': subContractor.roleId,
        Role: subContractor.role.label,
        'Next Of Kin Name': subContractor.nextOfKinName,
        'Next Of Kin Phone': subContractor.nextOfKinPhoneNumber,
        'Next Of Kin Email': subContractor.nextOfKinEmail,
        'Next Of Kin Relationship': subContractor.nextOfKinRelation,
        TFN: subContractor.tfn,
        'Tax-free Threshold': subContractor.taxFreeThreshold,
        'Help (HECS)': subContractor.helpHECS,
        Training: subContractor.training,
        'Contractor Manager ID': subContractor.lineManagerId,
        'Contractor Manager': subContractor.lineManager?.getFullName,
        'Contact Person ID':
          subContractor.contactPersonOrganization.contactPersonId,
        'Contact Person': `${subContractor.contactPersonOrganization.contactPerson?.firstName} ${subContractor.contactPersonOrganization.contactPerson?.lastName}`,
        'Organization ID':
          subContractor.contactPersonOrganization.organizationId,
        Organization:
          subContractor.contactPersonOrganization.organization.title,
      };

      subContractors.push(entity);
    });

    return {
      entities: subContractors,
      name: ExportFileName.SUB_CONTRACTOR,
    };
  }
}
