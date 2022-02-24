import bcrypt from 'bcryptjs';
import { sendMail } from '../utilities/mailer';
import {
  AddressDTO,
  ContactPersonDTO,
  EmployeeDTO,
  EmployeeSkillDTO,
  LeaseDTO,
  SettingsDTO,
  TrainingDTO,
} from '../dto';
import { EntityRepository, getRepository, Repository } from 'typeorm';
import { ContactPerson } from './../entities/contactPerson';
import { ContactPersonOrganization } from './../entities/contactPersonOrganization';
import { State } from './../entities/state';
import { StandardSkillStandardLevel } from './../entities/standardSkillStandardLevel';
import { Organization } from './../entities/organization';
import { Employee } from './../entities/employee';
import { EmploymentContract } from './../entities/employmentContract';
import { BankAccount } from './../entities/bankAccount';
import { PanelSkillStandardLevel } from './../entities/panelSkillStandardLevel';
import { Lease } from './../entities/lease';
import { SuperannuationType } from '../constants/constants';

@EntityRepository(Employee)
export class EmployeeRepository extends Repository<Employee> {
  async createAndSave(employeeDTO: EmployeeDTO): Promise<any> {
    let id: number;
    let generatedPassword = Math.random().toString(36).substring(4);
    id = await this.manager.transaction(async (transactionalEntityManager) => {
      if (!employeeDTO.contactPersonId) {
        throw Error('Must provide contact person');
      }
      let contactPersonObj = await transactionalEntityManager.findOne(
        ContactPerson,
        employeeDTO.contactPersonId,
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
      contactPersonObj.firstName = employeeDTO.firstName;
      contactPersonObj.lastName = employeeDTO.lastName;
      contactPersonObj.email = employeeDTO.email;
      contactPersonObj.address = employeeDTO.address;
      contactPersonObj.gender = employeeDTO.gender;
      contactPersonObj.phoneNumber = employeeDTO.phoneNumber;
      if (employeeDTO.dateOfBirth)
        contactPersonObj.dateOfBirth = new Date(employeeDTO.dateOfBirth);

      let state: State | undefined;
      if (employeeDTO.stateId) {
        state = await transactionalEntityManager.findOne(
          State,
          employeeDTO.stateId
        );
        if (!state) {
          throw new Error('State not found');
        }
      }
      await transactionalEntityManager.save(contactPersonObj);
      let employeeObj = new Employee();
      employeeObj.contactPersonOrganizationId = contactPersonOrganization.id;
      employeeObj.username = employeeDTO.username;
      // Math.random().toString(36).substring(4)
      employeeObj.password = bcrypt.hashSync(
        generatedPassword,
        bcrypt.genSaltSync(8)
      );
      console.log(generatedPassword);

      employeeObj.nextOfKinName = employeeDTO.nextOfKinName;
      employeeObj.nextOfKinPhoneNumber = employeeDTO.nextOfKinPhoneNumber;
      employeeObj.nextOfKinEmail = employeeDTO.nextOfKinEmail;
      employeeObj.nextOfKinRelation = employeeDTO.nextOfKinRelation;
      employeeObj.tfn = employeeDTO.tfn;
      employeeObj.taxFreeThreshold = employeeDTO.taxFreeThreshold
        ? true
        : false;
      employeeObj.helpHECS = employeeDTO.helpHECS ? true : false;
      employeeObj.superannuationName = employeeDTO.superannuationName;
      if (employeeDTO.superannuationType) {
        employeeObj.superannuationType =
          employeeDTO.superannuationType == 'P'
            ? SuperannuationType.PUBLIC
            : employeeDTO.superannuationType == 'S'
            ? SuperannuationType.SMSF
            : null;
      } else {
        employeeObj.superannuationType = null;
      }
      employeeObj.superannuationAbnOrUsi = employeeDTO.superannuationAbnOrUsi;
      employeeObj.superannuationAddress = employeeDTO.superannuationAddress;
      employeeObj.superannuationBankName = employeeDTO.superannuationBankName;
      employeeObj.superannuationBankBsb = employeeDTO.superannuationBankBsb;
      employeeObj.superannuationBankAccountOrMembershipNumber =
        employeeDTO.superannuationBankAccountOrMembershipNumber;
      employeeObj.training = employeeDTO.training;
      employeeObj.roleId = employeeDTO.roleId;

      if (employeeDTO.lineManagerId) {
        let resEmployee = await transactionalEntityManager.findOne(
          Employee,
          employeeDTO.lineManagerId
        );
        if (!resEmployee) {
          throw new Error('Line Manager not found');
        }

        employeeObj.lineManagerId = employeeDTO.lineManagerId;
      } else {
        employeeObj.lineManagerId = null;
      }
      employeeObj = await transactionalEntityManager.save(employeeObj);
      id = employeeObj.id;

      if (!employeeDTO.latestEmploymentContract) {
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
        leaveRequestPolicyId,
        fileId,
      } = employeeDTO.latestEmploymentContract;

      employmentContract.payslipEmail = payslipEmail;
      employmentContract.comments = comments;
      employmentContract.payFrequency = payFrequency;
      employmentContract.startDate = new Date(startDate);
      if (endDate) {
        employmentContract.endDate = new Date(endDate);
      }
      employmentContract.type = type;
      employmentContract.noOfHours = noOfHours;
      employmentContract.noOfHoursPer = noOfHoursPer;
      employmentContract.remunerationAmount = remunerationAmount;
      employmentContract.remunerationAmountPer = remunerationAmountPer;
      employmentContract.employeeId = employeeObj.id;
      employmentContract.leaveRequestPolicyId = leaveRequestPolicyId;
      employmentContract.fileId = fileId;
      await transactionalEntityManager.save(employmentContract);
      let { bankName, bankAccountNo, bankBsb } = employeeDTO;
      let bankAccount = new BankAccount();
      bankAccount.accountNo = bankAccountNo;
      bankAccount.bsb = bankBsb;
      bankAccount.name = bankName;
      bankAccount.employeeId = employeeObj.id;
      await transactionalEntityManager.save(bankAccount);
      return employeeObj.id;
    });
    let responseEmployee = await this.findOneCustom(id);
    let user = {
      username:
        responseEmployee.contactPersonOrganization.contactPerson.firstName,
      email: responseEmployee.username,
    };
    try {
      sendMail(
        'crm.onelm.com',
        user,
        'Account Password',
        `You registered account password is ${generatedPassword}`
      );
    } catch (e) {
      console.log(e);
    }

    return responseEmployee;
  }

  async getAllActive(): Promise<any[]> {
    let result = await this.find({
      relations: [
        'contactPersonOrganization',
        'contactPersonOrganization.contactPerson',
        'contactPersonOrganization.organization',
        'bankAccounts',
        'employmentContracts',
        'employmentContracts.file',
      ],
    });

    return result.filter(
      (x) => x.contactPersonOrganization.organizationId == 1
    );
  }

  async getAllContactPersons(): Promise<any[]> {
    // return getRepository(ContactPerson)
    // .createQueryBuilder("contactPerson")
    // .innerJoinAndSelect("contactPerson.contactPersonOrganizations", "contactPersonOrganization", "contactPersonOrganization.organization.id = 1")
    // .leftJoinAndSelect("contactPersonOrganization.employee", "employee", "employee.contactPersonOrganization.id = contactPersonOrganization.id")
    // .leftJoinAndSelect(qb => qb.subQuery().select("e.*, MAX(e.startDate)", "max_date").from(EmploymentContract, "e").groupBy("e.employee.id"), "employmentContract", "employmentContract.employee_id = employee.id")
    // .printSql().getRawMany();

    let all = await getRepository(ContactPerson).find({
      relations: [
        'contactPersonOrganizations',
        'contactPersonOrganizations.employee',
      ],
    });

    let onlyContactPersons: any = [];
    all.forEach((person) => {
      person.contactPersonOrganizations.forEach((org) => {
        // if (org.organizationId === 1 && org.status === true) { //! FUTURE IMPLEMENTATION
        if (org.organizationId === 1) {
          console.log('this ran', person);
          if (org.employee === null) {
            onlyContactPersons.push(person);
          }
        }
      });
    });

    return onlyContactPersons;

    // return getRepository(ContactPerson)
    //   .createQueryBuilder('contactPerson')
    //   .innerJoinAndSelect(
    //     'contactPerson.contactPersonOrganizations',
    //     'contactPersonOrganization',
    //     'contactPersonOrganization.organization.id = 1'
    //   )
    //   .leftJoinAndSelect(
    //     'contactPersonOrganization.employee',
    //     'employee',
    //     'employee.contactPersonOrganization.id = contactPersonOrganization.id'
    //   )
    //   .leftJoinAndSelect(
    //     'employee.employmentContracts',
    //     'employmentContract',
    //     'employmentContract.employee.id = employee.id'
    //   )
    //   .getMany();
  }

  async updateAndReturn(
    id: number,
    employeeDTO: EmployeeDTO
  ): Promise<any | undefined> {
    await this.manager.transaction(async (transactionalEntityManager) => {
      let employeeObj = await this.findOneCustom(id);
      if (!employeeObj) {
        throw Error('Employee not found');
      }
      let contactPersonObj = await transactionalEntityManager.findOne(
        ContactPerson,
        employeeObj.contactPersonOrganization.contactPerson.id
      );
      if (!contactPersonObj) {
        throw Error('Employee not found');
      }

      contactPersonObj.firstName = employeeDTO.firstName;
      contactPersonObj.lastName = employeeDTO.lastName;
      contactPersonObj.email = employeeDTO.email;
      contactPersonObj.address = employeeDTO.address;
      contactPersonObj.gender = employeeDTO.gender;
      contactPersonObj.phoneNumber = employeeDTO.phoneNumber;
      if (employeeDTO.dateOfBirth)
        contactPersonObj.dateOfBirth = new Date(employeeDTO.dateOfBirth);

      let state: State | undefined;
      if (employeeDTO.stateId) {
        state = await transactionalEntityManager.findOne(
          State,
          employeeDTO.stateId
        );
        if (!state) {
          throw new Error('State not found');
        }
        contactPersonObj.state = state;
      }
      await transactionalEntityManager.save(contactPersonObj);
      employeeObj.username = employeeDTO.username;
      employeeObj.nextOfKinName = employeeDTO.nextOfKinName;
      employeeObj.nextOfKinPhoneNumber = employeeDTO.nextOfKinPhoneNumber;
      employeeObj.nextOfKinEmail = employeeDTO.nextOfKinEmail;
      employeeObj.nextOfKinRelation = employeeDTO.nextOfKinRelation;
      employeeObj.tfn = employeeDTO.tfn;
      employeeObj.taxFreeThreshold = employeeDTO.taxFreeThreshold;
      employeeObj.helpHECS = employeeDTO.helpHECS;
      employeeObj.superannuationName = employeeDTO.superannuationName;
      if (employeeDTO.superannuationType) {
        employeeObj.superannuationType =
          employeeDTO.superannuationType == 'P'
            ? SuperannuationType.PUBLIC
            : employeeDTO.superannuationType == 'S'
            ? SuperannuationType.SMSF
            : null;
      } else {
        employeeObj.superannuationType = null;
      }
      employeeObj.superannuationAbnOrUsi = employeeDTO.superannuationAbnOrUsi;
      employeeObj.superannuationAddress = employeeDTO.superannuationAddress;
      employeeObj.superannuationBankName = employeeDTO.superannuationBankName;
      employeeObj.superannuationBankBsb = employeeDTO.superannuationBankBsb;
      employeeObj.superannuationBankAccountOrMembershipNumber =
        employeeDTO.superannuationBankAccountOrMembershipNumber;
      employeeObj.training = employeeDTO.training;
      employeeObj.roleId = employeeDTO.roleId;

      if (employeeDTO.lineManagerId) {
        let linerManager = await transactionalEntityManager.findOne(
          Employee,
          employeeDTO.lineManagerId
        );
        if (!linerManager) {
          throw Error('Line Manager not found');
        }
      }
      employeeObj.lineManagerId = employeeDTO.lineManagerId;
      employeeObj = await transactionalEntityManager.save(employeeObj);

      if (!employeeDTO.latestEmploymentContract) {
        throw Error('Must have contract info');
      }

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
        leaveRequestPolicyId,
        fileId,
      } = employeeDTO.latestEmploymentContract;

      // find latest contract here
      let employmentContract = await transactionalEntityManager
        .getRepository(EmploymentContract)
        .createQueryBuilder('employmentContract')
        .where((qb) => {
          return (
            'start_date = ' +
            qb
              .subQuery()
              .select('Max(start_date)')
              .from('employment_contracts', 'e')
              .where('employee_id = ' + employeeObj.id)
              .getSql()
          );
        })
        .andWhere('employee_id = ' + employeeObj.id)
        .getOne();
      console.log('employmentContract: ', employmentContract);

      if (!employmentContract) {
        throw Error('Contract Not found');
      }
      employmentContract.payslipEmail = payslipEmail;
      employmentContract.comments = comments;
      employmentContract.payFrequency = payFrequency;
      employmentContract.startDate = new Date(startDate);
      if (endDate) {
        employmentContract.endDate = new Date(endDate);
      }
      employmentContract.type = type;
      employmentContract.noOfHours = noOfHours;
      employmentContract.noOfHoursPer = noOfHoursPer;
      employmentContract.remunerationAmount = remunerationAmount;
      employmentContract.remunerationAmountPer = remunerationAmountPer;
      employmentContract.employeeId = employeeObj.id;
      employmentContract.leaveRequestPolicyId = leaveRequestPolicyId;
      employmentContract.fileId = fileId;
      await transactionalEntityManager.save(employmentContract);
      let { bankName, bankAccountNo, bankBsb } = employeeDTO;
      let bankAccount = await transactionalEntityManager
        .getRepository(BankAccount)
        .findOne({
          where: {
            employee: {
              id: employeeObj.id,
            },
          },
        });
      if (!bankAccount) {
        throw Error('Bank Account not found');
      }

      bankAccount.accountNo = bankAccountNo;
      bankAccount.bsb = bankBsb;
      bankAccount.name = bankName;
      bankAccount.employeeId = employeeObj.id;
      await transactionalEntityManager.save(bankAccount);
      return employeeObj.id;
    });
    return this.findOneCustom(id);
  }

  async findOneCustom(id: number): Promise<any | undefined> {
    return this.findOne(id, {
      relations: [
        'contactPersonOrganization',
        'contactPersonOrganization.contactPerson',
        'contactPersonOrganization.organization',
        'bankAccounts',
        'employmentContracts',
        'employmentContracts.file',
      ],
    });
  }

  async deleteCustom(id: number): Promise<any | undefined> {
    return this.softDelete(id);
  }

  // async getEmployeesBySkill(panelSkillStandardLevelId: number): Promise<any[]> {
  //   let panelSkillStandardLevels = await this.manager.find(
  //     PanelSkillStandardLevel,
  //     {
  //       where: {
  //         id: panelSkillStandardLevelId,
  //       },
  //       relations: ['panelSkill'],
  //     }
  //   );

  //   if (!panelSkillStandardLevels.length) {
  //     throw new Error('panelSkillStandardLevel not found');
  //   }
  //   let standardSkillId =
  //     panelSkillStandardLevels[0].panelSkill.standardSkillId;
  //   let standardLevelId = panelSkillStandardLevels[0].standardLevelId;

  //   let standardSkillStandardLevels = await this.manager.find(
  //     StandardSkillStandardLevel,
  //     {
  //       where: {
  //         standardSkillId: standardSkillId,
  //         standardLevelId: standardLevelId,
  //       },
  //     }
  //   );

  //   console.log(standardSkillStandardLevels);

  //   if (!standardSkillStandardLevels.length) {
  //     throw new Error('standardSkillStandardLevel not found');
  //   }
  //   let standardSkillStandardLevelPriority =
  //     standardSkillStandardLevels[0].priority;

  //   let employees = await getRepository(Employee)
  //     .createQueryBuilder('employee')
  //     .innerJoin(
  //       'employee.contactPersonOrganization',
  //       'contactPersonOrganization',
  //       'contactPersonOrganization.id = employee.contactPersonOrganization.id'
  //     )
  //     .innerJoin(
  //       'contactPersonOrganization.contactPerson',
  //       'contactPerson',
  //       'contactPerson.id = contactPersonOrganization.contactPerson.id'
  //     )
  //     .innerJoin(
  //       'contactPerson.standardSkillStandardLevels',
  //       'standardSkillStandardLevel',
  //       'standardSkillStandardLevel.contactPersons.id = contactPerson.id'
  //     )
  //     .getMany();

  //   console.log('employees: ', employees);
  //   return employees;
  // }

  async getAllLeases(employeeId: number) {
    // valid if employee id exists
    if (!employeeId) {
      throw new Error('Employee not found!');
    }

    // fetch employee
    let employee = await this.findOne(employeeId, {
      relations: ['leases'],
    });

    // valid if employee found
    if (!employee) {
      throw new Error('Employee not found!');
    }

    return employee.leases;
  }

  async addLease(employeeId: number, leaseDTO: LeaseDTO) {
    // valid if employee id exists
    if (!employeeId) {
      throw new Error('Employee not found!');
    }

    // fetch employee
    let employee = await this.findOne(employeeId, {
      relations: ['leases'],
    });

    // valid if employee found
    if (!employee) {
      throw new Error('Employee not found!');
    }

    let lease = new Lease();
    lease.companyName = leaseDTO.companyName;
    lease.vehicleRegistrationNo = leaseDTO.vehicleRegistrationNo;
    lease.vehicleMakeModel = leaseDTO.vehicleMakeModel;
    if (leaseDTO.startDate) {
      lease.startDate = new Date(leaseDTO.startDate);
    }
    if (leaseDTO.endDate) {
      lease.endDate = new Date(leaseDTO.endDate);
    }
    lease.financedAmount = leaseDTO.financedAmount;
    lease.installmentFrequency = leaseDTO.installmentFrequency;
    lease.preTaxDeductionAmount = leaseDTO.preTaxDeductionAmount;
    lease.postTaxDeductionAmount = leaseDTO.postTaxDeductionAmount;
    lease.financerName = leaseDTO.financerName;
    lease.employeeId = employeeId;
    return this.manager.save(lease);
  }

  async updateLease(employeeId: number, id: number, leaseDTO: LeaseDTO) {
    // valid if employee id exists
    if (!employeeId) {
      throw new Error('Employee not found!');
    }

    // fetch employee
    let employee = await this.findOne(employeeId, {
      relations: ['leases'],
    });

    // valid if employee found
    if (!employee) {
      throw new Error('Employee not found!');
    }

    let lease = employee.leases.filter((x) => x.id == id)[0];

    // validate if lease found
    if (!lease) {
      throw new Error('Lease not found!');
    }

    lease.companyName = leaseDTO.companyName;
    lease.vehicleRegistrationNo = leaseDTO.vehicleRegistrationNo;
    lease.vehicleMakeModel = leaseDTO.vehicleMakeModel;
    if (leaseDTO.startDate) {
      lease.startDate = new Date(leaseDTO.startDate);
    }
    if (leaseDTO.endDate) {
      lease.endDate = new Date(leaseDTO.endDate);
    }
    lease.financedAmount = leaseDTO.financedAmount;
    lease.installmentFrequency = leaseDTO.installmentFrequency;
    lease.preTaxDeductionAmount = leaseDTO.preTaxDeductionAmount;
    lease.postTaxDeductionAmount = leaseDTO.postTaxDeductionAmount;
    lease.financerName = leaseDTO.financerName;
    lease.employeeId = employeeId;
    return this.manager.save(lease);
  }

  async findOneCustomLease(
    employeeId: number,
    id: number
  ): Promise<any | undefined> {
    // valid if employee id exists
    if (!employeeId) {
      throw new Error('Employee not found!');
    }

    // fetch employee
    let employee = await this.findOne(employeeId, {
      relations: ['leases'],
    });

    // valid if employee found
    if (!employee) {
      throw new Error('Employee not found!');
    }

    let lease = employee.leases.filter((x) => x.id == id)[0];

    // validate if lease found
    if (!lease) {
      throw new Error('Lease not found!');
    }

    return lease;
  }

  async deleteLease(employeeId: number, id: number): Promise<any | undefined> {
    // valid if employee id exists
    if (!employeeId) {
      throw new Error('Employee not found!');
    }

    // fetch employee
    let employee = await this.findOne(employeeId, {
      relations: ['leases'],
    });

    // valid if employee found
    if (!employee) {
      throw new Error('Employee not found!');
    }

    employee.leases = employee.leases.filter((x) => x.id != id);
    return this.manager.save(employee);
  }

  async getEmployeesBySkill(panelSkillStandardLevelId: number): Promise<any[]> {
    let panelSkillStandardLevels = await this.manager.find(
      PanelSkillStandardLevel,
      {
        where: {
          id: panelSkillStandardLevelId,
        },
        relations: ['panelSkill'],
      }
    );

    if (!panelSkillStandardLevels.length) {
      throw new Error('panelSkillStandardLevel not found');
    }
    let standardSkillId =
      panelSkillStandardLevels[0].panelSkill.standardSkillId;
    let standardLevelId = panelSkillStandardLevels[0].standardLevelId;

    let standardSkillStandardLevels = await this.manager.find(
      StandardSkillStandardLevel,
      {
        where: {
          standardSkillId: standardSkillId,
          standardLevelId: standardLevelId,
        },
      }
    );

    console.log(standardSkillStandardLevels);

    if (!standardSkillStandardLevels.length) {
      throw new Error('standardSkillStandardLevel not found');
    }
    let skillPriority = standardSkillStandardLevels[0].priority;

    let contactPersons = await getRepository(ContactPerson)
      .createQueryBuilder('contactPerson')
      .leftJoinAndSelect(
        'contactPerson.contactPersonOrganizations',
        'contactPersonOrganization',
        'contactPersonOrganization.contactPersonId = contactPerson.id'
      )
      .innerJoinAndSelect(
        'contactPerson.standardSkillStandardLevels',
        'standardSkillStandardLevel',
        'standardSkillStandardLevel.standardSkillId = :standardSkillId',
        { standardSkillId }
      )
      .where('standardSkillStandardLevel.priority >= :skillPriority', {
        skillPriority,
      })
      .getMany();

    let filtered: any = [];

    contactPersons.forEach((cp) => {
      let Obj: any = {};
      let cpRole: string = '(Contact Person)';
      if (cp.contactPersonOrganizations.length > 0) {
        //TODO: FILTER CONTACTPERSON AND EMPLOYEE BASED ON API
        let contactPersonActiveAssociation =
          cp.contactPersonOrganizations.filter((org) => org.status == true)[0];
        //? ONLY EMPLOYEES ARE BEING FILTERED DOWN
        if (contactPersonActiveAssociation) {
          cpRole =
            contactPersonActiveAssociation.organizationId == 1
              ? '(Employee)'
              : cp.contactPersonOrganizations.filter(
                  (org) => org.status == true
                )[0].organizationId != 1
              ? '(Sub Contractor)'
              : '(Contact Person)';

          Obj.value = cp.id;
          Obj.label = `${cp.firstName} ${cp.lastName} ${cpRole}`;

          filtered.push(Obj);
        }
      }
    });
    console.log('employees: ', contactPersons);
    return filtered;
  }

  async helperGetAllContactPersons(
    isAssociated: number,
    organization: number,
    status: number,
    getEmployeeID: number,
    showLabel: number
  ): Promise<any | undefined> {
    let all = await getRepository(ContactPerson).find({
      relations: [
        'contactPersonOrganizations',
        'contactPersonOrganizations.employee',
      ],
    });

    let filtered: any[] = [];

    all.forEach((cp: ContactPerson | any) => {
      let cpRole = 'Contact Person';
      let cpEmployeeID: number | string = '-';
      let flag_found = 0;
      if (
        (isAssociated == 1 || isNaN(isAssociated)) &&
        cp.contactPersonOrganizations.length > 0
      ) {
        cp.contactPersonOrganizations.forEach(
          (org: ContactPersonOrganization | any) => {
            if (flag_found != 1) {
              if (!isNaN(organization) && !isNaN(status) && flag_found != 1) {
                if (
                  org.organizationId === organization &&
                  (org.status === Boolean(status) ||
                    (org.employee != null && status == 1))
                ) {
                  flag_found = 1;
                }
              } else if (!isNaN(organization) && flag_found != 1) {
                if (org.organizationId === organization) {
                  flag_found = 1;
                }
              } else if (!isNaN(status) && flag_found != 1) {
                if (
                  org.status === Boolean(status) ||
                  (org.employee != null && status == 1)
                ) {
                  flag_found = 1;
                }
              } else if (flag_found != 1) {
                flag_found = 1;
              }

              if (
                org.organizationId == 1 &&
                flag_found == 1 &&
                (org.employee != null || org.status == 1)
              ) {
                cpRole = 'Employee';
              } else if (
                org.organizationId != 1 &&
                flag_found == 1 &&
                (org.employee != null || org.status == 1)
              ) {
                cpRole = 'Sub Contractor';
              }

              if (org.status == 1 && flag_found == 1) {
                cpEmployeeID = org.employee.id;
              }
            }
          }
        );
      } else if (
        (isAssociated == 0 || isNaN(isAssociated)) &&
        cp.contactPersonOrganizations.length == 0
      ) {
        flag_found = 1;
      }

      if (flag_found === 1) {
        let Obj: any = {};
        Obj.label = `${cp.firstName} ${cp.lastName}${
          showLabel == 1 ? `-(${cpRole})` : ''
        }`;
        if (getEmployeeID == 1) {
          Obj.value = cpEmployeeID;
        } else {
          Obj.value = cp.id;
        }
        // cp.role = cpRole;
        filtered.push(Obj);
      }
    });

    return filtered;
  }

  async authUpdateSettings(authId: number, settingsDTO: SettingsDTO) {
    if (!authId) {
      throw new Error('Employee not found!');
    }

    let employee = await this.findOne(authId, { relations: ['bankAccounts'] });

    if (!employee) {
      throw new Error('Employee not found!');
    }

    employee.nextOfKinName = settingsDTO.nextOfKinName;
    employee.nextOfKinPhoneNumber = settingsDTO.nextOfKinPhoneNumber;
    employee.nextOfKinEmail = settingsDTO.nextOfKinEmail;
    employee.nextOfKinRelation = settingsDTO.nextOfKinRelation;
    employee.tfn = settingsDTO.tfn;
    employee.taxFreeThreshold = settingsDTO.taxFreeThreshold ?? false;
    employee.helpHECS = settingsDTO.helpHECS ?? false;
    employee.superannuationName = settingsDTO.superannuationName;
    employee.superannuationType =
      settingsDTO.superannuationType == 'P'
        ? SuperannuationType.PUBLIC
        : settingsDTO.superannuationType == 'S'
        ? SuperannuationType.SMSF
        : null;
    employee.superannuationBankName = settingsDTO.superannuationBankName;
    employee.superannuationBankAccountOrMembershipNumber =
      settingsDTO.superannuationBankAccountOrMembershipNumber;
    employee.superannuationAbnOrUsi = settingsDTO.superannuationAbnOrUsi;
    employee.superannuationBankBsb = settingsDTO.superannuationBankBsb;
    employee.superannuationAddress = settingsDTO.superannuationAddress;
    employee.training = settingsDTO.training;

    let bankAccount = employee.bankAccounts[0];
    bankAccount.accountNo = settingsDTO.bankAccountNo;
    bankAccount.name = settingsDTO.bankName;
    bankAccount.bsb = settingsDTO.bankBsb;

    employee.bankAccounts[0] = bankAccount;

    this.save(employee);

    return employee;
  }

  async authUpdateAddress(authId: number, addressDTO: AddressDTO) {
    if (!authId) {
      throw new Error('Employee not found!');
    }

    let employee = await this.findOne(authId, {
      relations: [
        'contactPersonOrganization',
        'contactPersonOrganization.contactPerson',
      ],
    });

    if (!employee) {
      throw new Error('Employee not found!');
    }

    employee.contactPersonOrganization.contactPerson.address =
      addressDTO.address;

    this.manager.save(
      ContactPerson,
      employee.contactPersonOrganization.contactPerson
    );

    return employee;
  }

  async authUpdateTraining(authId: number, trainingDTO: TrainingDTO) {
    if (!authId) {
      throw new Error('Employee not found!');
    }

    let employee = await this.findOne(authId, {});

    if (!employee) {
      throw new Error('Employee not found!');
    }

    employee.training = trainingDTO.training;

    this.save(employee);

    return employee;
  }

  async authGetUserUsers(authId: number) {
    if (!authId) {
      throw new Error('Employee not found!');
    }

    let employees = await this.find({
      relations: [
        'contactPersonOrganization',
        'contactPersonOrganization.contactPerson',
      ],
      where: { lineManagerId: authId },
    });

    let response: any = [];

    employees.forEach((employee) => {
      response.push({ label: employee.getFullName, value: employee.id });
    });

    return response;
  }

  async authAddSkill(authId: number, employeeSkillsDTO: EmployeeSkillDTO) {
    if (!authId) {
      throw new Error('Employee not found!');
    }

    let employee = await this.findOne(authId, {
      relations: [
        'contactPersonOrganization',
        'contactPersonOrganization.contactPerson',
        'contactPersonOrganization.contactPerson.standardSkillStandardLevels',
      ],
    });

    if (!employee) {
      throw new Error('Employee not found!');
    }

    if (employeeSkillsDTO.standardSkillStandardLevelIds.length <= 0) {
      throw new Error('Skills not found');
    }

    let standardSkillStandardLevelList = await this.manager.findByIds(
      StandardSkillStandardLevel,
      employeeSkillsDTO.standardSkillStandardLevelIds
    );

    let employeeContactPerson =
      employee.contactPersonOrganization.contactPerson;

    employeeContactPerson.standardSkillStandardLevels.push(
      ...standardSkillStandardLevelList
    );

    // employeeContactPerson.standardSkillStandardLevels = [
    //   ...new Set(employeeContactPerson.standardSkillStandardLevels),
    // ];

    await this.manager.save(ContactPerson, employeeContactPerson);

    let contactPerson = await this.manager.findOne(
      ContactPerson,
      employeeContactPerson.id,
      {
        relations: ['standardSkillStandardLevels'],
      }
    );

    if (!contactPerson) {
      throw new Error('Contact Person not found');
    }

    return contactPerson.standardSkillStandardLevels;
  }
}
