import { AddExpenseDTO, ExpenseSheetDTO, RemoveExpenseDTO } from '../dto';
import { EntityRepository, In, Repository } from 'typeorm';
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
        }

        expenseSheetObj.expenseSheetExpenses = expenseSheetExpenses;

        let sheet = await transactionalEntityManager.save(expenseSheetObj);

        return sheet.id;
      }
    );

    let sheet = await this._findOneCustom(authId, id);

    return new ExpenseSheetResponse(sheet);
  }

  async getAllActive(): Promise<any[]> {
    let result = await this.find({
      relations: [
        'expenseSheetExpenses',
        'expenseSheetExpenses.expense',
        'project',
      ],
    });

    return new ExpenseSheetsResponse(result).sheets;
  }

  async getOwnActive(authId: number): Promise<any[]> {
    let results = await this.find({
      where: { createdBy: authId },
      relations: [
        'expenseSheetExpenses',
        'expenseSheetExpenses.expense',
        'project',
      ],
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

    let results = await this.find({
      where: { projectId: In(projectIds) },
      relations: [
        'expenseSheetExpenses',
        'expenseSheetExpenses.expense',
        'project',
      ],
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

    let results = await this.find({
      where: [{ projectId: In(projectIds) }, { createdBy: authId }],
      relations: [
        'expenseSheetExpenses',
        'expenseSheetExpenses.expense',
        'project',
      ],
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
        relations: ['expenseSheetExpenses', 'expenseSheetExpenses.expense'],
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
        expenseSheetObj.projectId = expenseSheetDTO.projectId;
      }

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
        relations: ['expenseSheetExpenses', 'expenseSheetExpenses.expense'],
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

  async addExpenses(
    authId: number,
    id: number,
    addExpenseDTO: AddExpenseDTO
  ): Promise<any | undefined> {
    return this.manager.transaction(async (transactionalEntityManager) => {
      let sheet = await this.findOne(id, {
        where: { createdBy: authId },
        relations: ['expenseSheetExpenses', 'expenseSheetExpenses.expense'],
      });

      if (!sheet) {
        throw new Error('Expense sheet not found');
      }

      for (let id of addExpenseDTO.expenses) {
        let expense = await transactionalEntityManager.findOne(Expense, id, {
          relations: ['entries'],
        });

        if (!expense) {
          throw new Error('Expense not found');
        }

        if (expense.projectId !== sheet.projectId) {
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
        expenseSheetExpenseObj.sheetId = sheet.id;

        await transactionalEntityManager.save(expenseSheetExpenseObj);
      }

      return sheet;

      // if (result.expenseSheetExpenses.length > 0)
      //   await transactionalEntityManager.softDelete(
      //     ExpenseSheetExpense,
      //     project.purchaseOrders
      //   );
    });
  }

  async removeExpenses(
    authId: number,
    id: number,
    removeExpensesDTO: RemoveExpenseDTO
  ): Promise<any | undefined> {
    return this.manager.transaction(async (transactionalEntityManager) => {
      let sheet = await this.findOne(id, {
        where: { createdBy: authId },
        relations: ['expenseSheetExpenses', 'expenseSheetExpenses.expense'],
      });

      if (!sheet) {
        throw new Error('Expense sheet not found');
      }

      let expensesToRemove: number[] = [];

      sheet.expenseSheetExpenses.forEach((expense, index) => {
        if (
          removeExpensesDTO.expenses.find(
            (removalExpense) => removalExpense == expense.expenseId
          )
        ) {
          expensesToRemove.push(expense.id);
        }
      });

      if (!expensesToRemove.length) {
        throw new Error('Unknown expense Ids');
      }

      await transactionalEntityManager.delete(
        ExpenseSheetExpense,
        expensesToRemove
      );

      return await this.findOne(id, {
        where: { createdBy: authId },
        relations: ['expenseSheetExpenses', 'expenseSheetExpenses.expense'],
      });

      // if (result.expenseSheetExpenses.length > 0)
      //   await transactionalEntityManager.softDelete(
      //     ExpenseSheetExpense,
      //     project.purchaseOrders
      //   );
    });
  }

  async _findOneCustom(authId: number, id: number): Promise<any | undefined> {
    let result = await this.findOne(id, {
      where: { createdBy: authId },
      relations: ['expenseSheetExpenses', 'expenseSheetExpenses.expense'],
    });

    return result;
  }
}
