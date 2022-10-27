import { ExpenseDTO } from '../dto';
import { EntityRepository, In, Repository } from 'typeorm';
import { Opportunity } from '../entities/opportunity';
import { Employee } from '../entities/employee';
import { ExpenseSheet } from '../entities/expenseSheet';
import { getProjectsByUserId } from '../utilities/helperFunctions';
import { Expense } from '../entities/expense';
import {
  ExpenseResponse,
  ExpensesResponse,
} from '../responses/expenseResponses';
import { ExpenseType } from '../entities/expenseType';
import moment from 'moment';
import { Attachment } from '../entities/attachment';
import { EntityType } from '../constants/constants';

@EntityRepository(Expense)
export class ExpenseRepository extends Repository<Expense> {
  async createAndSave(authId: number, expenseDTO: ExpenseDTO): Promise<any> {
    let id = await this.manager.transaction(
      async (transactionalEntityManager) => {
        let expenseObj = new Expense();

        expenseObj.amount = expenseDTO.amount;

        let momentDate = moment(expenseDTO.date, 'YYYY-MM-DD');
        if (!momentDate.isValid()) {
          throw new Error('Invalid Date');
        }
        expenseObj.date = momentDate.toDate();
        expenseObj.isReimbursed = expenseDTO.isReimbursed;
        expenseObj.isBillable = expenseDTO.isBillable;
        expenseObj.notes = expenseDTO.notes;

        if (!expenseDTO.expenseTypeId) {
          throw new Error('Expense type not found');
        }
        let expenseType = await this.manager.findOne(
          ExpenseType,
          expenseDTO.expenseTypeId
        );
        if (!expenseType) {
          throw new Error('Expense type not found');
        }
        expenseObj.expenseTypeId = expenseDTO.expenseTypeId;

        if (expenseDTO.projectId) {
          let project = await transactionalEntityManager.findOne(
            Opportunity,
            expenseDTO.projectId
          );
          if (!project) {
            throw new Error('Project not found');
          }
        }

        expenseObj.projectId = expenseDTO.projectId;

        expenseObj.createdBy = authId;

        for (const file of expenseDTO.attachments) {
          let attachmentObj = new Attachment();
          attachmentObj.fileId = file;
          attachmentObj.targetId = expenseObj.id;
          attachmentObj.targetType = EntityType.EXPENSE;
          attachmentObj.userId = authId;
          let attachment = await transactionalEntityManager.save(attachmentObj);
        }

        let expense = await transactionalEntityManager.save(expenseObj);

        return expense.id;
      }
    );

    let expense = await this._findOneCustom(authId, id);

    return new ExpenseResponse(expense);
  }

  async getAllActive(): Promise<any[]> {
    let results = await this.find({
      relations: ['expenseType', 'project'],
    });

    return new ExpensesResponse(results).expenses;
  }

  async getOwnActive(authId: number): Promise<any[]> {
    let results = await this.find({
      where: { createdBy: authId },
      relations: ['expenseType', 'project'],
    });

    // return new ExpensesResponse(results);

    return new ExpensesResponse(results).expenses;
  }

  async getManageActive(authId: number): Promise<any[]> {
    let employee = await this.manager.findOne(Employee, authId, {
      relations: [
        'contactPersonOrganization',
        'contactPersonOrganization.contactPerson',
      ],
    });

    if (!employee) {
      throw new Error('Employee not found');
    }
    let employeeContactPersonId =
      employee.contactPersonOrganization.contactPerson.id;

    let projects = await this.manager.find(Opportunity, {
      where: [{ status: 'P' }, { status: 'C' }],
      relations: [
        'organization',
        'opportunityResources',
        'opportunityResources.panelSkill',
        'opportunityResources.panelSkillStandardLevel',
        'opportunityResources.opportunityResourceAllocations',
        'opportunityResources.opportunityResourceAllocations.contactPerson',
      ],
    });

    let projectIds = getProjectsByUserId(
      projects,
      'm',
      0,
      employeeContactPersonId,
      authId,
      true
    );

    let results = await this.find({
      where: { projectId: In(projectIds) },
      relations: ['expenseType', 'project'],
    });

    return new ExpensesResponse(results).expenses;
  }

  async getOwnAndManageActive(authId: number): Promise<any[]> {
    let employee = await this.manager.findOne(Employee, authId, {
      relations: [
        'contactPersonOrganization',
        'contactPersonOrganization.contactPerson',
      ],
    });

    if (!employee) {
      throw new Error('Employee not found');
    }
    let employeeContactPersonId =
      employee.contactPersonOrganization.contactPerson.id;

    let projects = await this.manager.find(Opportunity, {
      where: [{ status: 'P' }, { status: 'C' }],
      relations: [
        'organization',
        'opportunityResources',
        'opportunityResources.panelSkill',
        'opportunityResources.panelSkillStandardLevel',
        'opportunityResources.opportunityResourceAllocations',
        'opportunityResources.opportunityResourceAllocations.contactPerson',
      ],
    });

    let projectIds = getProjectsByUserId(
      projects,
      'm',
      0,
      employeeContactPersonId,
      authId,
      true
    );

    let results = await this.find({
      where: [{ projectId: In(projectIds) }, { createdBy: authId }],
      relations: ['expenseType', 'project'],
    });

    return new ExpensesResponse(results).expenses;
  }

  async getAvailableAllActive(): Promise<any[]> {
    let results = await this.find({
      relations: ['expenseType', 'project'],
    });

    let expensesToRemoveIds: number[] = [];

    results.forEach((expense, index) => {
      if (expense.rejectedAt == null && expense.entries.length > 0) {
        expensesToRemoveIds.push(index);
      }
    });

    expensesToRemoveIds.forEach((index) => {
      results.splice(index, 1);
    });

    return new ExpensesResponse(results).expenses;
  }

  async getAvailableOwnActive(authId: number): Promise<any[]> {
    let results = await this.find({
      where: { createdBy: authId },
      relations: ['expenseType', 'project', 'entries'],
    });

    let expensesToRemoveIds: number[] = [];

    results.forEach((expense, index) => {
      if (expense.rejectedAt == null && expense.entries.length > 0) {
        expensesToRemoveIds.push(index);
      }
    });

    expensesToRemoveIds.forEach((index) => {
      results.splice(index, 1);
    });

    // return new ExpensesResponse(results);

    return new ExpensesResponse(results).expenses;
  }

  async getAvailableManageActive(authId: number): Promise<any[]> {
    let employee = await this.manager.findOne(Employee, authId, {
      relations: [
        'contactPersonOrganization',
        'contactPersonOrganization.contactPerson',
      ],
    });

    if (!employee) {
      throw new Error('Employee not found');
    }
    let employeeContactPersonId =
      employee.contactPersonOrganization.contactPerson.id;

    let projects = await this.manager.find(Opportunity, {
      where: [{ status: 'P' }, { status: 'C' }],
      relations: [
        'organization',
        'opportunityResources',
        'opportunityResources.panelSkill',
        'opportunityResources.panelSkillStandardLevel',
        'opportunityResources.opportunityResourceAllocations',
        'opportunityResources.opportunityResourceAllocations.contactPerson',
      ],
    });

    let projectIds = getProjectsByUserId(
      projects,
      'm',
      0,
      employeeContactPersonId,
      authId,
      true
    );

    let results = await this.find({
      where: { projectId: In(projectIds) },
      relations: ['expenseType', 'project', 'entries'],
    });

    let expensesToRemoveIds: number[] = [];

    results.forEach((expense, index) => {
      if (expense.rejectedAt == null && expense.entries.length > 0) {
        expensesToRemoveIds.push(index);
      }
    });

    expensesToRemoveIds.forEach((index) => {
      results.splice(index, 1);
    });

    return new ExpensesResponse(results).expenses;
  }

  async getAvailableOwnAndManageActive(authId: number): Promise<any[]> {
    let employee = await this.manager.findOne(Employee, authId, {
      relations: [
        'contactPersonOrganization',
        'contactPersonOrganization.contactPerson',
      ],
    });

    if (!employee) {
      throw new Error('Employee not found');
    }
    let employeeContactPersonId =
      employee.contactPersonOrganization.contactPerson.id;

    let projects = await this.manager.find(Opportunity, {
      where: [{ status: 'P' }, { status: 'C' }],
      relations: [
        'organization',
        'opportunityResources',
        'opportunityResources.panelSkill',
        'opportunityResources.panelSkillStandardLevel',
        'opportunityResources.opportunityResourceAllocations',
        'opportunityResources.opportunityResourceAllocations.contactPerson',
      ],
    });

    let projectIds = getProjectsByUserId(
      projects,
      'm',
      0,
      employeeContactPersonId,
      authId,
      true
    );

    let results = await this.find({
      where: [{ projectId: In(projectIds) }, { createdBy: authId }],
      relations: ['expenseType', 'project'],
    });

    let expensesToRemoveIds: number[] = [];

    results.forEach((expense, index) => {
      if (expense.rejectedAt == null && expense.entries.length > 0) {
        expensesToRemoveIds.push(index);
      }
    });

    expensesToRemoveIds.forEach((index) => {
      results.splice(index, 1);
    });

    return new ExpensesResponse(results).expenses;
  }

  async findOneCustom(authId: number, id: number): Promise<any | undefined> {
    let expense = await this._findOneCustom(authId, id);

    return new ExpenseResponse(expense);
  }

  async updateAndReturn(
    authId: number,
    id: number,
    expenseDTO: ExpenseDTO
  ): Promise<any | undefined> {
    await this.manager.transaction(async (transactionalEntityManager) => {
      let expenseObj = await this._findOneCustom(authId, id);

      if (!expenseObj) {
        throw new Error('Expense not found');
      }

      if (expenseObj.submittedAt || expenseObj.approvedAt) {
        throw new Error('Cannot edit expense');
      }

      expenseObj.amount = expenseDTO.amount;
      expenseObj.date = expenseDTO.date;
      expenseObj.isReimbursed = expenseDTO.isReimbursed;
      expenseObj.isBillable = expenseDTO.isBillable;
      expenseObj.notes = expenseDTO.notes;

      if (!expenseDTO.expenseTypeId) {
        throw new Error('Expense type not found');
      }
      let expenseType = await transactionalEntityManager.findOne(
        ExpenseType,
        expenseDTO.expenseTypeId
      );
      if (!expenseType) {
        throw new Error('Expense type not found');
      }
      expenseObj.expenseTypeId = expenseDTO.expenseTypeId;

      if (expenseDTO.projectId) {
        let project = await transactionalEntityManager.findOne(
          Opportunity,
          expenseDTO.projectId
        );
        if (!project) {
          throw new Error('Project not found');
        }
      }
      expenseObj.projectId = expenseDTO.projectId;

      let deleteableAttachments: Attachment[] = [];
      let newAttachments = [...new Set(expenseDTO.attachments)];
      let oldAttachments = await transactionalEntityManager.find(Attachment, {
        where: { targetId: expenseObj.id, targetType: EntityType.EXPENSE },
      });

      if (oldAttachments.length > 0) {
        oldAttachments.forEach((oldAttachment) => {
          let flag_found = false;

          newAttachments.forEach((attachment) => {
            let _indexOf = newAttachments.indexOf(attachment);
            if (oldAttachment.fileId === attachment) {
              flag_found = true;
              if (_indexOf > -1) {
                newAttachments.splice(_indexOf, 1);
              }
            } else {
              if (_indexOf <= -1) {
                newAttachments.push(attachment);
              }
            }
          });
          if (!flag_found) {
            deleteableAttachments.push(oldAttachment);
          }
        });
        await transactionalEntityManager.remove(
          Attachment,
          deleteableAttachments
        );
      }

      console.log('NEW', newAttachments);
      console.log('DELETE', deleteableAttachments);

      for (const file of newAttachments) {
        let attachmentObj = new Attachment();
        attachmentObj.fileId = file;
        attachmentObj.targetId = expenseObj.id;
        attachmentObj.targetType = EntityType.EXPENSE;
        attachmentObj.userId = authId;
        let attachment = await transactionalEntityManager.save(attachmentObj);
      }

      let expense = await transactionalEntityManager.save(expenseObj);

      return expense.id;
    });

    let expense = await this._findOneCustom(authId, id);

    return new ExpenseResponse(expense);
  }

  async deleteCustom(authId: number, id: number): Promise<any | undefined> {
    return this.manager.transaction(async (transactionalEntityManager) => {
      let expense = await transactionalEntityManager.findOne(Expense, id, {
        relations: ['entries'],
        where: { createdBy: authId },
      });

      if (!expense) {
        throw new Error('Expense not found');
      }

      if (expense.submittedAt || expense.approvedAt) {
        throw new Error('Expense is in submitted or approved');
      }

      if (expense.entries.length)
        await transactionalEntityManager.softDelete(Expense, expense.entries);

      await transactionalEntityManager.softRemove(Expense, expense);

      return expense;
    });
  }

  async _findOneCustom(authId: number, id: number): Promise<any | undefined> {
    let result = await this.findOne(id, {
      where: { createdBy: authId },
      relations: ['expenseType', 'project'],
    });

    return result;
  }
}
