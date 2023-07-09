import { ContactPersonDTO } from '../dto';
import { EntityRepository, In, Not, Repository } from 'typeorm';
import { ContactPerson } from './../entities/contactPerson';
import { ContactPersonOrganization } from './../entities/contactPersonOrganization';
import { State } from './../entities/state';
import { StandardSkillStandardLevel } from './../entities/standardSkillStandardLevel';
import { Organization } from './../entities/organization';
import { OpportunityResourceAllocation } from '../entities/opportunityResourceAllocation';
import { Employee } from '../entities/employee';
import { Opportunity } from '../entities/opportunity';
import moment from 'moment-timezone';

@EntityRepository(ContactPerson)
export class ContactPersonRepository extends Repository<ContactPerson> {
  async createAndSave(contactPersonDTO: ContactPersonDTO): Promise<any> {
    let id: number;
    id = await this.manager.transaction(async (transactionalEntityManager) => {
      let contactPersonObj = new ContactPerson();
      contactPersonObj.firstName = contactPersonDTO.firstName;
      contactPersonObj.lastName = contactPersonDTO.lastName;
      contactPersonObj.email = contactPersonDTO.email;
      contactPersonObj.birthPlace = contactPersonDTO.birthPlace;
      contactPersonObj.address = contactPersonDTO.address;
      contactPersonObj.gender = contactPersonDTO.gender;
      contactPersonObj.phoneNumber = contactPersonDTO.phoneNumber;
      if (contactPersonDTO.dateOfBirth)
        contactPersonObj.dateOfBirth = moment(
          contactPersonDTO.dateOfBirth
        ).toDate();

      let state: State | undefined;
      if (contactPersonDTO.stateId) {
        state = await this.manager.findOne(State, contactPersonDTO.stateId);
        if (!state) {
          throw new Error('State not found');
        }
        contactPersonObj.stateId = state.id;
      }

      if (
        contactPersonDTO.clearanceLevel &&
        contactPersonDTO.clearanceGrantedDate &&
        contactPersonDTO.clearanceExpiryDate
      ) {
        contactPersonObj.clearanceLevel = contactPersonDTO.clearanceLevel;
        contactPersonObj.clearanceGrantedDate = moment(
          contactPersonDTO.clearanceGrantedDate
        ).toDate();
        contactPersonObj.clearanceExpiryDate = moment(
          contactPersonDTO.clearanceExpiryDate
        ).toDate();
      }

      contactPersonObj.csidNumber = contactPersonDTO.csidNumber;

      let clearanceSponsor: Organization | undefined;
      if (contactPersonDTO.clearanceSponsorId) {
        clearanceSponsor = await this.manager.findOne(
          Organization,
          contactPersonDTO.clearanceSponsorId
        );
        if (!clearanceSponsor) {
          throw new Error('Clearance Sponsor not found');
        }
        contactPersonObj.clearanceSponsorId = clearanceSponsor.id;
      }

      //ADD TYPE CHECK FOR ENUM OR VALIDATE
      contactPersonObj.recruitmentAvailability =
        contactPersonDTO.recruitmentAvailability;

      contactPersonObj.recruitmentContractType =
        contactPersonDTO.recruitmentContractType;

      contactPersonObj.recruitmentProspect =
        contactPersonDTO.recruitmentProspect;

      contactPersonObj.recruitmentSalaryEstimate =
        contactPersonDTO.recruitmentSalaryEstimate;

      contactPersonObj.recruitmentNotes = contactPersonDTO.recruitmentNotes;

      let standardSkillStandardLevelList =
        await transactionalEntityManager.findByIds(
          StandardSkillStandardLevel,
          contactPersonDTO.standardSkillStandardLevelIds
        );
      console.log(
        'standardSkillStandardLevelList.length: ',
        standardSkillStandardLevelList.length
      );
      contactPersonObj.standardSkillStandardLevels =
        standardSkillStandardLevelList;
      contactPersonObj = await transactionalEntityManager.save(
        contactPersonObj
      );
      id = contactPersonObj.id;
      let contactPersonOrganizationPromises =
        contactPersonDTO.contactPersonOrganizations.map(
          async (contactPersonOrganization) => {
            let contactPersonOrganizationObj = new ContactPersonOrganization();
            contactPersonOrganizationObj.startDate = moment(
              contactPersonOrganization.startDate
            )
              .startOf('day')
              .toDate();
            if (contactPersonOrganization.endDate)
              contactPersonOrganizationObj.endDate = moment(
                contactPersonOrganization.endDate
              )
                .endOf('day')
                .toDate();
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
      console.log('contactPersonOrganizations: ', contactPersonOrganizations);
      return contactPersonObj.id;
    });
    return await this.findOneCustom(id);
  }

  async getAllActive(): Promise<any[]> {
    let contactPersons = await this.find({
      relations: [
        'standardSkillStandardLevels',
        'contactPersonOrganizations',
        'contactPersonOrganizations.employee',
        'contactPersonOrganizations.employee.contactPersonOrganization',
      ],
    });

    contactPersons.forEach((cp) => {
      (cp as any).employee = cp.getEmployee;
      (cp as any).employementStatus = cp.getEmployee
        ? cp.getEmployee.contactPersonOrganization.organizationId == 1
          ? 'Employee'
          : 'Sub Contractor'
        : 'Contact Person';
    });

    return contactPersons;
  }

  async updateAndReturn(
    id: number,
    contactPersonDTO: ContactPersonDTO
  ): Promise<any | undefined> {
    await this.manager.transaction(async (transactionalEntityManager) => {
      var contactPersonObj = await transactionalEntityManager.findOne(
        ContactPerson,
        id,
        {
          relations: [
            'contactPersonOrganizations',
            'contactPersonOrganizations.employee',
          ],
        }
      );

      if (!contactPersonObj) {
        throw new Error('Contact person not found');
      }

      contactPersonObj.firstName = contactPersonDTO.firstName;
      contactPersonObj.lastName = contactPersonDTO.lastName;
      contactPersonObj.email = contactPersonDTO.email;
      contactPersonObj.birthPlace = contactPersonDTO.birthPlace;
      contactPersonObj.address = contactPersonDTO.address;
      contactPersonObj.gender = contactPersonDTO.gender;
      contactPersonObj.phoneNumber = contactPersonDTO.phoneNumber;
      if (contactPersonDTO.dateOfBirth)
        contactPersonObj.dateOfBirth = moment(
          contactPersonDTO.dateOfBirth
        ).toDate();

      let state: State | undefined;
      if (contactPersonDTO.stateId) {
        state = await this.manager.findOne(State, contactPersonDTO.stateId);
        if (!state) {
          throw new Error('State not found');
        }
        contactPersonObj.state = state;
      }

      if (
        contactPersonDTO.clearanceLevel &&
        contactPersonDTO.clearanceGrantedDate &&
        contactPersonDTO.clearanceExpiryDate
      ) {
        contactPersonObj.clearanceLevel = contactPersonDTO.clearanceLevel;
        contactPersonObj.clearanceGrantedDate = moment(
          contactPersonDTO.clearanceGrantedDate
        ).toDate();
        contactPersonObj.clearanceExpiryDate = moment(
          contactPersonDTO.clearanceExpiryDate
        ).toDate();
      }

      contactPersonObj.csidNumber = contactPersonDTO.csidNumber;

      let clearanceSponsor: Organization | undefined;
      if (contactPersonDTO.clearanceSponsorId) {
        clearanceSponsor = await this.manager.findOne(
          Organization,
          contactPersonDTO.clearanceSponsorId
        );
        if (!clearanceSponsor) {
          throw new Error('Clearance Sponsor not found');
        }
        contactPersonObj.clearanceSponsorId = clearanceSponsor.id;
      }

      //ADD TYPE CHECK FOR ENUM OR VALIDATE
      contactPersonObj.recruitmentAvailability =
        contactPersonDTO.recruitmentAvailability;

      contactPersonObj.recruitmentContractType =
        contactPersonDTO.recruitmentContractType;

      contactPersonObj.recruitmentProspect =
        contactPersonDTO.recruitmentProspect;

      contactPersonObj.recruitmentSalaryEstimate =
        contactPersonDTO.recruitmentSalaryEstimate;
      contactPersonObj.recruitmentNotes = contactPersonDTO.recruitmentNotes;

      let standardSkillStandardLevelList =
        await transactionalEntityManager.findByIds(
          StandardSkillStandardLevel,
          contactPersonDTO.standardSkillStandardLevelIds
        );
      console.log(
        'standardSkillStandardLevelList.length: ',
        standardSkillStandardLevelList.length
      );
      contactPersonObj.standardSkillStandardLevels =
        standardSkillStandardLevelList;
      contactPersonObj = await transactionalEntityManager.save(
        contactPersonObj
      );
      id = contactPersonObj.id;

      let includedAssociations: number[] = [];
      let contactPersonOrganizationPromises: ContactPersonOrganization[] = [];
      for (let contactPersonOrganization of contactPersonDTO.contactPersonOrganizations) {
        let contactPersonOrganizationObj: ContactPersonOrganization | undefined;
        let contactPersonOrganizationObjFound =
          await transactionalEntityManager.find(ContactPersonOrganization, {
            relations: ['organization', 'contactPerson', 'employee'],
            where: {
              id: contactPersonOrganization.id,
            },
          });

        if (!contactPersonOrganizationObjFound.length) {
          contactPersonOrganizationObj = new ContactPersonOrganization();
          // contactPersonOrganizationObj.contactPerson = contactPersonObj;
        } else {
          console.log('I FOUND ONE ');
          includedAssociations.push(contactPersonOrganizationObjFound[0].id);
          contactPersonOrganizationObj = contactPersonOrganizationObjFound[0];
        }
        contactPersonOrganizationObj.startDate = moment(
          contactPersonOrganization.startDate
        )
          .startOf('day')
          .toDate();
        if (contactPersonOrganization.endDate)
          contactPersonOrganizationObj.endDate = moment(
            contactPersonOrganization.endDate
          )
            .endOf('day')
            .toDate();
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
        contactPersonOrganizationObj.contactPersonId = id;
        contactPersonOrganizationPromises.push(contactPersonOrganizationObj);
      }

      console.log('INCLUDED ASSOCIATIONS = ', includedAssociations);
      let leftAssoications = await transactionalEntityManager.find(
        ContactPersonOrganization,
        {
          where: { id: Not(In(includedAssociations)), contactPersonId: id },
          relations: ['employee'],
        }
      );

      for (let association of leftAssoications) {
        if (association.employee) {
          throw new Error('Deleted association was used in Employee');
        }
      }

      console.log('LEFT ASSOCIATIONS');
      let contactPersonOrganizations = await Promise.all(
        contactPersonOrganizationPromises
      );
      contactPersonObj['contactPersonOrganizations'] =
        contactPersonOrganizations;
      await transactionalEntityManager.save(contactPersonObj);
    });
    return this.findOneCustom(id);
  }

  async findOneCustom(id: number): Promise<any | undefined> {
    let contactPerson = await this.findOne(id, {
      relations: [
        'standardSkillStandardLevels',
        'contactPersonOrganizations',
        'contactPersonOrganizations.employee',
        'contactPersonOrganizations.employee.contactPersonOrganization',
      ],
    });

    if (!contactPerson) {
      throw new Error('Contact Person not found');
    }

    (contactPerson as any).employee = contactPerson.getEmployee;
    (contactPerson as any).employementStatus = contactPerson.getEmployee
      ? contactPerson.getEmployee.contactPersonOrganization.organizationId == 1
        ? 'Employee'
        : 'Sub Contractor'
      : 'Contact Person';

    return contactPerson;
  }

  async deleteCustom(id: number): Promise<any | undefined> {
    return this.manager.transaction(async (transactionalEntityManager) => {
      let contactPerson = await transactionalEntityManager.findOne(
        ContactPerson,
        id,
        {
          relations: [
            'contactPersonOrganizations',
            'standardSkillStandardLevels',
          ],
        }
      );
      if (!contactPerson) {
        throw new Error('Contact Person not found');
      }
      if (contactPerson.contactPersonOrganizations.length) {
        throw new Error('Contact Person is Employee');
      }

      let allocations = await transactionalEntityManager.find(
        OpportunityResourceAllocation,
        {
          where: { opportunityResourceId: id },
          relations: ['opportunityResource'],
        }
      );

      if (allocations.length > 0) {
        throw new Error('Contact person is allocated in opportunity');
      }

      let works = await transactionalEntityManager.find(Opportunity, {
        where: { contactPersonId: id },
      });

      if (works.length > 0) {
        throw new Error('Contact person is delected to opportunity');
      }

      return transactionalEntityManager.softRemove(
        ContactPerson,
        contactPerson
      );
    });
  }
}
