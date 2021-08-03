import bcrypt from 'bcryptjs';
import { getManager } from 'typeorm';
import { State } from '../entities/state';
import { Role } from '../entities/role';
import { Permission } from '../entities/permission';
import { Organization } from '../entities/organization';
import { ContactPerson } from '../entities/contactPerson';
import { Employee } from '../entities/employee';
import { ContactPersonOrganization } from '../entities/contactPersonOrganization';
import { EmploymentContract } from '../entities/employmentContract';
import { BankAccount } from '../entities/bankAccount';
import { BusinessType, ClearanceLevel, Gender } from '../constants/constants';
import { Action, Resource, Grant } from '../constants/authorization';
import { GlobalSetting } from '../entities/globalSetting';
import { GlobalSettingDTO } from '../dto';

let runSeeders = async () => {
  console.log('running seeders');
  await statesSeeder();
  await rolesSeeder();
  await permissionsSeeder();
  await globalSettingsSeeder();
  await organizationSeeder();
  await contactPersonSeeder();
  await employeeSeeder();
  console.log('seeders stopped');
};

let statesSeeder = async () => {
  let statesCount = (await getManager().find(State)).length;

  if (statesCount == 0) {
    let statesData = [
      'Victoria',
      'South Australia',
      'Queensland',
      'Western Australia',
      'Australian Capital Territory',
      'Tasmania',
      'New South Wales',
      'Northern Territory',
    ];

    let statesPromises = statesData.map(async (state) => {
      let obj = new State();
      obj.label = state;
      return obj;
    });

    let states = await Promise.all(statesPromises);

    await getManager().save(states);

    return true;
  }
  return false;
};

let rolesSeeder = async () => {
  let rolesCount = (await getManager().find(Role)).length;
  if (rolesCount == 0) {
    let rolesData = ['Admin', 'Employee', 'Sub-Contractor'];

    let rolesPromises = rolesData.map(async (role) => {
      let obj = new Role();
      obj.label = role;
      if (role == 'Admin') obj.isSystem = true;
      return obj;
    });

    let roles = await Promise.all(rolesPromises);

    await getManager().save(roles);
    return true;
  }
  return false;
};

let permissionsSeeder = async () => {
  let permissionsCount = (await getManager().find(Permission)).length;
  if (permissionsCount == 0) {
    let permissionsData = [
      { resource: 'ADMIN_OPTIONS', action: 'ADD', grant: 'ANY' },
      { resource: 'ADMIN_OPTIONS', action: 'DELETE', grant: 'ANY' },
      { resource: 'ADMIN_OPTIONS', action: 'UPDATE', grant: 'ANY' },
      { resource: 'ADMIN_OPTIONS', action: 'READ', grant: 'ANY' },
      { resource: 'CONTACT_PERSONS', action: 'ADD', grant: 'ANY' },
      { resource: 'CONTACT_PERSONS', action: 'DELETE', grant: 'ANY' },
      { resource: 'CONTACT_PERSONS', action: 'UPDATE', grant: 'ANY' },
      { resource: 'CONTACT_PERSONS', action: 'READ', grant: 'ANY' },
      { resource: 'ORGANIZATIONS', action: 'ADD', grant: 'ANY' },
      { resource: 'ORGANIZATIONS', action: 'DELETE', grant: 'ANY' },
      { resource: 'ORGANIZATIONS', action: 'UPDATE', grant: 'ANY' },
      { resource: 'ORGANIZATIONS', action: 'READ', grant: 'ANY' },
      { resource: 'USERS', action: 'ADD', grant: 'ANY' },
      { resource: 'USERS', action: 'DELETE', grant: 'ANY' },
      { resource: 'USERS', action: 'UPDATE', grant: 'ANY' },
      { resource: 'USERS', action: 'READ', grant: 'ANY' },
      { resource: 'PROJECTS', action: 'ADD', grant: 'ANY' },
      { resource: 'PROJECTS', action: 'DELETE', grant: 'ANY' },
      { resource: 'PROJECTS', action: 'UPDATE', grant: 'ANY' },
      { resource: 'PROJECTS', action: 'READ', grant: 'ANY' },
      { resource: 'PROJECTS', action: 'UPDATE', grant: 'MANAGE' },
      { resource: 'PROJECTS', action: 'READ', grant: 'MANAGE' },
      { resource: 'PROJECTS', action: 'READ', grant: 'OWN' },
      { resource: 'OPPORTUNITIES', action: 'ADD', grant: 'ANY' },
      { resource: 'OPPORTUNITIES', action: 'DELETE', grant: 'ANY' },
      { resource: 'OPPORTUNITIES', action: 'UPDATE', grant: 'ANY' },
      { resource: 'OPPORTUNITIES', action: 'READ', grant: 'ANY' },
      { resource: 'OPPORTUNITIES', action: 'UPDATE', grant: 'MANAGE' },
      { resource: 'OPPORTUNITIES', action: 'READ', grant: 'MANAGE' },
      { resource: 'TIMESHEETS', action: 'ADD', grant: 'ANY' },
      { resource: 'TIMESHEETS', action: 'DELETE', grant: 'ANY' },
      { resource: 'TIMESHEETS', action: 'UPDATE', grant: 'ANY' },
      { resource: 'TIMESHEETS', action: 'READ', grant: 'ANY' },
      { resource: 'TIMESHEETS', action: 'APPROVAL', grant: 'ANY' },
      { resource: 'TIMESHEETS', action: 'ADD', grant: 'MANAGE' },
      { resource: 'TIMESHEETS', action: 'UPDATE', grant: 'MANAGE' },
      { resource: 'TIMESHEETS', action: 'READ', grant: 'MANAGE' },
      { resource: 'TIMESHEETS', action: 'APPROVAL', grant: 'MANAGE' },
      { resource: 'TIMESHEETS', action: 'ADD', grant: 'OWN' },
      { resource: 'TIMESHEETS', action: 'UPDATE', grant: 'OWN' },
      { resource: 'TIMESHEETS', action: 'READ', grant: 'OWN' },
      { resource: 'PROFILE', action: 'UPDATE', grant: 'OWN' },
    ];

    let role = await getManager().findOne(Role, 1);

    if (!role) {
      throw new Error('Role not found');
    }
    let permissionObjects = permissionsData.map((p) => {
      let permission = new Permission();
      if (p.action == 'ADD') permission.action = Action.ADD;
      else if (p.action == 'UPDATE') permission.action = Action.UPDATE;
      else if (p.action == 'READ') permission.action = Action.READ;
      else if (p.action == 'DELETE') permission.action = Action.DELETE;
      else if (p.action == 'APPROVAL') permission.action = Action.APPROVAL;
      if (p.resource == 'ADMIN_OPTIONS')
        permission.resource = Resource.ADMIN_OPTIONS;
      else if (p.resource == 'CONTACT_PERSONS')
        permission.resource = Resource.CONTACT_PERSONS;
      else if (p.resource == 'ORGANIZATIONS')
        permission.resource = Resource.ORGANIZATIONS;
      else if (p.resource == 'USERS') permission.resource = Resource.USERS;
      else if (p.resource == 'PROJECTS')
        permission.resource = Resource.PROJECTS;
      else if (p.resource == 'OPPORTUNITIES')
        permission.resource = Resource.OPPORTUNITIES;
      else if (p.resource == 'TIMESHEETS')
        permission.resource = Resource.TIMESHEETS;
      else if (p.resource == 'PROFILE') permission.resource = Resource.PROFILE;
      if (p.grant == 'ANY') permission.grant = Grant.ANY;
      else if (p.grant == 'OWN') permission.grant = Grant.OWN;
      else if (p.grant == 'MANAGE') permission.grant = Grant.MANAGE;
      permission.roleId = 1;
      return permission;
    });

    role.permissions = permissionObjects;
    await getManager().save(role);

    return true;
  }
  return false;
};

let globalSettingsSeeder = async () => {
  let settingsCount = (await getManager().find(GlobalSetting)).length;
  if (settingsCount == 0) {
    let settingsData = {
      fromEmail: 'test1@email.com',
      recordsPerPage: '10',
      timeZone: 'gmt+5',
      displayEmail: 'test2@email.com',
    };

    let rowsPromises = Object.keys(settingsData).map(
      async (globalSettingRow) => {
        let row = await getManager().findOne(GlobalSetting, {
          where: {
            keyLabel: globalSettingRow,
          },
        });
        if (!row) {
          row = new GlobalSetting();
          row.keyLabel = globalSettingRow;
        }
        row.keyValue = settingsData[globalSettingRow as keyof GlobalSettingDTO];
        row.dataType = 'string';
        return row;
      }
    );
    let rows = await Promise.all(rowsPromises);
    await getManager().save(rows);

    return true;
  }
  return false;
};

let organizationSeeder = async () => {
  let organizationsCount = (await getManager().find(Organization)).length;
  if (organizationsCount == 0) {
    let organizationData = {
      name: 'One LM',
      title: '1LM',
      phoneNumber: '',
      email: '',
      address: '',
      website: '',
      abn: '',
      businessType: BusinessType.SOLE_TRADER,
      taxCode: '',
      currentFinancialYearTotalForecast: 0,
      nextFinancialYearTotalForecast: 0,
      invoiceEmail: '',
      invoiceContactNumber: '',
      piInsurer: '',
      plInsurer: '',
      wcInsurer: '',
      piPolicyNumber: '',
      plPolicyNumber: '',
      wcPolicyNumber: '',
      piSumInsured: 0,
      plSumInsured: 0,
      wcSumInsured: 0,
      piInsuranceExpiry: null,
      plInsuranceExpiry: null,
      wcInsuranceExpiry: null,
      delegateContactPersonOrganizationId: null,
      bankName: '',
      bankAccountNo: '',
      bankBsb: '',
    };

    await getManager().transaction(async (transactionalEntityManager) => {
      let obj = new Organization();

      obj.name = organizationData.name;
      obj.title = organizationData.title;
      obj.phoneNumber = organizationData.phoneNumber;
      obj.email = organizationData.email;
      obj.address = organizationData.address;
      obj.website = organizationData.website;
      obj.abn = organizationData.abn;
      obj.businessType = organizationData.businessType;
      obj.taxCode = organizationData.taxCode;
      obj.currentFinancialYearTotalForecast =
        organizationData.currentFinancialYearTotalForecast;
      obj.nextFinancialYearTotalForecast =
        organizationData.nextFinancialYearTotalForecast;
      obj.invoiceEmail = organizationData.invoiceEmail;
      obj.invoiceContactNumber = organizationData.invoiceContactNumber;
      obj.piInsurer = organizationData.piInsurer;
      obj.plInsurer = organizationData.plInsurer;
      obj.wcInsurer = organizationData.wcInsurer;
      obj.piSumInsured = organizationData.piSumInsured;
      obj.plSumInsured = organizationData.plSumInsured;
      obj.wcSumInsured = organizationData.wcSumInsured;
      obj.piPolicyNumber = organizationData.piPolicyNumber;
      obj.plPolicyNumber = organizationData.plPolicyNumber;
      obj.wcPolicyNumber = organizationData.wcPolicyNumber;
      // if (organizationData.piInsuranceExpiry)
      //   obj.piInsuranceExpiry = new Date(organizationData.piInsuranceExpiry);
      // if (organizationData.plInsuranceExpiry)
      //   obj.plInsuranceExpiry = new Date(organizationData.plInsuranceExpiry);
      // if (organizationData.wcInsuranceExpiry)
      //   obj.wcInsuranceExpiry = new Date(organizationData.wcInsuranceExpiry);
      // if (organizationData.parentOrganizationId)
      //   obj.parentOrganization = await getManager().findOne(
      //     Organization,
      //     organizationData.parentOrganizationId
      //   );
      obj = await transactionalEntityManager.save(obj);

      //Bank Account
      let { bankName, bankAccountNo, bankBsb } = organizationData;
      let bankAccount = new BankAccount();
      bankAccount.accountNo = bankAccountNo;
      bankAccount.bsb = bankBsb;
      bankAccount.name = bankName;
      bankAccount.organizationId = obj.id;
      await transactionalEntityManager.save(bankAccount);
      return obj.id;
    });

    return true;
  }
  return false;
};

let contactPersonSeeder = async () => {
  let contactPersonsCount = (await getManager().find(ContactPerson)).length;
  if (contactPersonsCount == 0) {
    let contactPersonData = {
      firstName: 'Mustafa',
      lastName: 'Syed',
      gender: Gender.MALE,
      dateOfBirth: null,
      phoneNumber: '',
      email: 'mustafa.syed@1lm.com.au',
      address: '',
      stateId: 1,
      clearanceLevel: ClearanceLevel.BASELINE_VETTING,
      clearanceGrantedDate: 1608512778651,
      clearanceExpiryDate: 1608512878651,
      clearanceSponsorId: 1,
      // standardSkillStandardLevelIds: [2],
      contactPersonOrganizations: [
        {
          startDate: new Date(),
          designation: 'Admin',
          organizationId: 1,
        },
      ],
    };

    await getManager().transaction(async (transactionalEntityManager) => {
      let contactPersonObj = new ContactPerson();
      contactPersonObj.firstName = contactPersonData.firstName;
      contactPersonObj.lastName = contactPersonData.lastName;
      contactPersonObj.email = contactPersonData.email;
      contactPersonObj.address = contactPersonData.address;
      contactPersonObj.gender = contactPersonData.gender;
      contactPersonObj.phoneNumber = contactPersonData.phoneNumber;
      // if (contactPersonData.dateOfBirth)
      //   contactPersonObj.dateOfBirth = new Date(contactPersonData.dateOfBirth);

      let state: State | undefined;
      if (contactPersonData.stateId) {
        state = await getManager().findOne(State, contactPersonData.stateId);
        if (!state) {
          throw new Error('State not found');
        }
        contactPersonObj.stateId = state.id;
      }

      if (
        contactPersonData.clearanceLevel &&
        contactPersonData.clearanceGrantedDate &&
        contactPersonData.clearanceExpiryDate
      ) {
        contactPersonObj.clearanceLevel = contactPersonData.clearanceLevel;
        contactPersonObj.clearanceGrantedDate = new Date(
          contactPersonData.clearanceGrantedDate
        );
        contactPersonObj.clearanceExpiryDate = new Date(
          contactPersonData.clearanceExpiryDate
        );
      }

      let clearanceSponsor: Organization | undefined;
      if (contactPersonData.clearanceSponsorId) {
        clearanceSponsor = await getManager().findOne(
          Organization,
          contactPersonData.clearanceSponsorId
        );
        if (!clearanceSponsor) {
          throw new Error('Clearance Sponsor not found');
        }
        contactPersonObj.clearanceSponsorId = clearanceSponsor.id;
      }

      // let standardSkillStandardLevelList =
      //   await transactionalEntityManager.findByIds(
      //     StandardSkillStandardLevel,
      //     contactPersonData.standardSkillStandardLevelIds
      //   );
      // console.log(
      //   'standardSkillStandardLevelList.length: ',
      //   standardSkillStandardLevelList.length
      // );
      // contactPersonObj.standardSkillStandardLevels =
      //   standardSkillStandardLevelList;
      contactPersonObj = await transactionalEntityManager.save(
        contactPersonObj
      );
      let contactPersonOrganizationPromises =
        contactPersonData.contactPersonOrganizations.map(
          async (contactPersonOrganization) => {
            let contactPersonOrganizationObj = new ContactPersonOrganization();
            contactPersonOrganizationObj.startDate = new Date(
              contactPersonOrganization.startDate
            );
            // if (contactPersonOrganization.endDate)
            //   contactPersonOrganizationObj.endDate = new Date(
            //     contactPersonOrganization.endDate
            //   );
            contactPersonOrganizationObj.designation =
              contactPersonOrganization.designation;
            let organization = await transactionalEntityManager.findOne(
              Organization,
              contactPersonOrganization.organizationId
            );
            if (!organization) {
              throw new Error('Organization not found!');
            }
            contactPersonOrganizationObj.organizationId = organization.id;
            contactPersonOrganizationObj.contactPersonId = contactPersonObj.id;
            return contactPersonOrganizationObj;
          }
        );
      let contactPersonOrganizations = await Promise.all(
        contactPersonOrganizationPromises
      );
      contactPersonOrganizations = await transactionalEntityManager.save(
        contactPersonOrganizations
      );
      return contactPersonObj.id;
    });
    return true;
  }
  return false;
};

let employeeSeeder = async () => {
  let employeesCount = (await getManager().find(Employee)).length;
  if (employeesCount == 0) {
    let employeeData = {
      contactPersonId: 1,
      firstName: 'Mustafa',
      lastName: 'Syed',
      username: 'mustafa.syed@1lm.com.au',
      gender: Gender.MALE,
      dateOfBirth: null,
      phoneNumber: '',
      email: 'mustafa.syed@1lm.com.au',
      address: '',
      stateId: 1,
      nextOfKinName: '',
      nextOfKinPhoneNumber: '',
      nextOfKinEmail: '',
      nextOfKinRelation: '',
      tfn: '',
      superannuationName: '',
      superannuationBankName: '',
      superannuationBankAccountOrMembershipNumber: '',
      superannuationAbnOrUsi: '',
      superannuationBankBsb: '',
      superannuationAddress: '',
      training: '',
      bankName: '',
      bankAccountNo: '',
      bankBsb: '',
      roleId: 1,
      latestEmploymentContract: {
        payslipEmail: 'mustafa.syed@1lm.com.au',
        payFrequency: 1,
        startDate: new Date(),
        endDate: null,
        type: 1,
        noOfHours: 8,
        noOfHoursPer: 2,
        remunerationAmount: 1200,
        remunerationAmountPer: 3,
        comments: '',
      },
    };

    await getManager().transaction(async (transactionalEntityManager) => {
      if (!employeeData.contactPersonId) {
        throw Error('Must provide contact person');
      }
      let contactPersonObj = await transactionalEntityManager.findOne(
        ContactPerson,
        employeeData.contactPersonId,
        { relations: ['contactPersonOrganizations'] }
      );
      if (!contactPersonObj) {
        throw Error('Must provide contact person');
      }

      // find contactpersonorganization id for oneLM

      let contactPersonOrganization =
        contactPersonObj.contactPersonOrganizations.filter(
          (x) => x.organizationId == 1
        )[0];
      if (!contactPersonOrganization) {
        throw Error('Not associated with oneLM');
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
      contactPersonObj.firstName = employeeData.firstName;
      contactPersonObj.lastName = employeeData.lastName;
      contactPersonObj.email = employeeData.email;
      contactPersonObj.address = employeeData.address;
      contactPersonObj.gender = employeeData.gender;
      contactPersonObj.phoneNumber = employeeData.phoneNumber;
      // if (employeeData.dateOfBirth && employeeData.dateOfBirth != null)
      //   contactPersonObj.dateOfBirth = new Date(employeeData.dateOfBirth);

      let state: State | undefined;
      if (employeeData.stateId) {
        state = await transactionalEntityManager.findOne(
          State,
          employeeData.stateId
        );
        if (!state) {
          throw new Error('State not found');
        }
      }
      await transactionalEntityManager.save(contactPersonObj);
      let employeeObj = new Employee();
      employeeObj.contactPersonOrganizationId = contactPersonOrganization.id;
      employeeObj.username = employeeData.username;
      // Math.random().toString(36).substring(4)
      employeeObj.password = bcrypt.hashSync('1234', bcrypt.genSaltSync(8));

      employeeObj.nextOfKinName = employeeData.nextOfKinName;
      employeeObj.nextOfKinPhoneNumber = employeeData.nextOfKinPhoneNumber;
      employeeObj.nextOfKinEmail = employeeData.nextOfKinEmail;
      employeeObj.nextOfKinRelation = employeeData.nextOfKinRelation;
      employeeObj.tfn = employeeData.tfn;
      // employeeObj.taxFreeThreshold = employeeData.taxFreeThreshold ? true : false;
      // employeeObj.helpHECS = employeeData.helpHECS ? true : false;
      employeeObj.superannuationName = employeeData.superannuationName;
      // if (employeeData.superannuationType) {
      //   employeeObj.superannuationType = employeeData.superannuationType;
      // }
      employeeObj.superannuationAbnOrUsi = employeeData.superannuationAbnOrUsi;
      employeeObj.superannuationAddress = employeeData.superannuationAddress;
      employeeObj.superannuationBankName = employeeData.superannuationBankName;
      employeeObj.superannuationBankBsb = employeeData.superannuationBankBsb;
      employeeObj.superannuationBankAccountOrMembershipNumber =
        employeeData.superannuationBankAccountOrMembershipNumber;
      employeeObj.training = employeeData.training;
      employeeObj.roleId = employeeData.roleId;
      employeeObj = await transactionalEntityManager.save(employeeObj);

      if (!employeeData.latestEmploymentContract) {
        throw Error('Must have contract info');
      }

      let employmentContract = new EmploymentContract();
      let {
        payslipEmail,
        comments,
        payFrequency,
        startDate,
        endDate,
        type,
        noOfHours,
        noOfHoursPer,
        remunerationAmount,
        remunerationAmountPer,
      } = employeeData.latestEmploymentContract;

      employmentContract.payslipEmail = payslipEmail;
      employmentContract.comments = comments;
      employmentContract.payFrequency = payFrequency;
      employmentContract.startDate = new Date(startDate);
      // if (endDate) {
      //   employmentContract.endDate = new Date(endDate);
      // }
      employmentContract.type = type;
      employmentContract.noOfHours = noOfHours;
      employmentContract.noOfHoursPer = noOfHoursPer;
      employmentContract.remunerationAmount = remunerationAmount;
      employmentContract.remunerationAmountPer = remunerationAmountPer;
      employmentContract.employeeId = employeeObj.id;
      await transactionalEntityManager.save(employmentContract);
      let { bankName, bankAccountNo, bankBsb } = employeeData;
      let bankAccount = new BankAccount();
      bankAccount.accountNo = bankAccountNo;
      bankAccount.bsb = bankBsb;
      bankAccount.name = bankName;
      bankAccount.employeeId = employeeObj.id;
      await transactionalEntityManager.save(bankAccount);

      return 1;
    });
    return true;
  }
  return false;
};

export default runSeeders = runSeeders;
