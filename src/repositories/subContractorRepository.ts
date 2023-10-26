import bcrypt from 'bcryptjs';
import { dispatchMail, sendMail } from '../utilities/mailer';
import { ContactPersonDTO, EmployeeDTO, SubContractorDTO } from '../dto';
import {
  EntityRepository,
  getRepository,
  MoreThanOrEqual,
  Not,
  Repository,
} from 'typeorm';
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
import { EntityType, NotificationEventType } from '../constants/constants';
import { OpportunityResourceAllocation } from '../entities/opportunityResourceAllocation';
import { Opportunity } from '../entities/opportunity';
import { GlobalVariableLabel } from '../entities/globalVariableLabel';
import { CalendarHoliday } from '../entities/calendarHoliday';

import moment from 'moment-timezone';
import { WelcomeMail } from '../mails/welcomeMail';
import { NotificationManager } from '../utilities/notifier';

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
      contactPersonObj.birthPlace = subContractor.birthPlace;
      contactPersonObj.address = subContractor.address;
      contactPersonObj.gender = subContractor.gender;
      contactPersonObj.phoneNumber = subContractor.phoneNumber;
      if (subContractor.dateOfBirth)
        contactPersonObj.dateOfBirth = moment(
          subContractor.dateOfBirth
        ).toDate();

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

      employmentContract.startDate = moment(startDate).startOf('day').toDate();
      if (endDate) {
        employmentContract.endDate = moment(endDate).endOf('day').toDate();
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

    dispatchMail(
      new WelcomeMail(user.username, user.email, generatedPassword),
      user
    );

    const isEmployee =
      responseSubContractor.contactPersonOrganization.organizationId === 1;

    NotificationManager.info(
      [],
      `${isEmployee ? 'Employee' : 'Subcontractor'} Resource Added`,
      `${isEmployee ? 'Employee' : 'Subcontractor'} Resource with the name: ${
        responseSubContractor.getFullName
      } has been created`,
      `${isEmployee ? '/Employees' : '/sub-contractors'}`,
      isEmployee
        ? NotificationEventType.EMPLOYEE_CREATE
        : NotificationEventType.SUBCONTRACTOR_CREATE
    );
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
      if (!id) {
        throw new Error('Sub Contractor not found');
      }

      let subContractorObj = await this.findOne(id, {
        relations: [
          'contactPersonOrganization',
          'contactPersonOrganization.contactPerson',
          'contactPersonOrganization.organization',
          'employmentContracts',
          'employmentContracts.file',
        ],
      });

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
      contactPersonObj.birthPlace = subContractor.birthPlace;
      contactPersonObj.address = subContractor.address;
      contactPersonObj.gender = subContractor.gender;
      contactPersonObj.phoneNumber = subContractor.phoneNumber;
      if (subContractor.dateOfBirth)
        contactPersonObj.dateOfBirth = moment(
          subContractor.dateOfBirth
        ).toDate();

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

      let cSubContractorContractStartDate = moment(startDate);
      let cSubContractorContractEndDate: moment.Moment;
      if (endDate != null) {
        cSubContractorContractEndDate = moment(endDate);
      } else {
        cSubContractorContractEndDate = moment().add(100, 'years');
      }

      // find latest contract here
      let subContractorContract: EmploymentContract;

      let pastContracts: EmploymentContract[] = [];
      let currentContract: EmploymentContract[] = [];
      let futureContracts: EmploymentContract[] = [];

      for (let contract of subContractorObj.employmentContracts) {
        let dateCarrier = {
          startDate: contract.startDate,
          endDate: contract.endDate,
        };

        if (dateCarrier.startDate == null) {
          dateCarrier.startDate = moment()
            .subtract(100, 'years')
            .startOf('day')
            .toDate();
        }
        if (dateCarrier.endDate == null) {
          dateCarrier.endDate = moment()
            .add(100, 'years')
            .endOf('day')
            .toDate();
        }

        if (
          moment().isAfter(moment(dateCarrier.startDate), 'date') &&
          moment().isAfter(moment(dateCarrier.endDate), 'date')
        ) {
          pastContracts.push(contract);
        } else if (
          moment().isBetween(
            moment(dateCarrier.startDate),
            moment(dateCarrier.endDate),
            'date',
            '[]'
          )
        ) {
          currentContract.push(contract);
        } else if (
          moment().isBefore(moment(dateCarrier.startDate), 'date') &&
          moment().isBefore(moment(dateCarrier.endDate), 'date')
        ) {
          futureContracts.push(contract);
        }
      }

      if (currentContract.length) {
        subContractorContract = currentContract[0];
      } else if (futureContracts.length) {
        subContractorContract = futureContracts[0];
      } else {
        subContractorContract = pastContracts[pastContracts.length - 1];
      }

      for (let contract of subContractorObj.employmentContracts) {
        if (subContractorContract && subContractorContract.id == contract.id) {
          continue;
        }
        if (
          cSubContractorContractStartDate.isBetween(
            moment(contract.startDate),
            moment(contract.endDate ?? moment().add(100, 'years').toDate()),
            'date',
            '[]'
          ) ||
          moment(contract.startDate).isBetween(
            cSubContractorContractStartDate,
            cSubContractorContractEndDate
          )
        ) {
          throw new Error('Overlapping contract found');
        }

        if (
          cSubContractorContractEndDate.isBetween(
            moment(contract.startDate),
            moment(contract.endDate ?? moment().add(100, 'years').toDate()),
            'date',
            '[]'
          ) ||
          moment(
            contract.endDate ?? moment().add(100, 'years').toDate()
          ).isBetween(
            cSubContractorContractStartDate,
            cSubContractorContractEndDate,
            'date',
            '[]'
          )
        ) {
          throw new Error('Overlapping contract found');
        }
      }

      if (!subContractorContract) {
        subContractorContract = new EmploymentContract();
      }

      subContractorContract.startDate = moment(startDate)
        .startOf('day')
        .toDate();
      if (endDate) {
        subContractorContract.endDate = moment(endDate).endOf('day').toDate();
      }
      subContractorContract.comments = comments;
      subContractorContract.noOfHours = noOfHours;
      subContractorContract.noOfDays = noOfDays;

      subContractorContract.remunerationAmount = remunerationAmount;
      subContractorContract.remunerationAmountPer = remunerationAmountPer;
      subContractorContract.employeeId = subContractorObj.id;
      if (fileId) subContractorContract.fileId = fileId;
      await transactionalEntityManager.save(subContractorContract);

      let isEmployee =
        subContractorObj.contactPersonOrganization.organizationId === 1;

      NotificationManager.info(
        [subContractorObj.lineManagerId],
        `${isEmployee ? 'Employee' : 'Subcontractor'} Resource Updated`,
        `${isEmployee ? 'Employee' : 'Subcontractor'} Resource with the name: ${
          subContractorObj.getFullName
        } details have been updated`,
        `${isEmployee ? '/Employees' : '/sub-contractors'}/${
          subContractorObj.id
        }/info`,
        isEmployee
          ? NotificationEventType.EMPLOYEE_UPDATE
          : NotificationEventType.SUBCONTRACTOR_UPDATE
      );

      return subContractorObj.id;
    });
    return this.findOneCustom(id);
  }

  async findOneCustom(id: number): Promise<any | undefined> {
    let subcontractor = await this.findOne(id, {
      relations: [
        'contactPersonOrganization',
        'contactPersonOrganization.contactPerson',
        'contactPersonOrganization.organization',
        'employmentContracts',
        'employmentContracts.file',
      ],
    });

    if (!subcontractor) {
      throw new Error('Sub-Contractor not found');
    }

    let pastContracts: EmploymentContract[] = [];
    let currentContract: EmploymentContract[] = [];
    let futureContracts: EmploymentContract[] = [];

    for (let contract of subcontractor.employmentContracts) {
      let dateCarrier = {
        startDate: contract.startDate,
        endDate: contract.endDate,
      };

      if (dateCarrier.startDate == null) {
        dateCarrier.startDate = moment()
          .subtract(100, 'years')
          .startOf('day')
          .toDate();
      }
      if (dateCarrier.endDate == null) {
        dateCarrier.endDate = moment().add(100, 'years').endOf('day').toDate();
      }

      if (
        moment().isAfter(moment(dateCarrier.startDate), 'date') &&
        moment().isAfter(moment(dateCarrier.endDate), 'date')
      ) {
        pastContracts.push(contract);
      } else if (
        moment().isBetween(
          moment(dateCarrier.startDate),
          moment(dateCarrier.endDate),
          'date',
          '[]'
        )
      ) {
        currentContract.push(contract);
      } else if (
        moment().isBefore(moment(dateCarrier.startDate), 'date') &&
        moment().isBefore(moment(dateCarrier.endDate), 'date')
      ) {
        futureContracts.push(contract);
      }
    }

    if (currentContract.length) {
      subcontractor.employmentContracts = [currentContract[0]];
    } else if (futureContracts.length) {
      subcontractor.employmentContracts = [futureContracts[0]];
    } else if (pastContracts.length) {
      subcontractor.employmentContracts = [
        pastContracts[pastContracts.length - 1],
      ];
    }

    return subcontractor;
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

  async costCalculator(id: number, searchIn: boolean, startDate: string) {
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

    let currentContract: any;
    let momentStartDate = moment(startDate, 'YYYY-MM-DD');

    if (momentStartDate.isValid()) {
      currentContract = await this.manager.findOne(EmploymentContract, {
        where: {
          startDate: MoreThanOrEqual(momentStartDate.toDate()),
          employeeId: subContractor.id,
        },
      });

      if (!currentContract) currentContract = subContractor.getActiveContract;
    } else {
      currentContract = subContractor.getActiveContract;
    }

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
    let stateName: string | null =
      subContractor?.contactPersonOrganization.contactPerson?.state?.label;

    stateName = stateName ?? 'No State';

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
      .getMany();

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

    //set state if state is not assigned to employee
    if (stateName === 'No State') {
      golobalVariables[0] = {
        name: stateName,
        variableId: 0,
        valueId: 0,
        value: 0,
      };
    }

    return {
      contract: currentContract,
      golobalVariables,
      employeeBuyRate: buyRate,
    };
  }

  async toggleActiveStatus(id: number): Promise<any | undefined> {
    if (!id) {
      throw new Error('Subcontractor not found');
    }

    let subContractor = await this.findOne(id);

    if (!subContractor) {
      throw new Error('Subcontractor not found');
    }

    subContractor.active = !subContractor.active;

    return this.save(subContractor);
  }
}
