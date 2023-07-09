import { OrganizationDTO } from '../dto';
import { EntityRepository, Repository } from 'typeorm';
import { Organization } from './../entities/organization';
import { ContactPersonOrganization } from './../entities/contactPersonOrganization';
import { BankAccount } from './../entities/bankAccount';
import { Opportunity } from '../entities/opportunity';
import { ContactPerson } from '../entities/contactPerson';
import { Attachment } from '../entities/attachment';
import { Comment } from '../entities/comment';
import { EntityType } from '../constants/constants';
import moment from 'moment-timezone';

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
        obj.piInsuranceExpiry = moment(organization.piInsuranceExpiry).toDate();
      if (organization.plInsuranceExpiry)
        obj.plInsuranceExpiry = moment(organization.plInsuranceExpiry).toDate();
      if (organization.wcInsuranceExpiry)
        obj.wcInsuranceExpiry = moment(organization.wcInsuranceExpiry).toDate();
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
        obj.piInsuranceExpiry = moment(organization.piInsuranceExpiry).toDate();
      if (organization.plInsuranceExpiry)
        obj.plInsuranceExpiry = moment(organization.plInsuranceExpiry).toDate();
      if (organization.wcInsuranceExpiry)
        obj.wcInsuranceExpiry = moment(organization.wcInsuranceExpiry).toDate();
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
          {
            where: {
              organizationId: id,
              contactPersonId: organization.delegateContactPersonId,
            },
          }
        );
        if (delegateContactPerson)
          console.log(
            'delegateContactPerson: ',
            delegateContactPerson.designation
          );
        obj.delegateContactPersonId = organization.delegateContactPersonId;
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
        throw new Error('Bank Account not found');
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
    return this.manager.transaction(async (transactionalEntityManager) => {
      let organization = await transactionalEntityManager.findOne(
        Organization,
        id
      );
      if (!organization) {
        throw new Error('Organization not found');
      }

      let children = await transactionalEntityManager.find(Organization, {
        where: { parentOrganizationId: id },
      });

      if (children.length > 0) {
        throw new Error('Organization is parent');
      }

      let opportunities = await transactionalEntityManager.find(Opportunity, {
        where: { organizationId: id },
      });

      if (opportunities.length > 0) {
        throw new Error('Organization has opportunities');
      }

      let associations = await transactionalEntityManager.find(
        ContactPersonOrganization,
        { where: { organizationId: id } }
      );

      if (associations.length > 0) {
        throw new Error('Organization has associations');
      }

      let contactPersons = await transactionalEntityManager.find(
        ContactPerson,
        { where: { clearanceSponsorId: id } }
      );

      if (contactPersons.length > 0) {
        throw new Error('Organization is Sponsor');
      }

      let attachments = await transactionalEntityManager.find(Attachment, {
        where: { targetType: EntityType.WORK, targetId: id },
      });

      let comments = await transactionalEntityManager.find(Comment, {
        where: { targetType: EntityType.WORK, targetId: id },
      });

      if (attachments.length > 0)
        await transactionalEntityManager.softDelete(Attachment, attachments);
      if (comments.length > 0)
        await transactionalEntityManager.softDelete(Comment, comments);

      return transactionalEntityManager.softDelete(Organization, id);
    });
  }
}
