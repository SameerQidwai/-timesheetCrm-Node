import {
  ProjectDTO,
  ProjectResourceDTO,
  PurchaseOrderDTO,
  MilestoneDTO,
  MilestoneUploadDTO,
  MilestoneExpenseDTO,
  ExpenseSheetDTO,
} from '../dto';
import {
  EntityRepository,
  In,
  IsNull,
  LessThanOrEqual,
  MoreThanOrEqual,
  Not,
  Repository,
} from 'typeorm';
import { Organization } from './../entities/organization';
import { Opportunity } from './../entities/opportunity';
import { Panel } from './../entities/panel';
import { State } from './../entities/state';
import { ContactPerson } from './../entities/contactPerson';
import { OpportunityResource } from './../entities/opportunityResource';
import { OpportunityResourceAllocation } from '../entities/opportunityResourceAllocation';
import { Employee } from '../entities/employee';
import { PurchaseOrder } from '../entities/purchaseOrder';
import { Milestone } from '../entities/milestone';
import { Attachment } from '../entities/attachment';
import { Comment } from '../entities/comment';
import moment, { Moment, parseTwoDigitYear } from 'moment';
import { LeaveRequest } from '../entities/leaveRequest';
import { TimesheetMilestoneEntry } from '../entities/timesheetMilestoneEntry';

import { EntityType, ProjectType } from '../constants/constants';

import { ExpenseSheet } from '../entities/expenseSheet';

@EntityRepository(ExpenseSheet)
export class ExpenseSheetRepository extends Repository<ExpenseSheet> {
  async createAndSave(project: ExpenseSheetDTO): Promise<any> {
    let id: number;
    id = await this.manager.transaction(async (transactionalEntityManager) => {
      let projectObj = new Opportunity();
      projectObj.title = project.title;
      if (project.startDate) {
        projectObj.startDate = new Date(project.startDate);
      } else {
        throw new Error('Start date is required in project');
      }
      if (project.endDate) {
        projectObj.endDate = new Date(project.endDate);
      } else {
        throw new Error('End date is required in project');
      }
      if (project.entryDate) {
        projectObj.entryDate = new Date(project.entryDate);
      }
      projectObj.qualifiedOps = project.qualifiedOps ? true : false;
      projectObj.value = project.value;
      projectObj.type = project.type;
      projectObj.tender = project.tender;
      projectObj.tenderNumber = project.tenderNumber;
      projectObj.hoursPerDay = project.hoursPerDay;
      projectObj.cmPercentage = project.cmPercentage;
      projectObj.stage = project.stage;
      projectObj.linkedWorkId = project.linkedWorkId;

      // validate organization
      let organization: Organization | undefined;
      if (project.organizationId) {
        organization = await this.manager.findOne(
          Organization,
          project.organizationId
        );
        if (!organization) {
          throw new Error('Organization not found');
        }
        projectObj.organizationId = organization.id;
      }

      // validate panel
      let panel: Panel | undefined;
      if (project.panelId) {
        panel = await this.manager.findOne(Panel, project.panelId);
        if (!panel) {
          throw new Error('Panel not found');
        }
        projectObj.panelId = panel.id;
      }

      let contactPerson: ContactPerson | undefined;
      if (project.contactPersonId) {
        contactPerson = await this.manager.findOne(
          ContactPerson,
          project.contactPersonId
        );
        if (!contactPerson) {
          throw new Error('Contact Person not found');
        }
        projectObj.contactPersonId = contactPerson.id;
      }

      let state: State | undefined;
      if (project.stateId) {
        state = await this.manager.findOne(State, project.stateId);
        if (!state) {
          throw new Error('State not found');
        }
        projectObj.stateId = state.id;
      }

      let accountDirector: Employee | undefined;
      if (project.accountDirectorId) {
        accountDirector = await this.manager.findOne(
          Employee,
          project.accountDirectorId
        );
        if (!accountDirector) {
          throw new Error('Account Director not found');
        }
        projectObj.accountDirectorId = accountDirector.id;
      }
      // projectObj.accountDirectorId = 1;

      let accountManager: Employee | undefined;
      if (project.accountManagerId) {
        accountManager = await this.manager.findOne(
          Employee,
          project.accountManagerId
        );
        if (!accountManager) {
          throw new Error('Account Manager not found');
        }
        projectObj.accountManagerId = accountManager.id;
      }
      // projectObj.accountManagerId = 1;

      let projectManager: Employee | undefined;
      if (project.projectManagerId) {
        projectManager = await this.manager.findOne(
          Employee,
          project.projectManagerId
        );
        if (!projectManager) {
          throw new Error('project Manager not found');
        }
        projectObj.projectManagerId = projectManager.id;
      }
      // projectObj.projectManagerId = 1;

      projectObj.status = 'P';

      let newProject = await transactionalEntityManager.save(projectObj);

      //CREATING BASE MILESTONE
      let milestoneObj = new Milestone();
      milestoneObj.title = 'Default Milestone';
      milestoneObj.description = '-';
      milestoneObj.startDate = newProject.startDate;
      milestoneObj.endDate = newProject.endDate;
      milestoneObj.isApproved = false;
      milestoneObj.projectId = newProject.id;
      milestoneObj.progress = 0;

      let newMilestone = await transactionalEntityManager.save(
        Milestone,
        milestoneObj
      );

      return newProject.id;
    });
    return await this.findOneCustom(id);
  }

  async getAllActive(): Promise<any[]> {
    let response: any = [];

    let result = await this.find({
      where: [{ status: 'P' }, { status: 'C' }],
      relations: [
        'milestones',
        'organization',
        'opportunityResources',
        'opportunityResources.panelSkill',
        'opportunityResources.panelSkillStandardLevel',
        'opportunityResources.opportunityResourceAllocations',
        'opportunityResources.opportunityResourceAllocations.contactPerson',
      ],
    });

    return result;
  }

  async getOwnActive(userId: number): Promise<any[]> {
    let response: any = [];

    let result = await this.find({
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

    console.log('this ran');
    result.map((project, index) => {
      let add_flag = 0;
      project.opportunityResources.map((resource) => {
        resource.opportunityResourceAllocations.filter((allocation) => {
          if (
            allocation.contactPersonId === userId &&
            allocation.isMarkedAsSelected
          ) {
            add_flag = 1;
          }
        });
      });
      if (add_flag === 1) response.push(project);
    });

    return response;
  }

  async getManageActive(userId: number): Promise<any[]> {
    let result = await this.find({
      where: [
        {
          status: 'P',
          accountDirectorId: userId,
        },
        {
          status: 'P',
          accountManagerId: userId,
        },
        {
          status: 'P',
          projectManagerId: userId,
        },
        {
          status: 'C',
          accountDirectorId: userId,
        },
        {
          status: 'C',
          accountManagerId: userId,
        },
        {
          status: 'C',
          projectManagerId: userId,
        },
      ],
      relations: [
        'organization',
        'opportunityResources',
        'opportunityResources.panelSkill',
        'opportunityResources.panelSkillStandardLevel',
        'opportunityResources.opportunityResourceAllocations',
        'opportunityResources.opportunityResourceAllocations.contactPerson',
      ],
    });

    return result;
  }

  async getOwnAndManageActive(userId: number): Promise<any[]> {
    let response: any = [];
    let result = await this.find({
      where: [
        {
          status: 'P',
          accountDirectorId: userId,
        },
        {
          status: 'P',
          accountManagerId: userId,
        },
        {
          status: 'P',
          projectManagerId: userId,
        },
        {
          status: 'C',
          accountDirectorId: userId,
        },
        {
          status: 'C',
          accountManagerId: userId,
        },
        {
          status: 'C',
          projectManagerId: userId,
        },
      ],
      relations: [
        'organization',
        'opportunityResources',
        'opportunityResources.panelSkill',
        'opportunityResources.panelSkillStandardLevel',
        'opportunityResources.opportunityResourceAllocations',
        'opportunityResources.opportunityResourceAllocations.contactPerson',
      ],
    });

    result.map((project, index) => {
      let add_flag = 0;
      project.opportunityResources.map((resource) => {
        resource.opportunityResourceAllocations.filter((allocation) => {
          if (
            allocation.contactPersonId === userId &&
            allocation.isMarkedAsSelected
          ) {
            add_flag = 1;
          }
        });
      });
      if (add_flag === 1) response.push(project);
    });

    return response;
  }

  async findOneCustom(id: number): Promise<any | undefined> {
    let project = await this.findOne(id, {
      relations: [
        'organization',
        'contactPerson',
        'milestones',
        'milestones.expenses',
        'milestones.opportunityResources',
        'milestones.opportunityResources.opportunityResourceAllocations',
      ],
    });

    if (!project) {
      throw new Error('Project not found');
    }

    let value = 0;

    project.milestones.forEach((milestone) => {
      milestone.opportunityResources.forEach((resource) => {
        resource.opportunityResourceAllocations.forEach((allocation) => {
          if (allocation.isMarkedAsSelected)
            value +=
              parseFloat(allocation.sellingRate as any) *
              parseInt(resource.billableHours as any);
        });
      });
      milestone.expenses.forEach((expense) => {
        value += parseFloat(expense.sellingRate as any);
      });
    });

    (project as Opportunity & { calculatedValue: number }).calculatedValue =
      value;

    return project;
  }

  async updateAndReturn(
    id: number,
    projectDTO: ExpenseSheetDTO
  ): Promise<any | undefined> {
    await this.manager.transaction(async (transactionalEntityManager) => {
      let projectObj = await transactionalEntityManager.findOne(
        Opportunity,
        id,
        { relations: ['organization', 'milestones'] }
      );

      if (!projectObj) {
        throw new Error('Project not found');
      }

      projectObj.title = projectDTO.title;

      let milestones = await transactionalEntityManager.find(Milestone, {
        where: {
          startDate: Not(IsNull()),
          endDate: Not(IsNull()),
          projectId: id,
        },
        relations: ['project'],
      });
      let milestoneIds = milestones.map((milestone) => milestone.id);

      let resources = await transactionalEntityManager.find(
        OpportunityResource,
        {
          where: {
            startDate: Not(IsNull()),
            endDate: Not(IsNull()),
            milestoneId: In(milestoneIds),
          },
        }
      );

      let timesheetMilestoneEntries = await transactionalEntityManager.find(
        TimesheetMilestoneEntry,
        {
          where: { milestoneId: In(milestoneIds) },
          relations: ['timesheet', 'entries'],
        }
      );

      let leaveRequests = await transactionalEntityManager.find(LeaveRequest, {
        where: { workId: projectObj.id },
        relations: ['entries'],
      });

      if (projectDTO.startDate || projectDTO.endDate) {
        this._validateProjectDates(
          projectDTO.startDate,
          projectDTO.endDate,
          milestones,
          resources,
          timesheetMilestoneEntries,
          leaveRequests
        );
      }

      if (projectDTO.startDate) {
        projectObj.startDate = new Date(projectDTO.startDate);
        if (projectDTO.type == ProjectType.TIME_BASE) {
          projectObj.milestones[0].startDate = new Date(projectDTO.startDate);
        }
      } else {
        throw new Error('Project start date Cannot be null');
      }
      if (projectDTO.endDate) {
        projectObj.endDate = new Date(projectDTO.endDate);
        if (projectDTO.type == ProjectType.TIME_BASE) {
          projectObj.milestones[0].endDate = new Date(projectDTO.endDate);
        }
      } else {
        throw new Error('Project end date Cannot be null');
      }
      if (projectDTO.entryDate) {
        projectObj.entryDate = new Date(projectDTO.entryDate);
      }
      projectObj.qualifiedOps = projectDTO.qualifiedOps ? true : false;
      projectObj.value = projectDTO.value;
      //! REMOVING CAUSE OF MILESTONE ADD AND REMOVE
      // projectObj.type = projectDTO.type;
      projectObj.tender = projectDTO.tender;
      projectObj.tenderNumber = projectDTO.tenderNumber;
      projectObj.hoursPerDay = projectDTO.hoursPerDay;
      projectObj.cmPercentage = projectDTO.cmPercentage;
      projectObj.stage = projectDTO.stage;
      projectObj.linkedWorkId = projectDTO.linkedWorkId;

      // validate organization
      let organization: Organization | undefined;
      if (projectDTO.organizationId) {
        organization = await this.manager.findOne(
          Organization,
          projectDTO.organizationId
        );
        if (!organization) {
          throw new Error('Organization not found');
        }
        projectObj.organizationId = organization.id;
      }

      // validate panel
      let panel: Panel | undefined;
      if (projectDTO.panelId) {
        panel = await this.manager.findOne(Panel, projectDTO.panelId);
        if (!panel) {
          throw new Error('Panel not found');
        }
        projectObj.panelId = panel.id;
      }

      let contactPerson: ContactPerson | undefined;
      if (projectDTO.contactPersonId == null) {
        projectObj.contactPersonId = null;
      } else if (projectDTO.contactPersonId) {
        contactPerson = await this.manager.findOne(
          ContactPerson,
          projectDTO.contactPersonId
        );
        if (!contactPerson) {
          throw new Error('Contact Person not found');
        }
        projectObj.contactPersonId = contactPerson.id;
      }

      let state: State | undefined;
      if (projectDTO.stateId) {
        state = await this.manager.findOne(State, projectDTO.stateId);
        if (!state) {
          throw new Error('State not found');
        }
        projectObj.stateId = state.id;
      }

      let accountDirector: Employee | undefined;
      if (projectDTO.accountDirectorId) {
        accountDirector = await this.manager.findOne(
          Employee,
          projectDTO.accountDirectorId
        );
        if (!accountDirector) {
          throw new Error('Account Director not found');
        }
        projectObj.accountDirectorId = accountDirector.id;
      }
      //   projectObj.accountDirectorId = 1;

      let accountManager: Employee | undefined;
      if (projectDTO.accountManagerId) {
        accountManager = await this.manager.findOne(
          Employee,
          projectDTO.accountManagerId
        );
        if (!accountManager) {
          throw new Error('Account Manager not found');
        }
        projectObj.accountManagerId = accountManager.id;
      }
      //   projectObj.accountManagerId = 1;

      let projectManager: Employee | undefined;
      if (projectDTO.projectManagerId) {
        projectManager = await this.manager.findOne(
          Employee,
          projectDTO.projectManagerId
        );
        if (!projectManager) {
          throw new Error('project Manager not found');
        }
        projectObj.projectManagerId = projectManager.id;
      }
      //   projectObj.projectManagerId = 1;

      await transactionalEntityManager.save(projectObj);
    });
    return this.findOneCustom(id);
  }

  async deleteCustom(id: number): Promise<any | undefined> {
    await this.manager.transaction(async (transactionalEntityManager) => {
      let project = await transactionalEntityManager.findOne(Opportunity, id, {
        relations: [
          'purchaseOrders',
          'milestones',
          'milestones.timesheetMilestoneEntries',
          'milestones.opportunityResources',
          'leaveRequests',
        ],
      });

      if (!project) {
        throw new Error('Project not found');
      }

      let linkedOpportunities = await transactionalEntityManager.find(
        Opportunity,
        {
          where: { linkedWorkId: id },
        }
      );

      for (let milestone of project.milestones) {
        if (milestone.timesheetMilestoneEntries.length > 0) {
          throw new Error('Project has Timesheet Entries');
        }
      }

      if (project.leaveRequests.length > 0) {
        throw new Error('Project has Leave Request entries');
      }

      if (linkedOpportunities.length > 0) {
        throw new Error('Project is linked to other Opportunity / Project');
      }

      if (project.purchaseOrders.length > 0)
        await transactionalEntityManager.softDelete(
          PurchaseOrder,
          project.purchaseOrders
        );

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

      await transactionalEntityManager.softRemove(Opportunity, project);
    });
  }
}
