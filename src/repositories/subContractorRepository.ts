import bcrypt from 'bcryptjs';
import { sendMail } from '../utilities/mailer';
import { ContactPersonDTO, EmployeeDTO, SubContractorDTO } from '../dto';
import { EntityRepository, getRepository, Not, Repository } from 'typeorm';
import { ContactPerson } from './../entities/contactPerson';
import { ContactPersonOrganization } from './../entities/contactPersonOrganization';
import { State } from './../entities/state';
import { StandardSkillStandardLevel } from './../entities/standardSkillStandardLevel';
import { Organization } from './../entities/organization';
import { Employee } from './../entities/employee';
import { EmploymentContract } from './../entities/employmentContract';
import { BankAccount } from './../entities/bankAccount';
import { Attachment } from '../entities/attachment';
import { Comment } from '../entities/comment';
import { EntityType } from '../constants/constants';
import { OpportunityResourceAllocation } from '../entities/opportunityResourceAllocation';
import { Opportunity } from '../entities/opportunity';
import { GlobalVariableLabel } from '../entities/globalVariableLabel';
import { CalendarHoliday } from '../entities/calendarHoliday';

import moment from 'moment';

@EntityRepository(Employee)
export class SubContractorRepository extends Repository<Employee> {
  async createAndSave(subContractor: SubContractorDTO): Promise<any> {
    let id: number;
    let generatedPassword = Math.random().toString(36).substring(4);
    id = await this.manager.transaction(async (transactionalEntityManager) => {
      if (!subContractor.organizationId) {
        throw new Error('Must provide organization');
      }
      let organizationObj = await transactionalEntityManager.findOne(
        Organization,
        subContractor.organizationId
      );
      if (!organizationObj) {
        throw new Error('Must provide organization');
      }

      if (!subContractor.contactPersonId) {
        throw new Error('Must provide contact person');
      }
      let contactPersonObj = await transactionalEntityManager.findOne(
        ContactPerson,
        subContractor.contactPersonId,
        { relations: ['contactPersonOrganizations'] }
      );
      if (!contactPersonObj) {
        throw new Error('Must provide contact person');
      }

      // find contactpersonorganization id for oneLM
      let contactPersonOrganization =
        contactPersonObj.contactPersonOrganizations.filter(
          (x) => x.organizationId == subContractor.organizationId
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
      contactPersonObj.firstName = subContractor.firstName;
      contactPersonObj.lastName = subContractor.lastName;
      contactPersonObj.email = subContractor.email;
      contactPersonObj.address = subContractor.address;
      contactPersonObj.gender = subContractor.gender;
      contactPersonObj.phoneNumber = subContractor.phoneNumber;
      if (subContractor.dateOfBirth)
        contactPersonObj.dateOfBirth = new Date(subContractor.dateOfBirth);

      let state: State | undefined;
      if (subContractor.stateId) {
        state = await transactionalEntityManager.findOne(
          State,
          subContractor.stateId
        );
        if (!state) {
          throw new Error('State not found');
        }
        contactPersonObj.state = state;
      }
      await transactionalEntityManager.save(contactPersonObj);
      let employeeObj = new Employee();
      employeeObj.contactPersonOrganizationId = contactPersonOrganization.id;
      employeeObj.username = subContractor.username;
      employeeObj.password = bcrypt.hashSync(
        generatedPassword,
        bcrypt.genSaltSync(8)
      );

      employeeObj.nextOfKinName = subContractor.nextOfKinName;
      employeeObj.nextOfKinPhoneNumber = subContractor.nextOfKinPhoneNumber;
      employeeObj.nextOfKinEmail = subContractor.nextOfKinEmail;
      employeeObj.nextOfKinRelation = subContractor.nextOfKinRelation;
      employeeObj.roleId = subContractor.roleId;

      if (subContractor.lineManagerId) {
        let lineManager = await transactionalEntityManager.findOne(
          Employee,
          subContractor.lineManagerId
        );
        if (!lineManager) {
          throw new Error('Line Manager not found');
        }
      }

      employeeObj.lineManagerId = subContractor.lineManagerId;
      employeeObj = await transactionalEntityManager.save(employeeObj);
      id = employeeObj.id;

      if (!subContractor.latestContract) {
        throw new Error('Must have contract info');
      }

      let employmentContract = new EmploymentContract();
      let {
        startDate,
        endDate,
        remunerationAmount,
        remunerationAmountPer,
        comments,
        noOfHours,
        noOfDays,
        fileId,
      } = subContractor.latestContract;

      employmentContract.startDate = new Date(startDate);
      if (endDate) {
        employmentContract.endDate = new Date(endDate);
      }
      employmentContract.comments = comments;
      employmentContract.noOfHours = noOfHours;
      employmentContract.noOfDays = noOfDays;
      employmentContract.remunerationAmount = remunerationAmount;
      employmentContract.remunerationAmountPer = remunerationAmountPer;
      employmentContract.employeeId = employeeObj.id;
      employmentContract.fileId = fileId;
      await transactionalEntityManager.save(employmentContract);
      return employeeObj.id;
    });
    let responseSubContractor = await this.findOneCustom(id);
    let user = {
      username:
        responseSubContractor.contactPersonOrganization.contactPerson.firstName,
      email: responseSubContractor.username,
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
  }

  async getAllActive(): Promise<any[]> {
    let result = await this.find({
      relations: [
        'contactPersonOrganization',
        'contactPersonOrganization.contactPerson',
        'contactPersonOrganization.organization',
        'employmentContracts',
        'employmentContracts.file',
      ],
    });
    return result.filter(
      (x) => x.contactPersonOrganization.organizationId != 1
    );
  }

  async getAllContactPersons(organizationId: number): Promise<any[]> {
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
        // if (org.organizationId === organizationId && org.status == true) { //! FUTURE IMPLEMENTATION
        if (org.organizationId === organizationId) {
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
    //     'contactPersonOrganization.organization.id = ' + organizationId
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
    subContractor: SubContractorDTO
  ): Promise<any | undefined> {
    await this.manager.transaction(async (transactionalEntityManager) => {
      let subContractorObj = await this.findOneCustom(id);
      console.log('subContractorObj: ', subContractorObj);

      if (!subContractorObj) {
        throw new Error('Sub Contractor not found');
      }
      let contactPersonObj = await transactionalEntityManager.findOne(
        ContactPerson,
        subContractorObj.contactPersonOrganization.contactPerson.id
      );
      if (!contactPersonObj) {
        throw new Error('Sub Contractor not found');
      }

      contactPersonObj.firstName = subContractor.firstName;
      contactPersonObj.lastName = subContractor.lastName;
      contactPersonObj.email = subContractor.email;
      contactPersonObj.address = subContractor.address;
      contactPersonObj.gender = subContractor.gender;
      contactPersonObj.phoneNumber = subContractor.phoneNumber;
      if (subContractor.dateOfBirth)
        contactPersonObj.dateOfBirth = new Date(subContractor.dateOfBirth);

      let state: State | undefined;
      if (subContractor.stateId) {
        state = await transactionalEntityManager.findOne(
          State,
          subContractor.stateId
        );
        if (!state) {
          throw new Error('State not found');
        }
        contactPersonObj.state = state;
      }
      await transactionalEntityManager.save(contactPersonObj);
      subContractorObj.username = subContractor.username;
      subContractorObj.nextOfKinName = subContractor.nextOfKinName;
      subContractorObj.nextOfKinPhoneNumber =
        subContractor.nextOfKinPhoneNumber;
      subContractorObj.nextOfKinEmail = subContractor.nextOfKinEmail;
      subContractorObj.nextOfKinRelation = subContractor.nextOfKinRelation;
      subContractorObj.roleId = subContractor.roleId;

      if (subContractor.lineManagerId) {
        let resSubContrator = await transactionalEntityManager.findOne(
          Employee,
          subContractor.lineManagerId
        );
        if (!resSubContrator) {
          throw new Error('Line Manager not found');
        }

        subContractorObj.lineManagerId = subContractor.lineManagerId;
      } else {
        subContractorObj.lineManagerId = null;
      }
      subContractorObj = await transactionalEntityManager.save(
        subContractorObj
      );

      if (!subContractor.latestContract) {
        throw new Error('Must have contract info');
      }

      let {
        startDate,
        endDate,
        remunerationAmount,
        remunerationAmountPer,
        comments,
        noOfHours,
        noOfDays,
        fileId,
      } = subContractor.latestContract;

      // find latest contract here
      let subContractorContract = await transactionalEntityManager
        .getRepository(EmploymentContract)
        .createQueryBuilder('employmentContract')
        .where((qb) => {
          return (
            'start_date = ' +
            qb
              .subQuery()
              .select('Max(start_date)')
              .from('employment_contracts', 'e')
              .where('employee_id = ' + subContractorObj.id)
              .getSql()
          );
        })
        .andWhere('employee_id = ' + subContractorObj.id)
        .getOne();

      if (!subContractorContract) {
        subContractorContract = new EmploymentContract();
      }
      subContractorContract.startDate = new Date(startDate);
      if (endDate) {
        subContractorContract.endDate = new Date(endDate);
      }
      subContractorContract.comments = comments;
      subContractorContract.noOfHours = noOfHours;
      subContractorContract.noOfDays = noOfDays;

      subContractorContract.remunerationAmount = remunerationAmount;
      subContractorContract.remunerationAmountPer = remunerationAmountPer;
      subContractorContract.employeeId = subContractorObj.id;
      if (fileId) subContractorContract.fileId = fileId;
      await transactionalEntityManager.save(subContractorContract);
      return subContractorObj.id;
    });
    return this.findOneCustom(id);
  }

  async findOneCustom(id: number): Promise<any | undefined> {
    return this.findOne(id, {
      relations: [
        'contactPersonOrganization',
        'contactPersonOrganization.contactPerson',
        'contactPersonOrganization.organization',
        'employmentContracts',
        'employmentContracts.file',
      ],
    });
  }

  async deleteCustom(id: number): Promise<any | undefined> {
    return this.manager.transaction(async (transactionalEntityManager) => {
      let subContract = await transactionalEntityManager.findOne(Employee, id, {
        relations: [
          'contactPersonOrganization',
          'contactPersonOrganization.contactPerson',
          'employmentContracts',
          'bankAccounts',
          'leases',
          'leaveRequests',
        ],
      });

      if (!subContract) {
        throw new Error('Employee not found');
      }

      let allocations = await transactionalEntityManager.find(
        OpportunityResourceAllocation,
        {
          where: {
            contactPersonId:
              subContract.contactPersonOrganization.contactPerson.id,
          },
        }
      );

      if (allocations.length > 0) {
        throw new Error('Employee is allocated');
      }

      if (subContract.leaveRequests.length > 0) {
        throw new Error('Employee has leave requests');
      }

      let works = await transactionalEntityManager.find(Opportunity, {
        where: [
          { projectManagerId: id },
          { accountDirectorId: id },
          { opportunityManagerId: id },
          { accountManagerId: id },
        ],
      });

      if (works.length > 0) {
        throw new Error('Employee is managing Opportunities / Projects');
      }

      let juniors = await transactionalEntityManager.find(Employee, {
        where: { lineManagerId: id },
      });

      if (juniors.length > 0) {
        throw new Error('Employee is managing other employees');
      }

      let attachments = await transactionalEntityManager.find(Attachment, {
        where: { targetType: EntityType.EMPLOYEE, targetId: id },
      });

      let comments = await transactionalEntityManager.find(Comment, {
        where: { targetType: EntityType.EMPLOYEE, targetId: id },
      });

      transactionalEntityManager.softRemove(Attachment, attachments);
      transactionalEntityManager.softRemove(Comment, comments);
      transactionalEntityManager.softRemove(
        ContactPersonOrganization,
        subContract.contactPersonOrganization
      );
      return transactionalEntityManager.softRemove(Employee, subContract);
    });
  }

  async costCalculator(id: number, searchIn: boolean) {
    let searchId: number = id;

    if (searchIn) {
      let contactPerson = await this.manager.findOne(ContactPerson, id, {
        relations: [
          'contactPersonOrganizations',
          'contactPersonOrganizations.employee',
        ],
      });
      if (!contactPerson) {
        throw new Error('Employee not found');
      }
      let sub = contactPerson.getEmployee;

      if (!sub) {
        throw new Error('Employee not found');
      }
      searchId = sub.id;
    }
    let subContractor = await this.findOne(searchId, {
      relations: [
        'contactPersonOrganization',
        'contactPersonOrganization.contactPerson',
        'contactPersonOrganization.contactPerson.state',
        'employmentContracts',
      ],
    });
    if (!subContractor) {
      throw new Error('Employee not found');
    }

    let currentContract: any = subContractor.getActiveContract;

    if (!currentContract) {
      throw new Error('No Active Contract');
    }

    if (!currentContract.noOfHours) {
      throw new Error('Hours not defined');
    }

    if (!currentContract.noOfDays) {
      throw new Error('Days not defined');
    }

    currentContract.dailyHours =
      currentContract?.noOfHours / currentContract?.noOfDays;
    currentContract.hourlyBaseRate = //HOURLY RATE
      currentContract.remunerationAmountPer === 1
        ? currentContract?.remunerationAmount
        : //DAILY RATE
        currentContract.remunerationAmountPer === 2
        ? currentContract?.remunerationAmount * currentContract.dailyHours
        : //WEEKLY RATE
        currentContract.remunerationAmountPer === 3
        ? currentContract?.remunerationAmount * currentContract?.noOfHours
        : //FORTNIGLTY RATE
        currentContract.remunerationAmountPer === 4
        ? currentContract?.remunerationAmount *
          (currentContract?.dailyHours * 11)
        : //MONTHLY RATE
          currentContract.remunerationAmountPer === 5 &&
          currentContract?.remunerationAmount *
            (currentContract?.dailyHours * 22);
    let buyRate: any = 0;
    // if (currentContract?.hourlyBaseRate){
    let stateName: string | undefined =
      subContractor?.contactPersonOrganization.contactPerson?.state?.label;

    let golobalVariables: any = await this.manager
      .getRepository(GlobalVariableLabel)
      .createQueryBuilder('variable')
      .innerJoinAndSelect('variable.values', 'values')
      .where('name = :name', { name: stateName })
      .andWhere('values.start_date <= :startDate', {
        startDate: moment().startOf('day').toDate(),
      })
      .andWhere('values.end_date >= :endDate', {
        endDate: moment().endOf('day').toDate(),
      })
      .getOne();

    buyRate = currentContract?.hourlyBaseRate;
    golobalVariables = golobalVariables.map((variable: any) => {
      let value: any = variable?.values?.[0];
      buyRate += (currentContract?.hourlyBaseRate * value.value) / 100;
      return {
        name: variable.name,
        variableId: variable.id,
        valueId: value.id,
        value: value.value,
        apply: 'Yes',
        amount: (currentContract?.hourlyBaseRate * value.value) / 100,
      };
    });
    // }

    return {
      contract: currentContract,
      golobalVariables,
      employeeBuyRate: buyRate,
    };
  }
}
