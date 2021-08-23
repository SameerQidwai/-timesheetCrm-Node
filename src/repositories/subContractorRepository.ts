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

@EntityRepository(Employee)
export class SubContractorRepository extends Repository<Employee> {
  async createAndSave(subContractor: SubContractorDTO): Promise<any> {
    let id: number;
    let generatedPassword = Math.random().toString(36).substring(4);
    id = await this.manager.transaction(async (transactionalEntityManager) => {
      if (!subContractor.organizationId) {
        throw Error('Must provide organization');
      }
      let organizationObj = await transactionalEntityManager.findOne(
        Organization,
        subContractor.organizationId
      );
      if (!organizationObj) {
        throw Error('Must provide organization');
      }

      if (!subContractor.contactPersonId) {
        throw Error('Must provide contact person');
      }
      let contactPersonObj = await transactionalEntityManager.findOne(
        ContactPerson,
        subContractor.contactPersonId,
        { relations: ['contactPersonOrganizations'] }
      );
      if (!contactPersonObj) {
        throw Error('Must provide contact person');
      }

      // find contactpersonorganization id for oneLM
      let contactPersonOrganization =
        contactPersonObj.contactPersonOrganizations.filter(
          (x) => x.organizationId == subContractor.organizationId
        )[0];
      if (!contactPersonOrganization) {
        throw Error('Not associated with this organization');
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
      employeeObj = await transactionalEntityManager.save(employeeObj);
      id = employeeObj.id;

      if (!subContractor.latestContract) {
        throw Error('Must have contract info');
      }

      let employmentContract = new EmploymentContract();
      let {
        startDate,
        endDate,
        remunerationAmount,
        remunerationAmountPer,
        comments,
        noOfHours,
        noOfHoursPer,
        fileId,
      } = subContractor.latestContract;

      employmentContract.startDate = new Date(startDate);
      if (endDate) {
        employmentContract.endDate = new Date(endDate);
      }
      employmentContract.comments = comments;
      employmentContract.noOfHours = noOfHours;
      employmentContract.noOfHoursPer = noOfHoursPer;
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
        throw Error('Sub Contractor not found');
      }
      let contactPersonObj = await transactionalEntityManager.findOne(
        ContactPerson,
        subContractorObj.contactPersonOrganization.contactPerson.id
      );
      if (!contactPersonObj) {
        throw Error('Sub Contractor not found');
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
      subContractorObj = await transactionalEntityManager.save(
        subContractorObj
      );

      if (!subContractor.latestContract) {
        throw Error('Must have contract info');
      }

      let {
        startDate,
        endDate,
        remunerationAmount,
        remunerationAmountPer,
        comments,
        noOfHours,
        noOfHoursPer,
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
      console.log('subContractorContract: ', subContractorContract);

      if (!subContractorContract) {
        throw Error('Contract Not found');
      }
      subContractorContract.startDate = new Date(startDate);
      if (endDate) {
        subContractorContract.endDate = new Date(endDate);
      }
      subContractorContract.comments = comments;
      subContractorContract.noOfHours = noOfHours;
      subContractorContract.noOfHoursPer = noOfHoursPer;

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
      ],
    });
  }

  async deleteCustom(id: number): Promise<any | undefined> {
    return this.softDelete(id);
  }
}
