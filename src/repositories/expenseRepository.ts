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
import { AttachmentsResponse } from '../responses/attachmentResponses';

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

          this._validateExpenseDates(expenseDTO.date, project);

          expenseObj.project = project;
        }

        // expenseObj.projectId = expenseDTO.projectId;

        expenseObj.createdBy = authId;

        let expense = await transactionalEntityManager.save(expenseObj);

        for (const file of expenseDTO.attachments) {
          let attachmentObj = new Attachment();
          attachmentObj.fileId = file;
          attachmentObj.targetId = expense.id;
          attachmentObj.targetType = EntityType.EXPENSE;
          attachmentObj.userId = authId;
          let attachment = await transactionalEntityManager.save(attachmentObj);
        }

        return expense.id;
      }
    );

    let expense = await this._findOneCustom(authId, id);

    return new ExpenseResponse(expense);
  }

  async getAllActive(): Promise<any[]> {
    let results = await this._findManyCustom({});
    return new ExpensesResponse(results).expenses;
  }

  async getOwnActive(authId: number): Promise<any[]> {
    let results = await this._findManyCustom({ where: { createdBy: authId } });

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

    let results = await this._findManyCustom({
      where: { projectId: In(projectIds) },
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

    let results = await this._findManyCustom({
      where: [{ projectId: In(projectIds) }, { createdBy: authId }],
    });

    return new ExpensesResponse(results).expenses;
  }

  async getAvailableAllActive(id: number): Promise<any[]> {
    let results = await this._findManyCustom({});

    let availableExpenses: Expense[] = [];

    results.forEach((expense) => {
      if (
        expense.rejectedAt !== null ||
        !expense.entries.length ||
        expense.entries.filter((e) => e.sheetId == id).length
      ) {
        availableExpenses.push(expense);
      }
    });

    return new ExpensesResponse(availableExpenses).expenses;
  }

  async getAvailableOwnActive(authId: number, id: number): Promise<any[]> {
    let results = await this._findManyCustom({
      where: { createdBy: authId },
    });

    let availableExpenses: Expense[] = [];

    results.forEach((expense) => {
      if (
        expense.rejectedAt !== null ||
        !expense.entries.length ||
        expense.entries.filter((e) => e.sheetId == id).length
      ) {
        availableExpenses.push(expense);
      }
    });

    // return new ExpensesResponse(results);

    return new ExpensesResponse(availableExpenses).expenses;
  }

  async getAvailableManageActive(authId: number, id: number): Promise<any[]> {
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

    let availableExpenses: Expense[] = [];

    results.forEach((expense) => {
      if (
        expense.rejectedAt !== null ||
        !expense.entries.length ||
        expense.entries.filter((e) => e.sheetId == id).length
      ) {
        availableExpenses.push(expense);
      }
    });

    return new ExpensesResponse(availableExpenses).expenses;
  }

  async getAvailableOwnAndManageActive(
    authId: number,
    id: number
  ): Promise<any[]> {
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

    let availableExpenses: Expense[] = [];

    results.forEach((expense) => {
      if (
        expense.rejectedAt !== null ||
        !expense.entries.length ||
        expense.entries.filter((e) => e.sheetId == id).length
      ) {
        availableExpenses.push(expense);
      }
    });

    return new ExpensesResponse(availableExpenses).expenses;
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
      let expenseObj = await this.findOne(id, {
        where: { createdBy: authId },
        relations: ['entries', 'entries.sheet'],
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

        this._validateExpenseDates(expenseDTO.date, project);
      }

      if (!expenseObj.rejectedAt && expenseObj.entries.length > 0) {
        if (
          expenseObj.entries[expenseObj.entries.length - 1].sheet.projectId !==
          expenseDTO.projectId
        ) {
          throw new Error('Assigned in sheet with different project');
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

      console.log(expenseObj);
      let expense = await transactionalEntityManager.save(expenseObj);

      return expense.id;
    });

    let expense = await this._findOneCustom(authId, id);

    return new ExpenseResponse(expense);
  }

  async deleteCustom(authId: number, id: number): Promise<any | undefined> {
    return this.manager.transaction(async (transactionalEntityManager) => {
      let expense = await transactionalEntityManager.findOne(Expense, id, {
        relations: [
          'entries',
          'entries.sheet',
          'entries.sheet.expenseSheetExpenses',
        ],
        where: { createdBy: authId },
      });

      if (!expense) {
        throw new Error('Expense not found');
      }

      if (!expense.rejectedAt && expense.entries.length > 0) {
        throw new Error('Expense is in sheet');
      }

      if (
        expense?.entries[expense.entries.length - 1]?.sheet?.expenseSheetExpenses
          ?.length == 1
      ) {
        throw new Error('Sheet has only one expense');
      }

      if (expense.entries.length)
        await transactionalEntityManager.softDelete(Expense, expense.entries);

      await transactionalEntityManager.softRemove(Expense, expense);

      return expense;
    });
  }

  async _findOneCustom(authId: number, id: number): Promise<Expense> {
    let result = await this.findOne(id, {
      where: { createdBy: authId },
      relations: ['expenseType', 'project', 'entries'],
    });

    if (!result) {
      throw new Error('Expense not found');
    }

    return this._getOneAttachment(result);
  }

  async _findManyCustom(options: {}): Promise<Expense[] | []> {
    let results = await this.find({
      ...options,
      relations: ['expenseType', 'project', 'entries'],
      order: { id: 'ASC' },
    });

    return this._getAttachments(results);
  }

  _validateExpenseDates(date: Date, project: Opportunity) {
    if (!project.startDate) {
      throw new Error('Project start date is not set');
    }
    if (!project.endDate) {
      throw new Error('Project end date is not set');
    }

    if (
      !moment(date, 'YYYY-MM-DD').isBetween(
        project.startDate,
        project.endDate,
        'date',
        '[]'
      )
    ) {
      throw new Error('Expense is out of project Dates');
    }
  }

  async _getOneAttachment(result: Expense ): Promise<Expense>{

    let attachments = await this.manager.find(Attachment,{
      where: { targetType: EntityType.EXPENSE, targetId: result.id },
      relations: ['file'],
    })

    let expense: Expense & { attachments: Attachment[] } = {
      ...result,
      attachments: attachments || [],
    };
    
    return expense
  }

  async _getAttachments(results: Expense[]): Promise<Expense[]>{
    let resultIds = results.map((el: any)=> el.id)

    let attachments = await this.manager.find(Attachment,{
      where: { targetType: EntityType.EXPENSE, targetId: In(resultIds) },
      relations: ['file'],
    })

    let attachmentObj : {[key: number]: Attachment[]} ={}
    
    attachments.forEach((el:any)=>{
      if (attachmentObj?.[el.targetId]){
        attachmentObj[el.targetId].push(el)
      }else{
        attachmentObj[el.targetId] = [el]
      }
    })

    results.map((el:any)=>{
      el.attachments = attachmentObj[el.id] || []
      return el
    })

    return results
  }

}
