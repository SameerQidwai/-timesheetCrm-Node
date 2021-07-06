import { OrganizationDTO } from '../dto';
import { EntityRepository, Repository } from 'typeorm';
import { Organization } from './../entities/organization';
import { ContactPersonOrganization } from './../entities/contactPersonOrganization';
import { BankAccount } from './../entities/bankAccount';

@EntityRepository(Organization)
export class OrganizationRepository extends Repository<Organization> {
  async createAndSave(organization: OrganizationDTO): Promise<any> {
    let id: number;
    id = await this.manager.transaction(async (transactionalEntityManager) => {
      let obj = new Organization();

      obj.name = organization.name;
      obj.title = organization.title;
      obj.phoneNumber = organization.phoneNumber;
      obj.email = organization.email;
      obj.address = organization.address;
      obj.website = organization.website;
      obj.abn = organization.abn;
      obj.businessType = organization.businessType;
      obj.taxCode = organization.taxCode;
      obj.currentFinancialYearTotalForecast =
        organization.currentFinancialYearTotalForecast;
      obj.nextFinancialYearTotalForecast =
        organization.nextFinancialYearTotalForecast;
      obj.invoiceEmail = organization.invoiceEmail;
      obj.invoiceContactNumber = organization.invoiceContactNumber;
      obj.piInsurer = organization.piInsurer;
      obj.plInsurer = organization.plInsurer;
      obj.wcInsurer = organization.wcInsurer;
      obj.piSumInsured = organization.piSumInsured;
      obj.plSumInsured = organization.plSumInsured;
      obj.wcSumInsured = organization.wcSumInsured;
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
        obj.parentOrganization = await this.findOne(
          organization.parentOrganizationId
        );
      
      obj = await transactionalEntityManager.save(obj);
      console.log('obj: ', obj);

      // Bank Account
      let { bankName, bankAccountNo, bankBsb } = organization;
      let bankAccount = new BankAccount();
      bankAccount.accountNo = bankAccountNo;
      bankAccount.bsb = bankBsb;
      bankAccount.name = bankName;
      bankAccount.organizationId = obj.id;
      await transactionalEntityManager.save(bankAccount);
      return obj.id;
    });
    return await this.findOneCustom(id);
  }

  async getAllActive(): Promise<any[]> {
    return this.find({
      relations: [
        'parentOrganization',
        'delegateContactPerson',
        'bankAccounts',
      ],
    });
  }

  async updateAndReturn(
    id: number,
    organization: OrganizationDTO
  ): Promise<any | undefined> {
    await this.manager.transaction(async (transactionalEntityManager) => {
      let obj = await this.findOne(id);
      if (!obj) {
        throw new Error('Organization not found');
      }

      obj.name = organization.name;
      obj.title = organization.title;
      obj.phoneNumber = organization.phoneNumber;
      obj.email = organization.email;
      obj.address = organization.address;
      obj.website = organization.website;
      obj.abn = organization.abn;
      obj.businessType = organization.businessType;
      obj.taxCode = organization.taxCode;
      obj.currentFinancialYearTotalForecast =
        organization.currentFinancialYearTotalForecast;
      obj.nextFinancialYearTotalForecast =
        organization.nextFinancialYearTotalForecast;
      obj.invoiceEmail = organization.invoiceEmail;
      obj.invoiceContactNumber = organization.invoiceContactNumber;
      obj.piInsurer = organization.piInsurer;
      obj.plInsurer = organization.plInsurer;
      obj.wcInsurer = organization.wcInsurer;
      obj.piSumInsured = organization.piSumInsured;
      obj.plSumInsured = organization.plSumInsured;
      obj.wcSumInsured = organization.wcSumInsured;
      obj.piPolicyNumber = organization.piPolicyNumber;
      obj.plPolicyNumber = organization.plPolicyNumber;
      obj.wcPolicyNumber = organization.wcPolicyNumber;

      if (organization.piInsuranceExpiry)
        obj.piInsuranceExpiry = new Date(organization.piInsuranceExpiry);
      if (organization.plInsuranceExpiry)
        obj.plInsuranceExpiry = new Date(organization.plInsuranceExpiry);
      if (organization.wcInsuranceExpiry)
        obj.wcInsuranceExpiry = new Date(organization.wcInsuranceExpiry);
      if (organization.parentOrganizationId) {
        let parentOrganization = await this.findOne(
          organization.parentOrganizationId
        );
        if (parentOrganization)
          obj.parentOrganizationId = parentOrganization.id;
      }
      if (organization.delegateContactPersonId) {
        let delegateContactPerson = await this.manager.findOne(
          ContactPersonOrganization,
          organization.delegateContactPersonId
        );
        if (delegateContactPerson)
          obj.delegateContactPersonId = delegateContactPerson.id;
      } else {
        obj.delegateContactPersonId = null;
      }
      console.log('obj: ', obj);
      obj = await transactionalEntityManager.save(obj);
      // Bank Account
      let { bankName, bankAccountNo, bankBsb } = organization;
      let bankAccount = await transactionalEntityManager
        .getRepository(BankAccount)
        .findOne({
          where: {
            organization: {
              id: obj.id,
            },
          },
        });
      if (!bankAccount) {
        throw Error('Bank Account not found');
      }

      bankAccount.accountNo = bankAccountNo;
      bankAccount.bsb = bankBsb;
      bankAccount.name = bankName;
      bankAccount.organizationId = obj.id;
      await transactionalEntityManager.save(bankAccount);
      return obj.id;
    });

    return this.findOneCustom(id);
  }

  async findOneCustom(id: number): Promise<any | undefined> {
    return this.findOne(id, {
      relations: [
        'parentOrganization',
        'delegateContactPerson',
        'bankAccounts',
      ],
    });
  }

  async deleteCustom(id: number): Promise<any | undefined> {
    return this.softDelete(id);
  }
}
