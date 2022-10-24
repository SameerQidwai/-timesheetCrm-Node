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

@EntityRepository(Expense)
export class ExpenseRepository extends Repository<Expense> {
  async createAndSave(authId: number, expenseDTO: ExpenseDTO): Promise<any> {
    let expense = await this.manager.transaction(
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
          expenseObj.projectId = expenseDTO.projectId;
        }

        expenseObj.createdBy = authId;

        let expense = await transactionalEntityManager.save(expenseObj);

        return expense;
      }
    );
    return expense;
  }

  async getAllActive(): Promise<any[]> {
    let results = await this.find({
      relations: [],
    });

    // return new ExpensesResponse(results).expenses;

    return results;
  }

  async getOwnActive(authId: number): Promise<any[]> {
    let results = await this.find({
      where: { createdBy: authId },
      relations: [],
    });

    // return new ExpensesResponse(results);

    return results;
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

    let result = await this.find({
      where: { projectId: In(projectIds) },
      relations: [],
    });

    return result;
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

    let result = await this.find({
      where: [{ projectId: In(projectIds) }, { createdBy: authId }],
      relations: [],
    });

    return result;
  }

  async findOneCustom(authId: number, id: number): Promise<any | undefined> {
    let result = await this.findOne(id, {
      where: { createdBy: authId },
      relations: [],
    });

    return result;
  }

  async updateAndReturn(
    authId: number,
    id: number,
    expenseDTO: ExpenseDTO
  ): Promise<any | undefined> {
    let expense = await this.manager.transaction(
      async (transactionalEntityManager) => {
        let expenseObj = await this.findOne(id, {
          where: { createdBy: authId },
        });

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
          expenseObj.projectId = expenseDTO.projectId;
        }

        let expense = await transactionalEntityManager.save(expenseObj);

        return expense;
      }
    );
    return expense;
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
}
