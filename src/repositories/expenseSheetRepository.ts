import {
  ExpenseSheetApproveDTO,
  ExpenseSheetDTO,
  ExpenseSheetsApproveDTO,
  ExpenseSheetsRejectDTO,
  ExpenseSheetsSubmitDTO,
} from '../dto';
import { EntityRepository, In, Not, Repository } from 'typeorm';
import { Opportunity } from './../entities/opportunity';
import { Employee } from '../entities/employee';

import { ExpenseSheet } from '../entities/expenseSheet';
import { getProjectsByUserId } from '../utilities/helperFunctions';
import { Expense } from '../entities/expense';
import { ExpenseSheetExpense } from '../entities/expenseSheetExpense';
import {
  ExpenseSheetResponse,
  ExpenseSheetsResponse,
} from '../responses/expenseSheetResponses';
import { Attachment } from '../entities/attachment';
import { EntityType } from '../constants/constants';
import moment from 'moment';

@EntityRepository(ExpenseSheet)
export class ExpenseSheetRepository extends Repository<ExpenseSheet> {
  async createAndSave(
    authId: number,
    expenseSheetDTO: ExpenseSheetDTO
  ): Promise<any> {
    let id = await this.manager.transaction(
      async (transactionalEntityManager) => {
        let expenseSheetObj = new ExpenseSheet();

        expenseSheetObj.label = expenseSheetDTO.label;

        if (expenseSheetDTO.projectId) {
          let project = await transactionalEntityManager.findOne(
            Opportunity,
            expenseSheetDTO.projectId
          );
          if (!project) {
            throw new Error('Project not found');
          }
        }
        expenseSheetObj.projectId = expenseSheetDTO.projectId;

        expenseSheetObj.createdBy = authId;

        let expenseSheetExpenses: ExpenseSheetExpense[] = [];

        for (let id of expenseSheetDTO.expenseSheetExpenses) {
          let expense = await transactionalEntityManager.findOne(Expense, id, {
            relations: ['entries'],
          });

          if (!expense) {
            throw new Error('Expense not found');
          }

          if (expense.projectId !== expenseSheetObj.projectId) {
            console.log(expense, expenseSheetObj);
            throw new Error('Sheet Project is different');
          }

          if (expense.rejectedAt == null && expense.entries.length > 0) {
            throw new Error('Expense already in sheet');
          }

          // if (expense.entries[expense.entries.length - 1].sheetId == id) {
          //   throw new Error('Expense already in same sheet');
          // }

          let expenseSheetExpenseObj = new ExpenseSheetExpense();

          expenseSheetExpenseObj.expenseId = expense.id;
          expenseSheetExpenseObj.sheetId = expenseSheetObj.id;

          expenseSheetExpenses.push(expenseSheetExpenseObj);

          expense.rejectedAt = null;
          expense.rejectedBy = null;

          await transactionalEntityManager.save(Expense, expense);
        }

        expenseSheetObj.expenseSheetExpenses = expenseSheetExpenses;

        let sheet = await transactionalEntityManager.save(expenseSheetObj);

        for (const file of expenseSheetDTO.attachments) {
          let attachmentObj = new Attachment();
          attachmentObj.fileId = file;
          attachmentObj.targetId = sheet.id;
          attachmentObj.targetType = EntityType.EXPENSE_SHEET;
          attachmentObj.userId = authId;
          let attachment = await transactionalEntityManager.save(attachmentObj);
        }

        return sheet.id;
      }
    );

    let sheet = await this._findOneCustom(authId, id);

    return new ExpenseSheetResponse(sheet);
  }

  async getAllActive(): Promise<any[]> {
    let result = await this._findManyCustom({});

    return new ExpenseSheetsResponse(result).sheets;
  }

  async getOwnActive(authId: number): Promise<any[]> {
    let results = await this._findManyCustom({
      where: { createdBy: authId },
    });

    return new ExpenseSheetsResponse(results).sheets;
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

    let results = await this._findManyCustom({
      where: { projectId: In(projectIds) },
    });

    return new ExpenseSheetsResponse(results).sheets;
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

    let results = await this._findManyCustom({
      where: [{ projectId: In(projectIds) }, { createdBy: authId }],
    });

    return new ExpenseSheetsResponse(results).sheets;
  }

  async findOneCustom(authId: number, id: number): Promise<any | undefined> {
    let result = await this._findOneCustom(authId, id);

    return new ExpenseSheetResponse(result);
  }

  async updateAndReturn(
    authId: number,
    id: number,
    expenseSheetDTO: ExpenseSheetDTO
  ): Promise<any | undefined> {
    await this.manager.transaction(async (transactionalEntityManager) => {
      let expenseSheetObj = await this.findOne(id, {
        relations: [
          'expenseSheetExpenses',
          'expenseSheetExpenses.expense',
          'expenseSheetExpenses.expense.expenseType',
          'expenseSheetExpenses.expense.project',
        ],
        where: { createdBy: authId },
      });

      if (!expenseSheetObj) {
        throw new Error('Expense sheet not found');
      }

      for (let expense of expenseSheetObj.expenseSheetExpenses) {
        if (expense.expense.submittedAt || expense.expense.approvedAt) {
          throw new Error('Cannot update Sheet');
        }
      }

      expenseSheetObj.label = expenseSheetDTO.label;

      if (expenseSheetDTO.projectId) {
        let project = await transactionalEntityManager.findOne(
          Opportunity,
          expenseSheetDTO.projectId
        );
        if (!project) {
          throw new Error('Project not found');
        }
      }
      expenseSheetObj.projectId = expenseSheetDTO.projectId;

      if (expenseSheetObj.expenseSheetExpenses.length)
        await transactionalEntityManager.delete(
          ExpenseSheetExpense,
          expenseSheetObj.expenseSheetExpenses
        );

      let expenseSheetExpenses: ExpenseSheetExpense[] = [];

      for (let id of expenseSheetDTO.expenseSheetExpenses) {
        let expense = await transactionalEntityManager.findOne(Expense, id, {
          relations: ['entries'],
        });

        if (!expense) {
          throw new Error('Expense not found');
        }

        if (expense.projectId !== expenseSheetObj.projectId) {
          throw new Error('Sheet Project is different');
        }

        if (expense.rejectedAt == null && expense.entries.length > 0) {
          throw new Error('Expense already in sheet');
        }

        // if (expense.entries[expense.entries.length - 1].sheetId == id) {
        //   throw new Error('Expense already in same sheet');
        // }

        let expenseSheetExpenseObj = new ExpenseSheetExpense();

        expenseSheetExpenseObj.expenseId = expense.id;
        expenseSheetExpenseObj.sheetId = expenseSheetObj.id;

        expenseSheetExpenses.push(expenseSheetExpenseObj);

        expense.rejectedAt = null;
        expense.rejectedBy = null;

        await transactionalEntityManager.save(Expense, expense);
      }

      let deleteableAttachments: Attachment[] = [];
      let newAttachments = [...new Set(expenseSheetDTO.attachments)];
      let oldAttachments = await transactionalEntityManager.find(Attachment, {
        where: {
          targetId: expenseSheetObj.id,
          targetType: EntityType.EXPENSE_SHEET,
        },
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
        attachmentObj.targetId = expenseSheetObj.id;
        attachmentObj.targetType = EntityType.EXPENSE_SHEET;
        attachmentObj.userId = authId;
        let attachment = await transactionalEntityManager.save(attachmentObj);
      }

      expenseSheetObj.expenseSheetExpenses = expenseSheetExpenses;

      let sheet = await transactionalEntityManager.save(expenseSheetObj);

      return sheet.id;
    });

    let sheet = await this._findOneCustom(authId, id);

    return new ExpenseSheetResponse(sheet);
  }

  async deleteCustom(authId: number, id: number): Promise<any | undefined> {
    return this.manager.transaction(async (transactionalEntityManager) => {
      let sheet = await this.findOne(id, {
        where: { createdBy: authId },
        relations: [
          'expenseSheetExpenses',
          'expenseSheetExpenses.expense',
          'expenseSheetExpenses.expense.expenseType',
          'expenseSheetExpenses.expense.project',
          'project',
        ],
      });

      if (!sheet) {
        throw new Error('Expense sheet not found');
      }

      sheet.expenseSheetExpenses.forEach((expense) => {
        if (expense.expense.approvedAt) {
          throw new Error('Cannt delete sheet with approved expenses');
        }
      });

      if (sheet.expenseSheetExpenses.length)
        await transactionalEntityManager.softDelete(
          ExpenseSheetExpense,
          sheet.expenseSheetExpenses
        );

      await transactionalEntityManager.softRemove(ExpenseSheet, sheet);

      return sheet;
    });
  }

  async approveExpenseSheet(
    authId: number,
    id: number,
    expenseSheetApproveDTO: ExpenseSheetApproveDTO
  ): Promise<any | undefined> {
    await this.manager.transaction(async (transactionalEntityManager) => {
      let expenseSheetObj = await this.findOne(id, {
        relations: [
          'expenseSheetExpenses',
          'expenseSheetExpenses.expense',
          'expenseSheetExpenses.expense.expenseType',
          'expenseSheetExpenses.expense.project',
          'project',
        ],
        where: { createdBy: authId },
      });

      if (!expenseSheetObj) {
        throw new Error('Expense sheet not found');
      }

      let expenseSheetExpensesToApprove = await transactionalEntityManager.find(
        ExpenseSheetExpense,
        {
          where: { id: In(expenseSheetApproveDTO.expenses), sheetId: id },
          relations: ['expense', 'expense.project'],
        }
      );

      let expenseSheetExpensesToReject = await transactionalEntityManager.find(
        ExpenseSheetExpense,
        {
          where: { id: Not(In(expenseSheetApproveDTO.expenses)), sheetId: id },
          relations: ['expense', 'expense.project'],
        }
      );

      for (let expense of expenseSheetExpensesToApprove) {
        if (!expense.expense.submittedAt) {
          throw new Error('Sheet Not Submitted');
        }

        if (expense.expense.approvedAt) {
          throw new Error('Sheet already approved');
        }

        expense.expense.approvedAt = moment().toDate();
        expense.expense.approvedBy = authId;
        transactionalEntityManager.save(Expense, expense.expense);
      }

      for (let expense of expenseSheetExpensesToReject) {
        if (!expense.expense.submittedAt) {
          throw new Error('Sheet Not Submitted');
        }

        if (expense.expense.approvedAt) {
          throw new Error('Sheet already approved');
        }

        expense.expense.rejectedAt = moment().toDate();
        expense.expense.rejectedBy = authId;
        transactionalEntityManager.save(Expense, expense.expense);
      }

      expenseSheetObj.isBillable = expenseSheetApproveDTO.isBillable
        ? true
        : false;
      expenseSheetObj.notes = expenseSheetApproveDTO.notes;

      let sheet = await transactionalEntityManager.save(expenseSheetObj);

      return sheet.id;
    });

    let sheet = await this._findOneCustom(authId, id);

    return new ExpenseSheetResponse(sheet);
  }

  async rejectExpenseSheet(
    authId: number,
    id: number,
    expenseSheetRejectDTO: ExpenseSheetApproveDTO
  ): Promise<any | undefined> {
    await this.manager.transaction(async (transactionalEntityManager) => {
      let expenseSheetObj = await this.findOne(id, {
        relations: [
          'expenseSheetExpenses',
          'expenseSheetExpenses.expense',
          'expenseSheetExpenses.expense.expenseType',
          'expenseSheetExpenses.expense.project',
          'project',
        ],
        where: { createdBy: authId },
      });

      if (!expenseSheetObj) {
        throw new Error('Expense sheet not found');
      }

      let expenseSheetExpensesToApprove = await transactionalEntityManager.find(
        ExpenseSheetExpense,
        {
          where: { id: Not(In(expenseSheetRejectDTO.expenses)), sheetId: id },
          relations: ['expense', 'expense.project'],
        }
      );

      let expenseSheetExpensesToReject = await transactionalEntityManager.find(
        ExpenseSheetExpense,
        {
          where: { id: In(expenseSheetRejectDTO.expenses), sheetId: id },
          relations: ['expense', 'expense.project'],
        }
      );

      for (let expense of expenseSheetExpensesToApprove) {
        if (!expense.expense.submittedAt) {
          throw new Error('Sheet Not Submitted');
        }

        if (expense.expense.approvedAt) {
          throw new Error('Sheet already approved');
        }

        expense.expense.approvedAt = moment().toDate();
        expense.expense.approvedBy = authId;
        transactionalEntityManager.save(Expense, expense.expense);
      }

      for (let expense of expenseSheetExpensesToReject) {
        if (!expense.expense.submittedAt) {
          throw new Error('Sheet Not Submitted');
        }

        if (expense.expense.approvedAt) {
          throw new Error('Sheet already approved');
        }

        expense.expense.rejectedAt = moment().toDate();
        expense.expense.rejectedBy = authId;
        transactionalEntityManager.save(Expense, expense.expense);
      }

      expenseSheetObj.isBillable = expenseSheetRejectDTO.isBillable
        ? true
        : false;
      expenseSheetObj.notes = expenseSheetRejectDTO.notes;

      let sheet = await transactionalEntityManager.save(expenseSheetObj);

      return sheet.id;
    });

    let sheet = await this._findOneCustom(authId, id);

    return new ExpenseSheetResponse(sheet);
  }

  async submitExpenseSheets(
    authId: number,
    expenseSheetsSubmitDTO: ExpenseSheetsSubmitDTO
  ): Promise<any | undefined> {
    await this.manager.transaction(async (transactionalEntityManager) => {
      let expenseSheets = await this._findManyCustom({
        where: { id: In(expenseSheetsSubmitDTO.sheets) },
      });

      if (!expenseSheets.length) {
        throw new Error('Expense sheet not found');
      }

      for (let sheet of expenseSheets) {
        for (let expense of sheet.expenseSheetExpenses) {
          if (expense.expense.submittedAt || expense.expense.approvedAt) {
            throw new Error('Already Submitted');
          }
          expense.expense.rejectedAt = null;
          expense.expense.submittedAt = moment().toDate();
          expense.expense.submittedBy = authId;
          transactionalEntityManager.save(Expense, expense.expense);
        }

        sheet.isBillable = expenseSheetsSubmitDTO.isBillable ? true : false;
        sheet.notes = expenseSheetsSubmitDTO.notes;

        let expenseSheet = await transactionalEntityManager.save(sheet);
      }
    });

    let expenseSheets = await this._findManyCustom({
      where: { id: In(expenseSheetsSubmitDTO.sheets) },
    });

    return new ExpenseSheetsResponse(expenseSheets);
  }

  async approveExpenseSheets(
    authId: number,
    expenseSheetsApproveDTO: ExpenseSheetsApproveDTO
  ): Promise<any | undefined> {
    await this.manager.transaction(async (transactionalEntityManager) => {
      let expenseSheets = await this._findManyCustom({
        where: { id: In(expenseSheetsApproveDTO.sheets) },
      });

      if (!expenseSheets.length) {
        throw new Error('Expense sheet not found');
      }

      for (let sheet of expenseSheets) {
        for (let expense of sheet.expenseSheetExpenses) {
          if (!expense.expense.submittedAt) {
            throw new Error('Sheet Not Submitted');
          }

          if (expense.expense.approvedAt) {
            throw new Error('Sheet already approved');
          }

          expense.expense.approvedAt = moment().toDate();
          expense.expense.approvedBy = authId;
          transactionalEntityManager.save(Expense, expense.expense);
        }

        sheet.isBillable = expenseSheetsApproveDTO.isBillable ? true : false;
        sheet.notes = expenseSheetsApproveDTO.notes;

        let expenseSheet = await transactionalEntityManager.save(sheet);
      }
    });

    let expenseSheets = await this._findManyCustom({
      where: { id: In(expenseSheetsApproveDTO.sheets) },
    });

    return new ExpenseSheetsResponse(expenseSheets);
  }

  async rejectExpenseSheets(
    authId: number,
    expenseSheetsRejectDTO: ExpenseSheetsRejectDTO
  ): Promise<any | undefined> {
    await this.manager.transaction(async (transactionalEntityManager) => {
      let expenseSheets = await this._findManyCustom({
        where: { id: In(expenseSheetsRejectDTO.sheets) },
      });

      if (!expenseSheets.length) {
        throw new Error('Expense sheet not found');
      }

      for (let sheet of expenseSheets) {
        for (let expense of sheet.expenseSheetExpenses) {
          if (!expense.expense.submittedAt) {
            throw new Error('Sheet Not Submitted');
          }

          if (expense.expense.approvedAt) {
            throw new Error('Sheet already approved');
          }

          expense.expense.rejectedAt = moment().toDate();
          expense.expense.rejectedBy = authId;
          transactionalEntityManager.save(Expense, expense.expense);
        }

        sheet.isBillable = expenseSheetsRejectDTO.isBillable ? true : false;
        sheet.notes = expenseSheetsRejectDTO.notes;

        let expenseSheet = await transactionalEntityManager.save(sheet);
      }
    });

    let expenseSheets = await this._findManyCustom({
      where: { id: In(expenseSheetsRejectDTO.sheets) },
    });

    return new ExpenseSheetsResponse(expenseSheets);
  }

  async _findOneCustom(authId: number, id: number): Promise<any | undefined> {
    let result = await this.findOne(id, {
      where: { createdBy: authId },
      relations: [
        'expenseSheetExpenses',
        'expenseSheetExpenses.expense',
        'expenseSheetExpenses.expense.expenseType',
        'expenseSheetExpenses.expense.project',
        'project',
        'attachments',
        'attachments.file',
      ],
    });

    return result;
  }

  async _findManyCustom(options: {}): Promise<ExpenseSheet[] | []> {
    let results = await this.find({
      ...options,
      relations: [
        'expenseSheetExpenses',
        'expenseSheetExpenses.expense',
        'expenseSheetExpenses.expense.expenseType',
        'expenseSheetExpenses.expense.project',
        'project',
        'attachments',
        'attachments.file',
      ],
    });

    return results;
  }
}
