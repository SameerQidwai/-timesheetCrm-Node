import {
  ExpenseSheetApproveDTO,
  ExpenseSheetBillableDTO,
  ExpenseSheetDTO,
  ExpenseSheetsApproveDTO,
  ExpenseSheetsRejectDTO,
  ExpenseSheetsSubmitDTO,
} from '../dto';
import {
  Between,
  EntityRepository,
  In,
  MoreThan,
  MoreThanOrEqual,
  Not,
  Repository,
} from 'typeorm';
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
import {
  EntityType,
  ExpenseStatus,
  NotificationEventType,
  OpportunityStatus,
} from '../constants/constants';
import moment from 'moment-timezone';
import { NotificationManager } from '../utilities/notifier';

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

        let sheet = await transactionalEntityManager.save(expenseSheetObj);

        for (let id of expenseSheetDTO.expenseSheetExpenses) {
          let expense = await transactionalEntityManager.findOne(Expense, id, {
            relations: ['entries'],
          });

          if (!expense) {
            throw new Error('Expense not found');
          }

          if (
            expense.projectId !== expenseSheetObj.projectId &&
            expenseSheetObj.projectId != null
          ) {
            throw new Error('Sheet Project is different');
          }

          if (
            expense.getStatus != ExpenseStatus.REJECTED &&
            expense.entries.length
          ) {
            throw new Error('Expense already in sheet');
          }

          // if (expense.entries[expense.entries.length - 1].sheetId == id) {
          //   throw new Error('Expense already in same sheet');
          // }

          let expenseSheetExpenseObj = new ExpenseSheetExpense();

          expenseSheetExpenseObj.expenseId = expense.id;
          expenseSheetExpenseObj.sheetId = sheet.id;

          expenseSheetExpenses.push(expenseSheetExpenseObj);

          expense.activeExpenseSheetId = sheet.id;

          await transactionalEntityManager.save(Expense, expense);
        }

        expenseSheetObj.expenseSheetExpenses = expenseSheetExpenses;
        sheet = await transactionalEntityManager.save(expenseSheetObj);

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

  async getAllActive(
    startDate: string = moment().startOf('month').format('DD-MM-YYYY'),
    endDate: string = moment().endOf('month').format('DD-MM-YYYY'),
    projectId: number
  ): Promise<any[]> {
    let mStartDate = moment(startDate, 'DD-MM-YYYY');
    let mEndDate = moment(endDate, 'DD-MM-YYYY');

    let result = await this._findManyCustom({});

    let response: ExpenseSheet[] = [];

    result.forEach((sheet) => {
      if (
        moment(sheet.createdAt).isBetween(mStartDate, mEndDate, 'date', '[]')
      ) {
        if (!isNaN(projectId)) {
          if (sheet.projectId === projectId) {
            response.push(sheet);
          } else if (sheet.projectId === null && projectId === 0) {
            response.push(sheet);
          }
        } else {
          response.push(sheet);
        }
      }
    });

    return new ExpenseSheetsResponse(response).sheets;
  }

  async getOwnActive(
    authId: number,
    startDate: string = moment().startOf('month').format('DD-MM-YYYY'),
    endDate: string = moment().endOf('month').format('DD-MM-YYYY'),
    projectId: number
  ): Promise<any[]> {
    let mStartDate = moment(startDate, 'DD-MM-YYYY');
    let mEndDate = moment(endDate, 'DD-MM-YYYY');

    let results = await this._findManyCustom({
      where: { createdBy: authId },
    });

    let response: ExpenseSheet[] = [];

    results.forEach((sheet) => {
      if (
        moment(sheet.createdAt).isBetween(mStartDate, mEndDate, 'date', '[]')
      ) {
        if (!isNaN(projectId)) {
          if (sheet.projectId === projectId) {
            response.push(sheet);
          }
          if (sheet.projectId === null && projectId === 0) {
            response.push(sheet);
          }
        } else {
          response.push(sheet);
        }
      }
    });

    return new ExpenseSheetsResponse(response).sheets;
  }

  async getManageActive(
    authId: number,
    startDate: string = moment().startOf('month').format('DD-MM-YYYY'),
    endDate: string = moment().endOf('month').format('DD-MM-YYYY'),
    projectId: number
  ): Promise<any[]> {
    let mStartDate = moment(startDate, 'DD-MM-YYYY');
    let mEndDate = moment(endDate, 'DD-MM-YYYY');

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

    let response: ExpenseSheet[] = [];

    results.forEach((sheet) => {
      if (
        moment(sheet.createdAt).isBetween(mStartDate, mEndDate, 'date', '[]')
      ) {
        if (!isNaN(projectId)) {
          if (sheet.projectId === projectId) {
            response.push(sheet);
          }
          if (sheet.projectId === null && projectId === 0) {
            response.push(sheet);
          }
        } else {
          response.push(sheet);
        }
      }
    });

    return new ExpenseSheetsResponse(response).sheets;
  }

  async getOwnAndManageActive(
    authId: number,
    startDate: string = moment().startOf('month').format('DD-MM-YYYY'),
    endDate: string = moment().endOf('month').format('DD-MM-YYYY'),
    projectId: number
  ): Promise<any[]> {
    let mStartDate = moment(startDate, 'DD-MM-YYYY');
    let mEndDate = moment(endDate, 'DD-MM-YYYY');

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

    let response: ExpenseSheet[] = [];

    results.forEach((sheet) => {
      if (
        moment(sheet.createdAt).isBetween(mStartDate, mEndDate, 'date', '[]')
      ) {
        if (!isNaN(projectId)) {
          if (sheet.projectId === projectId) {
            response.push(sheet);
          }
          if (sheet.projectId === null && projectId === 0) {
            response.push(sheet);
          }
        } else {
          response.push(sheet);
        }
      }
    });

    return new ExpenseSheetsResponse(response).sheets;
  }

  async findOneCustom(authId: number, id: number): Promise<any | undefined> {
    let result = await this._findOneCustom(null, id);
    // console.log('==================SHOWING===============')
    // result.expenseSheetExpenses.map((el:any)=>{
    //     console.log(el.expenseId)
    //   })
    // console.log('==================SHOWING===============')
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
        if (expense.submittedAt || expense.approvedAt) {
          throw new Error('Cannot update Sheet');
        }
      }

      expenseSheetObj.label = expenseSheetDTO.label;

      if (expenseSheetDTO.projectId) {
        let project = await transactionalEntityManager.findOne(
          Opportunity,
          expenseSheetDTO.projectId,
          {
            where: {
              status: In([OpportunityStatus.WON, OpportunityStatus.COMPLETED]),
            },
          }
        );
        if (!project) {
          throw new Error('Project not found');
        }
      }
      expenseSheetObj.projectId = expenseSheetDTO.projectId;

      // for (let oldExpense of expenseSheetObj.expenseSheetExpenses) {
      //   oldExpense.expense.rejectedAt = null;
      //   oldExpense.expense.rejectedBy = null;
      //   oldExpense.expense.expenseSheetId = null;
      //   await transactionalEntityManager.save(Expense, oldExpense.expense);
      // }

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

        if (
          expense.projectId !== expenseSheetObj.projectId &&
          expenseSheetObj.projectId != null
        ) {
          throw new Error('Sheet Project is different');
        }

        if (
          expense.getStatus != ExpenseStatus.REJECTED &&
          expense.entries.length > 0
        ) {
          throw new Error('Expense already in sheet');
        }

        // if (expense.entries[expense.entries.length - 1].sheetId == id) {
        //   throw new Error('Expense already in same sheet');
        // }

        let expenseSheetExpenseObj = new ExpenseSheetExpense();

        expenseSheetExpenseObj.expenseId = expense.id;
        expenseSheetExpenseObj.sheetId = expenseSheetObj.id;

        expenseSheetExpenses.push(expenseSheetExpenseObj);

        expense.activeExpenseSheetId = expenseSheetObj.id;

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

  async updateAnyBillableAndReturn(
    authId: number,
    id: number,
    expenseSheetBillableDTO: ExpenseSheetBillableDTO
  ): Promise<any | undefined> {
    let expenseSheet = await this.findOne(id, {
      relations: [
        'expenseSheetExpenses',
        'expenseSheetExpenses.expense',
        'expenseSheetExpenses.expense.entries',
        'expenseSheetExpenses.expense.submitter',
        'expenseSheetExpenses.expense.submitter.contactPersonOrganization',
        'expenseSheetExpenses.expense.submitter.contactPersonOrganization.contactPerson',
        'expenseSheetExpenses.expense.expenseType',
        'expenseSheetExpenses.expense.project',
        'project',
      ],
    });

    if (!expenseSheet) {
      throw new Error('Expense not found');
    }

    if (expenseSheet.getStatus === ExpenseStatus.REJECTED) {
      throw new Error('Cannot update rejected sheet');
    }

    expenseSheet.isBillable = expenseSheetBillableDTO.isBillable ? true : false;
    await this.save(expenseSheet);

    return new ExpenseSheetResponse(expenseSheet);
  }

  async updateOwnBillableAndReturn(
    authId: number,
    id: number,
    expenseSheetBillableDTO: ExpenseSheetBillableDTO
  ): Promise<any | undefined> {
    let result = await this.findOne(id, {
      where: { createdBy: authId },
    });

    if (!result) {
      throw new Error('Expense not found');
    }

    if (result.getStatus === ExpenseStatus.REJECTED) {
      throw new Error('Cannot update rejected sheet');
    }

    result.isBillable = expenseSheetBillableDTO.isBillable ? true : false;
    await this.save(result);

    return new ExpenseSheetResponse(result);
  }

  async updateManageBillableAndReturn(
    authId: number,
    id: number,
    expenseSheetBillableDTO: ExpenseSheetBillableDTO
  ): Promise<any | undefined> {
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

    let result = await this.findOne(id, {
      where: { projectId: In(projectIds) },
    });

    if (!result) {
      throw new Error('Expense not found');
    }

    if (result.getStatus === ExpenseStatus.REJECTED) {
      throw new Error('Cannot update rejected sheet');
    }

    result.isBillable = expenseSheetBillableDTO.isBillable ? true : false;

    await this.save(result);

    return new ExpenseSheetResponse(result);
  }

  async updateOwnAndManageBillableAndReturn(
    authId: number,
    id: number,
    expenseSheetBillableDTO: ExpenseSheetBillableDTO
  ): Promise<any | undefined> {
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

    let result = await this.findOne(id, {
      where: [{ projectId: In(projectIds) }, { createdBy: authId }],
    });

    if (!result) {
      throw new Error('Expense not found');
    }

    if (result.getStatus === ExpenseStatus.REJECTED) {
      throw new Error('Cannot update rejected sheet');
    }

    result.isBillable = expenseSheetBillableDTO.isBillable ? true : false;

    await this.save(result);

    return new ExpenseSheetResponse(result);
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

      if (
        sheet.getStatus === ExpenseStatus.SUBMITTED ||
        sheet.getStatus === ExpenseStatus.APPROVED
      ) {
        throw new Error(
          'Cannt delete sheet with approved or submitted expenses'
        );
      }

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

      if (expenseSheetObj.getStatus === ExpenseStatus.APPROVED) {
        throw new Error('Sheet Already Approved');
      }

      if (expenseSheetObj.getStatus !== ExpenseStatus.SUBMITTED) {
        throw new Error('Sheet Not Submitted');
      }

      for (let expense of expenseSheetExpensesToApprove) {
        expense.approvedAt = moment().toDate();
        expense.approvedBy = authId;
        transactionalEntityManager.save(Expense, expense.expense);
      }

      for (let expense of expenseSheetExpensesToReject) {
        expense.rejectedAt = moment().toDate();
        expense.rejectedBy = authId;
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

      if (expenseSheetObj.getStatus === ExpenseStatus.APPROVED) {
        throw new Error('Sheet Already Approved');
      }

      if (expenseSheetObj.getStatus !== ExpenseStatus.SUBMITTED) {
        throw new Error('Sheet Not Submitted');
      }

      for (let expense of expenseSheetExpensesToApprove) {
        expense.approvedAt = moment().toDate();
        expense.approvedBy = authId;
        transactionalEntityManager.save(Expense, expense.expense);
      }

      for (let expense of expenseSheetExpensesToReject) {
        expense.rejectedAt = moment().toDate();
        expense.rejectedBy = authId;
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

      let emplyoee = await transactionalEntityManager.findOne(
        Employee,
        authId,
        {
          relations: [
            'contactPersonOrganization',
            'contactPersonOrganization.contactPerson',
          ],
        }
      );

      if (!emplyoee) {
        throw new Error('Employee not found');
      }

      for (let sheet of expenseSheets) {
        if (sheet.getStatus == ExpenseStatus.SUBMITTED) {
          throw new Error('Sheet already submitted');
        }

        for (let expense of sheet.expenseSheetExpenses) {
          if (
            expense.expense.getStatus == ExpenseStatus.APPROVED ||
            expense.expense.getStatus == ExpenseStatus.SUBMITTED
          ) {
            throw new Error('Expense is already submitted or approved');
          }

          expense.rejectedAt = null;
          expense.submittedAt = moment().toDate();

          expense.submitter = emplyoee;

          transactionalEntityManager.save(Expense, expense.expense);
        }

        sheet.notes = expenseSheetsSubmitDTO.notes;

        let expenseSheet = await transactionalEntityManager.save(sheet);

        if (sheet.projectId) {
          if (sheet.project.projectManagerId) {
            await NotificationManager.info(
              [sheet.project.projectManagerId],
              `Expense Sheet Submitted`,
              `An Expense sheet has been Submitted of Project ${sheet.project.title} by ${emplyoee.getFullName}`,
              `${process.env.ENV_URL}/expense-sheet-approval`,
              NotificationEventType.EXPENSE_SHEET_SUBMIT
            );
          }
        } else {
          await NotificationManager.info(
            [1],
            `Expense Sheet Submitted`,
            `An Expense sheet linked to no project has been Submitted by ${emplyoee.getFullName}`,
            `${process.env.ENV_URL}/expense-sheet-approval`,
            NotificationEventType.EXPENSE_SHEET_SUBMIT
          );
        }
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

      let emplyoee = await transactionalEntityManager.findOne(Employee, authId);

      if (!emplyoee) {
        throw new Error('Employee not found');
      }

      for (let sheet of expenseSheets) {
        if (sheet.getStatus === ExpenseStatus.APPROVED) {
          throw new Error('Sheet Already Approved');
        }

        if (sheet.getStatus !== ExpenseStatus.SUBMITTED) {
          throw new Error('Sheet Not Submitted');
        }

        for (let expense of sheet.expenseSheetExpenses) {
          expense.approvedAt = moment().toDate();

          expense.approver = emplyoee;

          transactionalEntityManager.save(Expense, expense.expense);
        }

        sheet.notes = expenseSheetsApproveDTO.notes;

        let expenseSheet = await transactionalEntityManager.save(sheet);

        await NotificationManager.success(
          [sheet.createdBy],
          `Expense Sheet Approved`,
          `Your Expense sheet with id ${sheet.id} has been Approved`,
          `${process.env.ENV_URL}/expense-sheets`,
          NotificationEventType.EXPENSE_SHEET_APPROVE
        );
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

      let emplyoee = await transactionalEntityManager.findOne(Employee, authId);

      if (!emplyoee) {
        throw new Error('Employee not found');
      }

      for (let sheet of expenseSheets) {
        if (sheet.getStatus === ExpenseStatus.APPROVED) {
          throw new Error('Sheet Already Approved');
        }

        if (sheet.getStatus !== ExpenseStatus.SUBMITTED) {
          throw new Error('Sheet Not Submitted');
        }

        for (let expense of sheet.expenseSheetExpenses) {
          expense.rejectedAt = moment().toDate();

          expense.rejecter = emplyoee;

          transactionalEntityManager.save(Expense, expense.expense);
        }

        sheet.notes = expenseSheetsRejectDTO.notes;

        let expenseSheet = await transactionalEntityManager.save(sheet);

        await NotificationManager.danger(
          [sheet.createdBy],
          `Expense Sheet Rejected`,
          `Your Expense sheet with id ${sheet.id} has been Rejected`,
          `${process.env.ENV_URL}/expense-sheets`,
          NotificationEventType.EXPENSE_SHEET_REJECT
        );
      }
    });

    let expenseSheets = await this._findManyCustom({
      where: { id: In(expenseSheetsRejectDTO.sheets) },
    });

    return new ExpenseSheetsResponse(expenseSheets);
  }

  async unApproveExpenseSheets(
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

      let emplyoee = await transactionalEntityManager.findOne(Employee, authId);

      if (!emplyoee) {
        throw new Error('Employee not found');
      }

      for (let sheet of expenseSheets) {
        if (sheet.getStatus !== ExpenseStatus.APPROVED) {
          throw new Error('Sheet Already Approved');
        }

        for (let expense of sheet.expenseSheetExpenses) {
          expense.approvedAt = null;
          expense.submittedAt = null;
          expense.rejectedAt = moment().toDate();

          expense.submitter = null;
          expense.approver = null;
          expense.rejecter = emplyoee;

          transactionalEntityManager.save(Expense, expense.expense);
        }

        sheet.notes = expenseSheetsApproveDTO.notes;

        let expenseSheet = await transactionalEntityManager.save(sheet);
      }
    });

    let expenseSheets = await this._findManyCustom({
      where: { id: In(expenseSheetsApproveDTO.sheets) },
    });

    return new ExpenseSheetsResponse(expenseSheets);
  }

  async _findOneCustom(
    authId: number | null = null,
    id: number
  ): Promise<any | undefined> {
    let whereCondition = authId ? { createdBy: authId } : {};

    let result = await this.findOne(id, {
      where: { ...whereCondition },
      relations: [
        'expenseSheetExpenses',
        'expenseSheetExpenses.expense',
        'expenseSheetExpenses.expense.entries',
        'expenseSheetExpenses.expense.creator',
        'expenseSheetExpenses.expense.creator.contactPersonOrganization',
        'expenseSheetExpenses.expense.creator.contactPersonOrganization.contactPerson',
        'expenseSheetExpenses.submitter',
        'expenseSheetExpenses.submitter.contactPersonOrganization',
        'expenseSheetExpenses.submitter.contactPersonOrganization.contactPerson',
        'expenseSheetExpenses.expense.expenseType',
        'expenseSheetExpenses.expense.project',
        'project',
      ],
    });
    if (!result) {
      throw new Error('Expense not found');
    }

    result.expenseSheetExpenses = await this._getAttachments(
      result.expenseSheetExpenses
    );

    return result;
  }

  async _findManyCustom(options: {}): Promise<ExpenseSheet[] | []> {
    let results = await this.find({
      ...options,
      relations: [
        'expenseSheetExpenses',
        'expenseSheetExpenses.expense',
        'expenseSheetExpenses.expense.entries',
        'expenseSheetExpenses.expense.creator',
        'expenseSheetExpenses.expense.creator.contactPersonOrganization',
        'expenseSheetExpenses.expense.creator.contactPersonOrganization.contactPerson',
        'expenseSheetExpenses.submitter',
        'expenseSheetExpenses.submitter.contactPersonOrganization',
        'expenseSheetExpenses.submitter.contactPersonOrganization.contactPerson',
        'expenseSheetExpenses.expense.expenseType',
        'expenseSheetExpenses.expense.project',
        'project',
      ],
    });

    return results;
  }

  async _getAttachments(
    expenseSheetExpenses: ExpenseSheetExpense[]
  ): Promise<Array<ExpenseSheetExpense & { attachments: Attachment[] | [] }>> {
    let resultIds = expenseSheetExpenses.map((el: any) => el.expenseId);

    let attachments = await this.manager.find(Attachment, {
      where: { targetType: EntityType.EXPENSE, targetId: In(resultIds) },
      relations: ['file'],
    });

    let attachmentObj: { [key: number]: Attachment[] } = {};
    attachments.forEach((el: Attachment) => {
      if (attachmentObj?.[el.targetId]) {
        attachmentObj[el.targetId].push(el);
      } else {
        attachmentObj[el.targetId] = [el];
      }
    });

    let expenses = expenseSheetExpenses.map((el: any) => {
      el.attachments = attachmentObj[el.expenseId] || [];
      return el;
    });

    return expenses;
  }
}
