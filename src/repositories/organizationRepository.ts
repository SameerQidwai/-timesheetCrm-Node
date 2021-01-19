import { OrganizationDTO } from "../dto";
import { EntityRepository, Repository } from "typeorm";
import { Organization } from "./../entities/organization";
import { ContactPersonOrganization } from "./../entities/contactPersonOrganization";

@EntityRepository(Organization)
export class OrganizationRepository extends Repository<Organization> {

    async createAndSave(organization: OrganizationDTO): Promise<any> {
        let obj = new Organization();
        obj.name = organization.name;
        obj.phoneNumber = organization.phoneNumber;
        obj.email = organization.email;
        obj.address = organization.address;
        obj.website = organization.website;
        obj.abn = organization.abn;
        obj.taxCode = organization.taxCode;
        obj.expectedBusinessAmount = organization.expectedBusinessAmount;
        obj.invoiceEmail = organization.invoiceEmail;
        obj.piInsurer = organization.piInsurer;
        obj.plInsurer = organization.plInsurer;
        obj.wcInsurer = organization.wcInsurer;
        obj.piPolicyNumber = organization.piPolicyNumber;
        obj.plPolicyNumber = organization.plPolicyNumber;
        obj.wcPolicyNumber = organization.wcPolicyNumber;
        if (organization.piInsuranceExpiry)
            obj.piInsuranceExpiry = new Date(organization.piInsuranceExpiry);
        if(organization.plInsuranceExpiry)
            obj.plInsuranceExpiry = new Date(organization.plInsuranceExpiry);
        if (organization.wcInsuranceExpiry)
            obj.wcInsuranceExpiry = new Date(organization.wcInsuranceExpiry);
        if (organization.parentOrganizationId) 
            obj.parentOrganization = await this.findOne(organization.parentOrganizationId);
        let result = await this.save(obj);
        return this.findOneCustom(result.id);
    }

    async getAllActive(): Promise<any[]> {
        return this.find({ relations: ["parentOrganization", "delegateContactPersonOrganization"] });
    }

    async updateAndReturn(id: number, organization: OrganizationDTO): Promise<any|undefined> {
        let obj = await this.findOne(id);
        if(!obj) {
            throw new Error("Organization not found");
        }
        obj.name = organization.name;
        obj.phoneNumber = organization.phoneNumber;
        obj.email = organization.email;
        obj.address = organization.address;
        obj.website = organization.website;
        obj.abn = organization.abn;
        obj.taxCode = organization.taxCode;
        obj.expectedBusinessAmount = organization.expectedBusinessAmount;
        obj.invoiceEmail = organization.invoiceEmail;
        obj.piInsurer = organization.piInsurer;
        obj.plInsurer = organization.plInsurer;
        obj.wcInsurer = organization.wcInsurer;
        obj.piPolicyNumber = organization.piPolicyNumber;
        obj.plPolicyNumber = organization.plPolicyNumber;
        obj.wcPolicyNumber = organization.wcPolicyNumber;
        
        if (organization.piInsuranceExpiry)
            obj.piInsuranceExpiry = new Date(organization.piInsuranceExpiry);
        if (organization.plInsuranceExpiry)
            obj.plInsuranceExpiry = new Date(organization.plInsuranceExpiry);
        if (organization.wcInsuranceExpiry)
            obj.wcInsuranceExpiry = new Date(organization.wcInsuranceExpiry);
        if (organization.parentOrganizationId)
            obj.parentOrganization = await this.findOne(organization.parentOrganizationId);
        if (organization.delegateContactPersonOrganizationId)
            obj.delegateContactPersonOrganization = await this.manager.findOne(ContactPersonOrganization, organization.delegateContactPersonOrganizationId);

        await this.update(id, obj);
        return this.findOneCustom(id);
    }

    async findOneCustom(id: number): Promise<any|undefined> {
        return this.findOne(id, { relations: ["parentOrganization", "delegateContactPersonOrganization"] });
    }

    async deleteCustom(id: number): Promise<any|undefined> {
        return this.softDelete(id);
    }
}