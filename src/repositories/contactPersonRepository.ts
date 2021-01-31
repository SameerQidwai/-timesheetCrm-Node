import { ContactPersonDTO } from "../dto";
import { EntityRepository, Repository } from "typeorm";
import { ContactPerson } from "./../entities/contactPerson";
import { ContactPersonOrganization } from "./../entities/contactPersonOrganization";
import { State } from "./../entities/state";
import { StandardSkillStandardLevel } from "./../entities/standardSkillStandardLevel";
import { Organization } from "./../entities/organization";

@EntityRepository(ContactPerson)
export class ContactPersonRepository extends Repository<ContactPerson> {

    async createAndSave(contactPerson: ContactPersonDTO): Promise<any> {
        let id: number;
        id = await this.manager.transaction(async transactionalEntityManager => {
            let contactPersonObj = new ContactPerson();
            contactPersonObj.firstName = contactPerson.firstName;
            contactPersonObj.lastName = contactPerson.lastName;
            contactPersonObj.email = contactPerson.email;
            contactPersonObj.address = contactPerson.address;
            contactPersonObj.gender = contactPerson.gender;
            contactPersonObj.phoneNumber = contactPerson.phoneNumber;
            if (contactPerson.dateOfBirth)
                contactPersonObj.dateOfBirth = new Date(contactPerson.dateOfBirth);

            let state: State | undefined;
            if (contactPerson.stateId) {
                state = await this.manager.findOne(State, contactPerson.stateId);
                if (!state) {
                    throw new Error("State not found");
                }
                contactPersonObj.stateId = state.id;
            }
            
            let standardSkillStandardLevelList = await transactionalEntityManager.findByIds(StandardSkillStandardLevel, contactPerson.standardSkillStandardLevelIds);
            console.log("standardSkillStandardLevelList.length: ", standardSkillStandardLevelList.length);
            contactPersonObj.standardSkillStandardLevels = standardSkillStandardLevelList;
            contactPersonObj = await transactionalEntityManager.save(contactPersonObj);
            id = contactPersonObj.id;
            let contactPersonOrganizationPromises = contactPerson.contactPersonOrganizations.map(async contactPersonOrganization => {
                let contactPersonOrganizationObj = new ContactPersonOrganization();
                contactPersonOrganizationObj.startDate = new Date(contactPersonOrganization.startDate);
                if(contactPersonOrganization.endDate)
                    contactPersonOrganizationObj.endDate = new Date(contactPersonOrganization.endDate);
                contactPersonOrganizationObj.designation = contactPersonOrganization.designation;
                let organization = await transactionalEntityManager.findOne(Organization, contactPersonOrganization.organizationId);
                if(!organization) {
                    throw new Error("Organization not found!");
                }
                contactPersonOrganizationObj.organizationId = organization.id;
                contactPersonOrganizationObj.contactPersonId = contactPersonObj.id;
                return contactPersonOrganizationObj;
            });
            let contactPersonOrganizations = await Promise.all(contactPersonOrganizationPromises);
            contactPersonOrganizations = await transactionalEntityManager.save(contactPersonOrganizations);
            console.log("contactPersonOrganizations: ", contactPersonOrganizations);
            return contactPersonObj.id;
        });
        return await this.findOneCustom(id);
    }

    async getAllActive(): Promise<any[]> {
        return this.find({ relations: ["standardSkillStandardLevels", "contactPersonOrganizations"] });
    }

    async updateAndReturn(id: number, contactPerson: ContactPersonDTO): Promise<any|undefined> {
        await this.manager.transaction(async transactionalEntityManager => {
            let contactPersonObj = await this.findOneCustom(id);
            contactPersonObj.firstName = contactPerson.firstName;
            contactPersonObj.lastName = contactPerson.lastName;
            contactPersonObj.email = contactPerson.email;
            contactPersonObj.address = contactPerson.address;
            contactPersonObj.gender = contactPerson.gender;
            contactPersonObj.phoneNumber = contactPerson.phoneNumber;
            if (contactPerson.dateOfBirth)
                contactPersonObj.dateOfBirth = new Date(contactPerson.dateOfBirth);

            let state: State | undefined;
            if (contactPerson.stateId) {
                state = await this.manager.findOne(State, contactPerson.stateId);
                if (!state) {
                    throw new Error("State not found");
                }
                contactPersonObj.state = state;
            }
            let standardSkillStandardLevelList = await transactionalEntityManager.findByIds(StandardSkillStandardLevel, contactPerson.standardSkillStandardLevelIds);
            console.log("standardSkillStandardLevelList.length: ", standardSkillStandardLevelList.length);
            contactPersonObj.standardSkillStandardLevels = standardSkillStandardLevelList;
            contactPersonObj = await transactionalEntityManager.save(contactPersonObj);
            id = contactPersonObj.id;

            let contactPersonOrganizationPromises = contactPerson.contactPersonOrganizations.map(async contactPersonOrganization => {
                let contactPersonOrganizationObj: ContactPersonOrganization | undefined;
                let contactPersonOrganizationObjFound = await transactionalEntityManager
                .find(ContactPersonOrganization, {
                    relations: ["organization", "contactPerson"],
                    where: {
                        id: contactPersonOrganization.id
                    }
                });
                if (!contactPersonOrganizationObjFound.length) {
                    contactPersonOrganizationObj = new ContactPersonOrganization();
                    // contactPersonOrganizationObj.contactPerson = contactPersonObj;
                } else {
                    contactPersonOrganizationObj = contactPersonOrganizationObjFound[0];
                }
                contactPersonOrganizationObj.startDate = new Date(contactPersonOrganization.startDate);
                if(contactPersonOrganization.endDate)
                    contactPersonOrganizationObj.endDate = new Date(contactPersonOrganization.endDate);
                contactPersonOrganizationObj.designation = contactPersonOrganization.designation;
                let organization = await transactionalEntityManager.findOne(Organization, contactPersonOrganization.organizationId);
                if(!organization) {
                    throw new Error("Organization not found!");
                }
                contactPersonOrganizationObj.organizationId = organization.id;
                contactPersonOrganizationObj.contactPersonId = contactPersonObj.id;
                return contactPersonOrganizationObj;
            });
            
            let contactPersonOrganizations = await Promise.all(contactPersonOrganizationPromises);
            contactPersonObj["contactPersonOrganizations"] = contactPersonOrganizations;
            await transactionalEntityManager.save(contactPersonObj);
        });
        return this.findOneCustom(id);
    }

    async findOneCustom(id: number): Promise<any|undefined> {
        return this.findOne(id, { relations: ["standardSkillStandardLevels", "contactPersonOrganizations"] });
    }

    async deleteCustom(id: number): Promise<any|undefined> {
        return this.softDelete(id);
    }
}