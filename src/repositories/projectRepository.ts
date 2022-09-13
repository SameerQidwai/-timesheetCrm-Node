import {
  ProjectDTO,
  ProjectResourceDTO,
  PurchaseOrderDTO,
  MilestoneDTO,
  MilestoneUploadDTO,
  MilestoneExpenseDTO,
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
import { Timesheet } from '../entities/timesheet';
import moment, { Moment, parseTwoDigitYear } from 'moment';
import { LeaveRequest } from '../entities/leaveRequest';
import { TimesheetMilestoneEntry } from '../entities/timesheetMilestoneEntry';
import { MilestoneExpense } from '../entities/milestoneExpense';
import { Calendar } from '../entities/calendar';
import {
  EntityType,
  OpportunityStatus,
  ProjectType,
} from '../constants/constants';
import { File } from '../entities/file';
import { ExpenseType } from '../entities/expenseType';
import { number } from 'joi';
import { time } from 'console';

@EntityRepository(Opportunity)
export class ProjectRepository extends Repository<Opportunity> {
  async createAndSave(project: ProjectDTO): Promise<any> {
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

  async updateAndReturn(
    id: number,
    projectDTO: ProjectDTO
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

  async findOneCustomWithoutContactPerson(
    id: number
  ): Promise<any | undefined> {
    return this.findOne(id, {
      relations: ['organization'],
    });
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

  //-- MILESTONES

  async getAllActiveMilestones(projectId: number): Promise<any | undefined> {
    let project = await this.findOne(projectId, {
      relations: ['milestones'],
    });

    if (!project) {
      throw new Error('Project not found');
    }

    return project.milestones;
  }

  async getAllApprovalMilestones(
    projectId: number | null = null
  ): Promise<any | undefined> {
    let response: any = [];

    let whereCondition = {
      status: In([OpportunityStatus.WON, OpportunityStatus.COMPLETED]),
    };

    if (projectId) (whereCondition as any).id = projectId;

    let projects = await this.find({
      where: whereCondition,
      relations: ['milestones'],
    });

    let milestoneIds: number[] = [];

    projects.forEach((project) => {
      project.milestones.forEach((milestone) => {
        milestoneIds.push(milestone.id);
      });
    });

    for (let project of projects) {
      for (let milestone of project.milestones) {
        if (milestone.progress == 100) {
          let file: File | undefined = undefined;
          if (milestone.fileId) {
            file = await this.manager.findOne(File, milestone.fileId);
          }

          response.push({
            projectId: project.id,
            projectName: project.title,
            milestoneId: milestone.id,
            milestoneName: milestone.title,
            startDate: milestone.startDate,
            endDate: milestone.endDate,
            progress: milestone.progress,
            isApproved: milestone.isApproved,

            phase: project.phase,
            fileName: file?.uniqueName ?? null,
          });
        }
      }
    }

    return response;
  }

  async getManagerApprovalMilestones(
    authId: number,
    projectId: number | null = null
  ): Promise<any | undefined> {
    let response: any = [];

    let whereCondition = {
      status: In([OpportunityStatus.WON, OpportunityStatus.COMPLETED]),
      projectManagerId: authId,
    };
    if (projectId) (whereCondition as any).id = projectId;

    let projects = await this.find({
      where: whereCondition,
      relations: ['milestones'],
    });

    // let milestoneIds: number[] = [];

    // projects.forEach((project) => {
    //   if (project.projectManagerId == authId) {
    //     project.milestones.forEach((milestone) => {
    //       milestoneIds.push(milestone.id);
    //     });
    //   }
    // });

    // let attachments = await this.manager.find(Attachment, {
    //   where: { targetType: 'MIL', targetId: In(milestoneIds) },
    //   relations: ['file'],
    // });

    // let milestoneAttachments: Attachment[] = [];
    // attachments.forEach((attachment) => {
    //   milestoneAttachments[attachment.targetId] = attachment;
    // });

    for (let project of projects) {
      if (project.projectManagerId == authId) {
        for (let milestone of project.milestones) {
          if (milestone.progress == 100) {
            let file: File | undefined = undefined;
            if (milestone.fileId) {
              file = await this.manager.findOne(File, milestone.fileId);
            }
            response.push({
              projectId: project.id,
              projectName: project.title,
              milestoneId: milestone.id,
              milestoneName: milestone.title,
              startDate: milestone.startDate,
              endDate: milestone.endDate,
              progress: milestone.progress,
              isApproved: milestone.isApproved,
              phase: project.phase,
              fileName: file?.uniqueName ?? null,
            });
          }
        }
      }
    }

    return response;
  }

  async approveAnyMilestone(milestoneId: number): Promise<any | undefined> {
    let milestone = await this.manager.findOne(Milestone, milestoneId, {
      relations: ['project'],
    });

    if (!milestone) {
      throw new Error('Milestone not found');
    }

    milestone.isApproved = true;

    return this.manager.save(milestone);
  }

  async approveManageMilestone(
    authId: number,
    milestoneId: number
  ): Promise<any | undefined> {
    let milestone = await this.manager.findOne(Milestone, milestoneId, {
      relations: ['project'],
    });

    if (!milestone) {
      throw new Error('Milestone not found');
    }

    if (milestone.project.projectManagerId !== authId) {
      throw new Error('Not Authorized');
    }

    milestone.isApproved = true;

    return this.manager.save(milestone);
  }

  async exportAnyMilestone(milestoneId: number): Promise<any | undefined> {
    let milestone = await this.manager.findOne(Milestone, milestoneId, {
      relations: ['project', 'project.organization'],
    });

    if (!milestone) {
      throw new Error('Milestone not found');
    }

    let purchaseOrders = await this.manager.find(PurchaseOrder, {
      where: { projectId: milestone.projectId },
      order: { issueDate: 'DESC' },
    });

    let purchaseOrder = purchaseOrders[0];

    return {
      projectName: milestone.project.title,
      purchaseOrderNo: purchaseOrder?.orderNo ?? null,
      purchaseOrderDate: purchaseOrder?.issueDate ?? null,
      milestoneName: milestone.title,
      milestoneDesc: milestone.description,
      organizationName: milestone.project.organization.name,
    };
  }

  async exportManageMilestone(
    authId: number,
    milestoneId: number
  ): Promise<any | undefined> {
    let milestone = await this.manager.findOne(Milestone, milestoneId, {
      relations: ['project', 'project.organization'],
    });

    if (!milestone) {
      throw new Error('Milestone not found');
    }

    if (milestone.project.projectManagerId !== authId) {
      throw new Error('Not Authorized');
    }

    let purchaseOrders = await this.manager.find(PurchaseOrder, {
      where: { projectId: milestone.projectId },
      order: { issueDate: 'DESC' },
    });

    let purchaseOrder = purchaseOrders[0];

    return {
      projectName: milestone.project.title,
      purchaseOrderNo: purchaseOrder?.orderNo ?? null,
      purchaseOrderDate: purchaseOrder?.issueDate ?? null,
      milestoneName: milestone.title,
      milestoneDesc: milestone.description,
      organizationName: milestone.project.organization.name,
    };
  }

  async uploadAnyMilestoneFile(
    milestoneId: number,
    milestoneUploadDTO: MilestoneUploadDTO
  ): Promise<any | undefined> {
    let milestone = await this.manager.findOne(Milestone, milestoneId, {
      relations: ['project', 'project.organization'],
    });

    if (!milestone) {
      throw new Error('Milestone not found');
    }

    milestone.fileId = milestoneUploadDTO.fileId;

    return this.manager.save(milestone);
  }

  async uploadManageMilestoneFile(
    authId: number,
    milestoneId: number,
    milestoneUploadDTO: MilestoneUploadDTO
  ): Promise<any | undefined> {
    let milestone = await this.manager.findOne(Milestone, milestoneId, {
      relations: ['project', 'project.organization'],
    });

    if (!milestone) {
      throw new Error('Milestone not found');
    }

    if (milestone.project.projectManagerId !== authId) {
      throw new Error('Not Authorized');
    }

    milestone.fileId = milestoneUploadDTO.fileId;

    return this.manager.save(milestone);
  }

  async addMilestone(
    projectId: number,
    milestoneDTO: MilestoneDTO
  ): Promise<any> {
    let milestone = this.manager.transaction(
      async (transactionalEntityManager) => {
        let milestone = new Milestone();
        milestone.title = milestoneDTO.title;
        milestone.description = milestoneDTO.description;

        let project = await transactionalEntityManager.findOne(
          Opportunity,
          projectId
        );

        if (!project) {
          throw new Error('Project not found');
        }

        if (milestoneDTO.startDate || milestoneDTO.endDate) {
          this._validateMilestoneDates(
            milestoneDTO.startDate,
            milestoneDTO.endDate,
            project,
            [],
            [],
            []
          );
        }

        if (milestoneDTO.startDate) {
          milestone.startDate = new Date(milestoneDTO.startDate);
        }
        if (milestoneDTO.startDate) {
          milestone.endDate = new Date(milestoneDTO.endDate);
        }
        milestone.isApproved = milestoneDTO.isApproved;
        milestone.projectId = projectId;
        milestone.progress = milestoneDTO.progress;
        return this.manager.save(milestone);
      }
    );
    return milestone;
  }

  async findOneCustomMilestone(
    projectId: number,
    milestoneId: number
  ): Promise<any | undefined> {
    if (!projectId) {
      throw new Error('Project not found!');
    }
    if (!milestoneId) {
      throw new Error('Milestone not found!');
    }
    let project = await this.findOne(projectId, {
      relations: [
        'milestones',
        'milestones.opportunityResources',
        'milestones.opportunityResources.panelSkill',
        'milestones.opportunityResources.panelSkillStandardLevel',
        'milestones.opportunityResources.opportunityResourceAllocations',
        'milestones.opportunityResources.opportunityResourceAllocations.contactPerson',
      ],
    });
    if (!project) {
      throw new Error('Project not found!');
    }
    let milestone = project.milestones.filter((x) => x.id === milestoneId);
    if (!milestone) {
      throw new Error('Milestone not found');
    }
    return milestone;
  }

  async updateMilestone(
    projectId: number,
    milestoneId: number,
    milestoneDTO: MilestoneDTO
  ) {
    await this.manager.transaction(async (transactionalEntityManager) => {
      if (!projectId) {
        throw new Error('Project not found!');
      }

      if (!milestoneId) {
        throw new Error('Milestone not found!');
      }

      let project = await this.findOne(projectId, {
        relations: ['milestones'],
      });

      if (!project) {
        throw new Error('Project not found!');
      }

      let milestone = project.milestones.filter((x) => x.id == milestoneId)[0];
      if (!milestone) {
        throw new Error('Milestone not found!');
      }

      let resources = await transactionalEntityManager.find(
        OpportunityResource,
        {
          where: {
            startDate: Not(IsNull()),
            endDate: Not(IsNull()),
            milestoneId: milestoneId,
          },
        }
      );

      let timesheetMilestoneEntries = await transactionalEntityManager.find(
        TimesheetMilestoneEntry,
        {
          where: { milestoneId: milestone.id },
          relations: ['timesheet', 'entries'],
        }
      );

      let leaveRequests = await transactionalEntityManager.find(LeaveRequest, {
        where: { workId: projectId },
        relations: ['entries'],
      });

      if (milestoneDTO.startDate || milestoneDTO.endDate) {
        this._validateMilestoneDates(
          milestoneDTO.startDate,
          milestoneDTO.endDate,
          project,
          resources,
          timesheetMilestoneEntries,
          leaveRequests
        );
      }

      milestone.title = milestoneDTO.title;
      milestone.description = milestoneDTO.description;

      if (milestoneDTO.startDate) {
        milestone.startDate = new Date(milestoneDTO.startDate);
      }
      if (milestoneDTO.startDate) {
        milestone.endDate = new Date(milestoneDTO.endDate);
      }

      milestone.isApproved = milestoneDTO.isApproved;
      milestone.progress = milestoneDTO.progress;
      return await transactionalEntityManager.save(milestone);
    });
    return this.findOneCustomMilestone(projectId, milestoneId);
  }

  async deleteMilestone(
    projectId: number,
    id: number
  ): Promise<any | undefined> {
    await this.manager.transaction(async (transactionalEntityManager) => {
      let project = await transactionalEntityManager.findOne(
        Opportunity,
        projectId,
        {
          relations: [
            'milestones',
            'milestones.timesheetMilestoneEntries',
            'milestones.opportunityResources',
          ],
        }
      );

      if (!project) {
        throw new Error('Project not found');
      }

      let milestone = project.milestones.filter((x) => x.id == id)[0];

      if (!milestone) {
        throw new Error('Milestone not found');
      }

      if (milestone.timesheetMilestoneEntries.length > 0) {
        throw new Error('Milestone has Timesheet Entries');
      }

      await transactionalEntityManager.softRemove(Milestone, milestone);
    });
  }

  //-- RESOURCES

  async getAllActiveResources(projectId: number, milestoneId: number) {
    if (!projectId) {
      throw new Error('This Project not found!');
    }
    if (!milestoneId) {
      throw new Error('This Milestone not found!');
    }
    let project = await this.findOne(projectId, {
      relations: [
        'organization',
        'milestones',
        'milestones.opportunityResources',
        'milestones.opportunityResources.panelSkill',
        'milestones.opportunityResources.panelSkillStandardLevel',
        'milestones.opportunityResources.opportunityResourceAllocations',
        'milestones.opportunityResources.opportunityResourceAllocations.contactPerson',
      ],
    });
    if (!project) {
      throw new Error('Project not found!');
    }

    let milestone = project.milestones.filter((x) => x.id === milestoneId)[0];

    return milestone.opportunityResources;
  }

  async addResource(
    projectId: number,
    milestoneId: number,
    projectResourceDTO: ProjectResourceDTO
  ) {
    let id = await this.manager.transaction(
      async (transactionalEntityManager) => {
        if (!projectId) {
          throw new Error('Project not found!');
        }

        if (!milestoneId) {
          throw new Error('Milestone not found!');
        }

        let project = await this.findOne(projectId, {
          relations: [
            'milestones',
            'milestones.opportunityResources',
            'milestones.opportunityResources.panelSkill',
            'milestones.opportunityResources.panelSkillStandardLevel',
          ],
        });

        if (!project) {
          throw new Error('Project not found!');
        }

        let milestone = project.milestones.filter(
          (x) => x.id == milestoneId
        )[0];

        if (!milestone) {
          throw new Error('Milestone not found');
        }

        if (projectResourceDTO.startDate || projectResourceDTO.endDate) {
          this._validateResourceDates(
            projectResourceDTO.startDate,
            projectResourceDTO.endDate,
            milestone,
            [],
            []
          );
        }

        let resource = new OpportunityResource();

        resource.panelSkillId = projectResourceDTO.panelSkillId;
        resource.panelSkillStandardLevelId =
          projectResourceDTO.panelSkillStandardLevelId;
        resource.billableHours = projectResourceDTO.billableHours ?? 0;
        resource.opportunityId = projectId;
        resource.milestoneId = milestoneId;
        resource.title = projectResourceDTO.title;

        if (projectResourceDTO.startDate) {
          resource.startDate = new Date(projectResourceDTO.startDate);
        }
        if (projectResourceDTO.endDate) {
          resource.endDate = new Date(projectResourceDTO.endDate);
        }

        resource = await transactionalEntityManager.save(resource);

        let resourceAllocation = new OpportunityResourceAllocation();

        resourceAllocation.buyingRate = projectResourceDTO.buyingRate;
        resourceAllocation.sellingRate = projectResourceDTO.sellingRate;
        resourceAllocation.effortRate = projectResourceDTO.effortRate;
        resourceAllocation.isMarkedAsSelected =
          projectResourceDTO.isMarkedAsSelected;
        if (projectResourceDTO.contactPersonId) {
          resourceAllocation.contactPersonId =
            projectResourceDTO.contactPersonId;
        }
        resourceAllocation.opportunityResourceId = resource.id;
        resourceAllocation = await transactionalEntityManager.save(
          resourceAllocation
        );
        return resource.id;
      }
    );

    return this.findOneCustomResource(projectId, milestoneId, id);
  }

  // not being used. not working either.
  async updateResource(
    projectId: number,
    milestoneId: number,
    id: number,
    projectResourceDTO: ProjectResourceDTO
  ) {
    await this.manager.transaction(async (transactionalEntityManager) => {
      if (!projectId) {
        throw new Error('Project not found!');
      }

      if (!milestoneId) {
        throw new Error('Milestone not found!');
      }

      let project = await this.findOne(projectId, {
        relations: [
          'milestones',
          'milestones.opportunityResources',
          'milestones.opportunityResources.opportunityResourceAllocations',
          'milestones.opportunityResources.opportunityResourceAllocations.contactPerson',
          'milestones.opportunityResources.opportunityResourceAllocations.contactPerson.contactPersonOrganizations',
          'milestones.opportunityResources.opportunityResourceAllocations.contactPerson.contactPersonOrganizations.employee',
        ],
      });

      if (!project) {
        throw new Error('Project not found!');
      }

      let milestone = project.milestones.filter((x) => x.id == milestoneId)[0];

      if (!milestone) {
        throw new Error('Milestone not found');
      }

      let resource = milestone.opportunityResources.filter(
        (x) => x.id == id
      )[0];

      if (!resource) {
        throw new Error('Resource not found!');
      }

      let index = resource.opportunityResourceAllocations.findIndex(
        (x) => x.isMarkedAsSelected == true
      );

      if (projectResourceDTO.startDate || projectResourceDTO.endDate) {
        this._validateResourceDates(
          projectResourceDTO.startDate,
          projectResourceDTO.endDate,
          milestone,
          [],
          []
        );
      }

      if (resource.billableHours != projectResourceDTO.billableHours) {
      }

      resource.billableHours = projectResourceDTO.billableHours;
      resource.title = projectResourceDTO.title;

      if (projectResourceDTO.startDate) {
        resource.startDate = new Date(projectResourceDTO.startDate);
      }
      if (projectResourceDTO.endDate) {
        resource.endDate = new Date(projectResourceDTO.endDate);
      }

      resource.opportunityResourceAllocations[index].buyingRate =
        projectResourceDTO.buyingRate;

      resource.opportunityResourceAllocations[index].sellingRate =
        projectResourceDTO.sellingRate;

      resource.opportunityResourceAllocations[index].effortRate =
        projectResourceDTO.effortRate;

      await transactionalEntityManager.save(resource);
    });

    return this.findOneCustomResource(projectId, milestoneId, id);
  }

  async findOneCustomResource(
    projectId: number,
    milestoneId: number,
    id: number
  ): Promise<any | undefined> {
    if (!projectId) {
      throw new Error('Project not found!');
    }

    if (!milestoneId) {
      throw new Error('Milestone not found!');
    }

    let project = await this.findOne(projectId, {
      relations: [
        'milestones',
        'milestones.opportunityResources',
        'milestones.opportunityResources.panelSkill',
        'milestones.opportunityResources.panelSkillStandardLevel',
        'milestones.opportunityResources.opportunityResourceAllocations',
        'milestones.opportunityResources.opportunityResourceAllocations.contactPerson',
        'milestones.opportunityResources.opportunityResourceAllocations.contactPerson.contactPersonOrganizations',
      ],
    });
    if (!project) {
      throw new Error('Project not found!');
    }

    let milestone = project.milestones.filter((x) => x.id == milestoneId)[0];

    let resource = milestone.opportunityResources.filter((x) => x.id === id)[0];

    if (!resource) {
      throw new Error('Resource not found');
    }
    resource.opportunityResourceAllocations =
      resource.opportunityResourceAllocations.filter((x) => {
        return x.isMarkedAsSelected;
      });

    let cpRole = 'Contact Person';
    let allocation = resource.opportunityResourceAllocations[0];
    let cp = allocation.contactPerson;
    if (cp.contactPersonOrganizations.length > 0) {
      let contactPersonActiveAssociation = cp.contactPersonOrganizations.filter(
        (org) => org.status == true
      )[0];
      if (contactPersonActiveAssociation) {
        cpRole =
          contactPersonActiveAssociation.organizationId == 1
            ? 'Employee'
            : contactPersonActiveAssociation.organizationId != 1
            ? 'Sub Contractor'
            : 'Contact Person';
        (resource.opportunityResourceAllocations[0] as any).role = cpRole;
      }
    }
    return resource;
  }

  // not being used. not working either
  async deleteCustomResource(
    projectId: number,
    milestoneId: number,
    id: number
  ): Promise<any | undefined> {
    let project = await this.manager.transaction(
      async (transactionalEntityManager) => {
        if (!projectId) {
          throw new Error('Project not found!');
        }
        if (!milestoneId) {
          throw new Error('Milestone not found!');
        }
        let project = await transactionalEntityManager.findOne(
          Opportunity,
          projectId,
          {
            relations: [
              'milestones',
              'milestones.opportunityResources',
              'milestones.opportunityResources.panelSkill',
              'milestones.opportunityResources.panelSkillStandardLevel',
            ],
          }
        );
        if (!project) {
          throw new Error('Project not found!');
        }

        let milestone = project.milestones.filter(
          (x) => x.id == milestoneId
        )[0];

        if (!milestone) {
          throw new Error('Milestone not found!');
        }

        let resource = await transactionalEntityManager.findOne(
          OpportunityResource,
          id,
          {
            where: { milestoneId: milestoneId },
            relations: [
              'opportunityResourceAllocations',
              'opportunityResourceAllocations.contactPerson',
              'opportunityResourceAllocations.contactPerson.contactPersonOrganizations',
              'opportunityResourceAllocations.contactPerson.contactPersonOrganizations.employee',
            ],
          }
        );

        if (!resource) {
          throw new Error('Resource not found');
        }

        let allocation = resource.opportunityResourceAllocations[0];

        if (!allocation) {
          throw new Error('Allocation not found');
        }

        if (!allocation.contactPerson.getEmployee) {
          throw new Error('Employee not found');
        }

        let timesheets = await transactionalEntityManager.find(Timesheet, {
          where: { employeeId: allocation.contactPerson.getEmployee.id },
          relations: ['milestoneEntries'],
        });

        for (let timesheet of timesheets) {
          for (let milestoneEntry of timesheet.milestoneEntries) {
            if (milestoneEntry.milestoneId == milestoneId) {
              throw new Error('Resource timesheet has been created');
            }
          }
        }

        await transactionalEntityManager.delete(
          OpportunityResourceAllocation,
          allocation.id
        );

        return await transactionalEntityManager.delete(
          OpportunityResource,
          resource.id
        );
      }
    );

    return this.findOneCustom(projectId);
  }

  async getSelectedResources(projectId: number, milestoneId: number) {
    if (!projectId) {
      throw new Error('This Project not found!');
    }
    if (!milestoneId) {
      throw new Error('Milestone not found!');
    }

    let project = await this.findOne(projectId, {
      relations: [
        'milestones',
        'milestones.opportunityResources',
        'milestones.opportunityResources.panelSkill',
        'milestones.opportunityResources.panelSkillStandardLevel',
        'milestones.opportunityResources.opportunityResourceAllocations',
        'milestones.opportunityResources.opportunityResourceAllocations.contactPerson',
        'milestones.opportunityResources.opportunityResourceAllocations.contactPerson.contactPersonOrganizations',
      ],
    });

    if (!project) {
      throw new Error('Project not found!');
    }

    let milestone = project.milestones.filter((x) => x.id == milestoneId)[0];

    if (!milestone) {
      throw new Error('Milestone not found');
    }

    let selectedResources = milestone.opportunityResources.map((value) => {
      return {
        ...value,
        opportunityResourceAllocations:
          value.opportunityResourceAllocations.filter((value2) => {
            return value2.isMarkedAsSelected === true;
          }),
      };
    });

    let cpRole: string = 'Contact Person';
    selectedResources.forEach((resource, rindex) => {
      resource.opportunityResourceAllocations.forEach((allocation, aindex) => {
        (allocation as any).cm$ = (
          allocation.sellingRate - allocation.buyingRate
        ).toFixed(3);
        (allocation as any).cmPercent = (
          ((allocation.sellingRate - allocation.buyingRate) /
            allocation.sellingRate) *
          100
        ).toFixed(3);
        let cp = allocation.contactPerson;
        if (cp.contactPersonOrganizations.length > 0) {
          let contactPersonActiveAssociation =
            cp.contactPersonOrganizations.filter(
              (org) => org.status == true
            )[0];
          if (contactPersonActiveAssociation) {
            cpRole =
              contactPersonActiveAssociation.organizationId == 1
                ? 'Employee'
                : contactPersonActiveAssociation.organizationId != 1
                ? 'Sub Contractor'
                : 'Contact Person';
            (
              milestone.opportunityResources[rindex]
                .opportunityResourceAllocations[aindex] as any
            ).role = cpRole;
          }
        }
      });
    });

    return selectedResources;
  }

  //-- PURCHASE ORDERS

  async getAllPurchaseOrders(projectId: number) {
    if (!projectId) {
      throw new Error('This Project not found!');
    }
    let project = await this.findOne(projectId, {
      relations: ['purchaseOrders'],
    });
    if (!project) {
      throw new Error('Project not found!');
    }
    return project.purchaseOrders;
  }

  async addPurchaseOrder(
    projectId: number,
    purchaseOrderDTO: PurchaseOrderDTO
  ) {
    let id = await this.manager.transaction(
      async (transactionalEntityManager) => {
        if (!projectId) {
          throw new Error('Project Id not found!');
        }

        let project = await this.findOne(projectId, {
          relations: ['purchaseOrders'],
        });

        if (!project) {
          throw new Error('Project not found!');
        }

        let order = new PurchaseOrder();

        order.description = purchaseOrderDTO.description;
        order.issueDate = purchaseOrderDTO.issueDate;
        order.expiryDate = purchaseOrderDTO.expiryDate;
        order.value = purchaseOrderDTO.value;
        order.comment = purchaseOrderDTO.comment;
        order.expense = purchaseOrderDTO.expense;
        order.orderNo = purchaseOrderDTO.orderNo;
        order.fileId = purchaseOrderDTO.fileId;
        order.projectId = projectId;

        order = await transactionalEntityManager.save(order);

        return order.id;
      }
    );

    return this.findOneCustomPurchaseOrder(projectId, id);
  }

  async findOneCustomPurchaseOrder(
    projectId: number,
    id: number
  ): Promise<any | undefined> {
    if (!projectId) {
      throw new Error('Project not found!');
    }
    let project = await this.findOne(projectId, {
      relations: ['purchaseOrders', 'purchaseOrders.file'],
    });
    if (!project) {
      throw new Error('Project not found!');
    }
    let purchaseOrder = project.purchaseOrders.filter((x) => x.id === id)[0];
    if (!purchaseOrder) {
      throw new Error('Purchase Order not found');
    }

    return purchaseOrder;
  }

  async updatePurchaseOrder(
    projectId: number,
    id: number,
    purchaseOrderDTO: PurchaseOrderDTO
  ) {
    await this.manager.transaction(async (transactionalEntityManager) => {
      if (!projectId) {
        throw new Error('Project not found!');
      }

      let project = await this.findOne(projectId, {
        relations: ['purchaseOrders'],
      });
      if (!project) {
        throw new Error('Project not found!');
      }
      let order = project.purchaseOrders.filter((x) => x.id === id)[0];

      if (!order) {
        throw new Error('Purchase Order not found!');
      }

      order.description = purchaseOrderDTO.description;
      order.issueDate = purchaseOrderDTO.issueDate;
      order.expiryDate = purchaseOrderDTO.expiryDate;
      order.value = purchaseOrderDTO.value;
      order.comment = purchaseOrderDTO.comment;
      order.expense = purchaseOrderDTO.expense;
      order.orderNo = purchaseOrderDTO.orderNo;
      order.fileId = purchaseOrderDTO.fileId;
      order.projectId = projectId;

      await transactionalEntityManager.save(order);
    });

    return this.findOneCustomPurchaseOrder(projectId, id);
  }

  async deletePurchaseOrder(
    projectId: number,
    id: number
  ): Promise<any | undefined> {
    if (!projectId) {
      throw new Error('Project not found!');
    }

    let project = await this.findOne(projectId, {
      relations: ['purchaseOrders'],
    });
    if (!project) {
      throw new Error('Project not found!');
    }

    let deletedOrder = project.purchaseOrders.filter((x) => x.id === id);
    return await this.manager.softDelete(PurchaseOrder, deletedOrder);
  }

  //------------------------------------

  async markProjectAsOpen(id: number): Promise<any | undefined> {
    await this.manager.transaction(async (transactionalEntityManager) => {
      let projectObj = await transactionalEntityManager.findOne(
        Opportunity,
        id
      );

      if (!projectObj) {
        throw new Error('Opportunity not found');
      }

      projectObj.phase = true;

      await transactionalEntityManager.save(projectObj);
    });
    return this.findOneCustom(id);
  }

  async markProjectAsClosed(id: number): Promise<any | undefined> {
    await this.manager.transaction(async (transactionalEntityManager) => {
      let projectObj = await transactionalEntityManager.findOne(
        Opportunity,
        id
      );

      if (!projectObj) {
        throw new Error('Opportunity not found');
      }

      projectObj.phase = false;

      await transactionalEntityManager.save(projectObj);
    });
    return this.findOneCustom(id);
  }

  async getHierarchy(projectId: number): Promise<any | undefined> {
    if (!projectId || isNaN(projectId)) {
      throw new Error('Opportunity not found ');
    }

    let opportunity = await this.findOne(projectId, {
      relations: [
        'milestones',
        'milestones.opportunityResources',
        'milestones.opportunityResources.panelSkill',
        'milestones.opportunityResources.panelSkillStandardLevel',
        'milestones.opportunityResources.opportunityResourceAllocations',
        'milestones.opportunityResources.opportunityResourceAllocations.contactPerson',
      ],
    });

    if (!opportunity) {
      throw new Error('Opportunity not found');
    }

    for (let milestone of opportunity.milestones) {
      let newResources: any[] = [];
      for (let resource of milestone.opportunityResources) {
        let newResource: any = {};
        let allocation = resource.opportunityResourceAllocations.filter(
          (x) => x.isMarkedAsSelected
        )[0];
        if (allocation) {
          newResource.resourceId = resource.id;
          newResource.allocationId = allocation?.id;
          (allocation as any).cm$ = (
            allocation.sellingRate - allocation.buyingRate
          ).toFixed(3);
          (allocation as any).cmPercent = (
            ((allocation.sellingRate - allocation.buyingRate) /
              allocation.sellingRate) *
            100
          ).toFixed(3);
          newResource = { ...newResource, ...resource, ...allocation };
          delete newResource.id;
          delete newResource.opportunityResourceAllocations;
          newResources.push(newResource);
        }
      }
      milestone.opportunityResources = newResources;
    }

    return opportunity.milestones;
  }

  async getProfitLoss(
    projectId: number,
    fiscalYear: { start: string; end: string; actual: string }
  ): Promise<any | undefined> {
    if (!projectId || isNaN(projectId)) {
      throw new Error('Opportunity not found ');
    }
    console.log(projectId, 'PROJECT ID ===================');

    const actual = await this.query(`
      SELECT*, SUM(buying_rate * actual ) month_total_buy, SUM(selling_rate * actual  ) month_total_sell, SUM(actual) actual,
      DATE_FORMAT(STR_TO_DATE(e_date,'%e-%m-%Y'), '%b %y') month FROM (
            Select o_r.opportunity_id, o_r.milestone_id milestoneId, o_r.start_date res_start, o_r.end_date res_end, ora.buying_rate, ora.selling_rate, 
            ora.contact_person_id, e.id employee_id, o.cm_percentage cm
            FROM opportunities o 
              JOIN opportunity_resources o_r ON 
              o_r.opportunity_id = o.id 
                JOIN opportunity_resource_allocations ora ON 
                ora.opportunity_resource_id = o_r.id 
                  JOIN contact_person_organizations cpo ON 
                  cpo.contact_person_id = ora.contact_person_id 
                    JOIN employees e ON 
                    e.contact_person_organization_id = cpo.id 
            WHERE o.id = ${projectId} AND ora.is_marked_as_selected = 1) as project 

        JOIN (
            Select t.employee_id, tpe.milestone_id , te.date e_date, te.id entry_id, te.actual_hours actual 
            From timesheets t 
              JOIN timesheet_project_entries tpe ON 
              tpe.timesheet_id = t.id 
                JOIN timesheet_entries te ON 
                te.milestone_entry_id = tpe.id 
            WHERE STR_TO_DATE(te.date,'%e-%m-%Y') <= STR_TO_DATE('${fiscalYear.actual}' ,'%e-%m-%Y'))as times 
        ON 
          project.employee_id = times.employee_id
        AND
          project.milestoneId = times.milestone_id
          AND
          STR_TO_DATE(times.e_date,'%e-%m-%Y') BETWEEN STR_TO_DATE(DATE_FORMAT(project.res_start,'%e-%m-%Y'),'%e-%m-%Y')  
          AND project.res_end
        GROUP BY month;
      `);

    let actualStatement: any = {};
    let actualTotal = { buyTotal: 0, sellTotal: 0 };

    if (actual) {
      actual.forEach((el: any) => {
        actualStatement[el.month] = {
          cm: el.cm,
          month: el.month,
          monthTotalBuy: el.month_total_buy,
          monthTotalSell: el.month_total_sell,
          projectId: el.opportunity_id,
        };
        actualTotal['buyTotal'] += el.month_total_buy;
        actualTotal['sellTotal'] += el.month_total_sell;
      });
    }

    const forecast = await this
      .query(`Select o_r.start_date res_startDate, o_r.end_date res_endDate, ec.start_date con_startDate, ec.end_date con_endDate, 
      (ora.buying_rate *( (ec.no_of_hours /5) * (ora.effort_rate /100) ) ) forecastBuyRateDaily, 
      (ora.selling_rate *( (ec.no_of_hours /5) * (ora.effort_rate /100) ) ) forecastSellRateDaily
      FROM opportunities o 
        JOIN opportunity_resources o_r ON 
          o_r.opportunity_id = o.id 
                JOIN opportunity_resource_allocations ora ON 
                    ora.opportunity_resource_id = o_r.id 
                    JOIN contact_person_organizations cpo ON 
                        cpo.contact_person_id = ora.contact_person_id 
                        JOIN employees e ON 
                        e.contact_person_organization_id = cpo.id
                        JOIN employment_contracts ec ON
                          ec.employee_id = e.id
      WHERE o.id = ${projectId} AND ora.is_marked_as_selected = 1 AND ec.start_date <= STR_TO_DATE('${fiscalYear.end}' ,'%e-%m-%Y') 
      AND (ec.end_date IS NULL ||  ec.end_date >= STR_TO_DATE('${fiscalYear.actual}' ,'%e-%m-%Y')) 
      AND o_r.start_date <= STR_TO_DATE('${fiscalYear.end}' ,'%e-%m-%Y') AND (o_r.end_date IS NULL ||  STR_TO_DATE(DATE_FORMAT(o_r.end_date,'%e-%m-%Y'),'%e-%m-%Y') > STR_TO_DATE('${fiscalYear.actual}' ,'%e-%m-%Y'));`);

    let calendar = await this.manager.find(Calendar, {
      relations: ['calendarHolidays', 'calendarHolidays.holidayType'],
    });
    let holidays: any = {};

    if (calendar[0]) {
      calendar[0].calendarHolidays.forEach((holiday) => {
        holidays[moment(holiday.date).format('M/D/YYYY').toString()] =
          holiday.holidayType.label;
      });
    }

    return { actualStatement, actualTotal, forecast, holidays };
  }

  async getProjectTracking(
    projectId: number,
    fiscalYear: { start: string; end: string; actual: string }
  ): Promise<any | undefined> {
    if (!projectId || isNaN(projectId)) {
      throw new Error('Project not found ');
    }
    console.log(projectId, 'PROJECT ID ===================');

    let project = await this.findOne(projectId, {
      relations: [
        'milestones',
        'milestones.opportunityResources',
        'milestones.opportunityResources.opportunityResourceAllocations',
        'milestones.opportunityResources.opportunityResourceAllocations.contactPerson',
        'milestones.opportunityResources.opportunityResourceAllocations.contactPerson.contactPersonOrganizations',
        'milestones.opportunityResources.opportunityResourceAllocations.contactPerson.contactPersonOrganizations.employee',
        'milestones.opportunityResources.opportunityResourceAllocations.contactPerson.contactPersonOrganizations.employee.employmentContracts',
      ],
    });

    if (!project) {
      throw new Error('Project not found');
    }

    let startDate = moment(fiscalYear.start, 'DD-MM-YYYY');
    let endDate = moment(fiscalYear.end, 'DD-MM-YYYY');

    let previousYearStartDate = startDate.clone().subtract(1, 'year');
    let previousYearEndDate = startDate.clone().subtract(1, 'day');

    let currentYearResponses = await this._getProjectTracking(
      startDate,
      endDate,
      project
    );

    let previousYearResponses = await this._getProjectTracking(
      previousYearStartDate,
      previousYearEndDate,
      project,
      true
    );

    currentYearResponses.forEach((currentResponse: any) => {
      previousYearResponses.forEach((previousResponse: any) => {
        if (currentResponse.employeeId === previousResponse.employeeId) {
          currentResponse.currentYear.unshift(previousResponse.currentYear);
        }
      });
    });

    let responses = currentYearResponses;

    return responses;
  }

  async _getProjectTracking(
    startDate: Moment,
    endDate: Moment,
    project: Opportunity,
    summary = false
  ) {
    interface monthTrackDTO {
      startDate: Moment;
      endDate: Moment;

      totalDaysInMonth: number;
      holidays: number;
      spans: any[];
    }

    interface allocationTrackDTO {
      employeeId: number;
      fullName: String;
      currentYear: any;
      dailyHours: number;
    }

    let startDateClone = startDate.clone();

    let months: {
      [key: string]: monthTrackDTO;
    } = {};
    let resources: number[] = [];
    let projectMilestone = project.milestones[0];

    let allocations: allocationTrackDTO[] = [];
    let responses: any = [];

    while (
      endDate > startDateClone ||
      startDateClone.format('M') === endDate.format('M')
    ) {
      months[startDateClone.format('YYYY-MM')] = {
        startDate: startDateClone.clone().startOf('month'),
        endDate: startDateClone.clone().endOf('month'),

        totalDaysInMonth: startDateClone.daysInMonth(),
        holidays: 0,
        spans: [],
      };
      startDateClone.add(1, 'month');
    }

    let calendars = await this.manager.find(Calendar, {
      relations: ['calendarHolidays', 'calendarHolidays.holidayType'],
    });

    calendars.forEach((calendar) => {
      calendar.calendarHolidays.forEach((holiday) => {
        if (
          months[moment(holiday.date, 'YYYY-MM').format('YYYY-MM')] !==
          undefined
        ) {
          months[
            moment(holiday.date, 'YYYY-MM').format('YYYY-MM')
          ].holidays += 1;
        }
      });
    });

    project.milestones.forEach((milestone) => {
      milestone.opportunityResources.forEach((position) => {
        let positionStartDate = moment(position.startDate, 'YYYY-MM-DD');
        let positionStartDateClone = positionStartDate.clone();
        let positionEndDate = moment(position.endDate, 'YYYY-MM-DD');
        // let positionMonths: any = {}
        if (
          positionStartDate.isBetween(startDate, endDate, 'date') ||
          positionEndDate.isBetween(startDate, endDate, 'date') ||
          startDate.isBetween(positionStartDate, positionEndDate, 'date') ||
          endDate.isBetween(positionStartDate, positionEndDate, 'date')
        )
          position.opportunityResourceAllocations.forEach((allocation) => {
            if (
              allocation.isMarkedAsSelected &&
              allocation.contactPerson.getEmployee?.id
            ) {
              resources.push(allocation.contactPerson.getEmployee?.id);
              let currentYear: any = {};
              while (
                positionEndDate > positionStartDateClone ||
                positionStartDateClone.format('M') ===
                  positionEndDate.format('M')
              ) {
                if (positionStartDateClone.isBetween(startDate, endDate)) {
                  let positionStartDateCloneFormatted = positionStartDateClone
                    .clone()
                    .startOf('month')
                    .format('YYYY-MM');
                  currentYear[positionStartDateCloneFormatted] = {};
                  if (
                    positionStartDate.isAfter(
                      positionStartDateClone.clone().startOf('month')
                    )
                  )
                    currentYear[positionStartDateCloneFormatted].startDate =
                      moment(position.startDate, 'YYYY-MM-DD');
                  else
                    currentYear[positionStartDateCloneFormatted].startDate =
                      moment(
                        positionStartDateClone.clone().startOf('month'),
                        'YYYY-MM-DD'
                      );
                  if (
                    positionEndDate.isBefore(
                      positionStartDateClone.clone().endOf('month')
                    )
                  )
                    currentYear[positionStartDateCloneFormatted].endDate =
                      moment(position.endDate, 'YYYY-MM-DD');
                  else
                    currentYear[positionStartDateCloneFormatted].endDate =
                      moment(
                        positionStartDateClone.clone().endOf('month'),
                        'YYYY-MM-DD'
                      );

                  currentYear[positionStartDateCloneFormatted].buyRate =
                    allocation.buyingRate;
                  currentYear[positionStartDateCloneFormatted].sellRate =
                    allocation.sellingRate;
                  currentYear[positionStartDateCloneFormatted].actualHours = 0;
                  currentYear[positionStartDateCloneFormatted].totalDays =
                    currentYear[positionStartDateCloneFormatted].endDate.diff(
                      currentYear[positionStartDateCloneFormatted].startDate,
                      'days'
                    );
                  let currentSpanStartDateClone =
                    currentYear[
                      positionStartDateCloneFormatted
                    ].startDate.clone();
                  let workDays = 0;
                  while (
                    currentSpanStartDateClone <=
                    currentYear[positionStartDateCloneFormatted].endDate
                  ) {
                    if (
                      currentSpanStartDateClone.format('ddd') !== 'Sat' &&
                      currentSpanStartDateClone.format('ddd') !== 'Sun'
                    ) {
                      workDays++; //add 1 to your counter if its not a weekend day
                    }
                    currentSpanStartDateClone.add(1, 'day'); //increment by one day
                  }
                  currentYear[positionStartDateCloneFormatted].workDays =
                    workDays;
                  currentYear[positionStartDateCloneFormatted].contractDays = 5;
                }

                positionStartDateClone.add(1, 'month');
              }
              let newAllocation: allocationTrackDTO = {
                fullName: allocation.contactPerson.getFullName,
                employeeId: allocation.contactPerson.getEmployee.id,
                currentYear: currentYear,
                dailyHours: project?.hoursPerDay ?? 8,
              };

              allocations.push(newAllocation);
            }
          });
      });
    });

    resources = [...new Set(resources)];

    let timesheets = await this.manager.find(Timesheet, {
      where: {
        employeeId: In(resources),
        startDate: MoreThanOrEqual(startDate.toDate()),
        endDate: LessThanOrEqual(endDate.toDate()),
      },
      relations: [
        'milestoneEntries',
        'milestoneEntries.milestone',
        'milestoneEntries.entries',
      ],
    });

    allocations.forEach((allocation) => {
      timesheets.forEach((timesheet) => {
        let timesheetStartDate = moment(timesheet.startDate, 'YYYYY-MM-DD');
        let timesheetEndDate = moment(timesheet.endDate, 'YYYYY-MM-DD').endOf(
          'day'
        );
        if (allocation.employeeId === timesheet.employeeId) {
          for (const span in allocation.currentYear) {
            // console.log(
            //   allocation.employeeId,
            //   allocation.currentYear[span].startDate,
            //   allocation.currentYear[span].endDate,
            //   timesheetStartDate,
            //   timesheetEndDate
            // );
            if (
              allocation.currentYear[span].startDate.isSameOrAfter(
                timesheetStartDate
              ) &&
              allocation.currentYear[span].startDate.isSameOrBefore(
                timesheetEndDate
              ) &&
              allocation.currentYear[span].endDate.isSameOrAfter(
                timesheetStartDate
              ) &&
              allocation.currentYear[span].endDate.isSameOrBefore(
                timesheetEndDate
              )
            ) {
              timesheet.milestoneEntries.forEach((milestoneEntry) => {
                if (milestoneEntry.milestoneId === projectMilestone.id) {
                  milestoneEntry.entries.forEach((entry) => {
                    allocation.currentYear[span].actualHours += entry.hours;
                  });
                }
              });
            }
          }
        }
      });
    });

    resources.forEach((resource) => {
      let fullName: String = '';
      let currentYear = JSON.parse(JSON.stringify(months));
      let currentYearArray: any = [];
      let now: any = {};
      allocations.forEach((allocation) => {
        if (allocation.employeeId == resource) {
          fullName == '' ? (fullName = allocation.fullName) : '';
          for (const key in allocation.currentYear) {
            let actualDays = parseFloat(
              (
                allocation.currentYear[key].actualHours / allocation.dailyHours
              ).toFixed(2)
            );
            let actualCost = parseFloat(
              (
                allocation.currentYear[key].buyRate *
                allocation.currentYear[key].actualHours
              ).toFixed(2)
            );
            let actualRevenue = parseFloat(
              (
                allocation.currentYear[key].sellRate *
                allocation.currentYear[key].actualHours
              ).toFixed(2)
            );
            let cm$ = parseFloat((actualRevenue - actualCost).toFixed(2));
            allocation.currentYear[key].actualDays = actualDays;
            allocation.currentYear[key].effortRate = parseFloat(
              (
                (actualDays / allocation.currentYear[key].workDays) *
                100
              ).toFixed(1)
            );
            allocation.currentYear[key].actualRevenue = actualRevenue;
            allocation.currentYear[key].actualCost = actualCost;
            allocation.currentYear[key].cm$ = cm$;
            allocation.currentYear[key].cmPercent =
              parseFloat(((cm$ / actualRevenue) * 100).toFixed(2)) ?? 0;
            allocation.currentYear[key].dateString = `${allocation.currentYear[
              key
            ].startDate.format('DD-MMM-YY')} - ${allocation.currentYear[
              key
            ].endDate.format('DD-MMM-YY')}.`;
            // if (resourceHours[resource] != undefined) {
            //   if (resourceHours[resource][key] != undefined) {
            //     currentYear[key].actualHours = resourceHours[resource][key];
            //   }
            // }

            currentYear[key].spans.push(allocation.currentYear[key]);
            currentYear[key].spans.forEach((span: any) => {
              currentYearArray.push(span);
            });

            if (
              moment().isBetween(
                allocation.currentYear[key].startDate,
                allocation.currentYear[key].endDate
              )
            ) {
              now = allocation.currentYear[key];
            }

            if (moment().isSameOrAfter(allocation.currentYear[key].startDate)) {
              allocation.currentYear[key].current = 1;
            } else {
              allocation.currentYear[key].current = 0;
            }
          }
        }
      });

      if (summary) {
        let summaryCurrentYear = {
          dateString: `${startDate.format('DD-MMM-YY')} - ${endDate.format(
            'DD-MMM-YYYY'
          )}`,
          workDays: 0,
          effortRate: 0,
          actualHours: 0,
          actualDays: 0,
          actualRevenue: 0,
          actualCost: 0,
          cm$: 0,
          cmPerc: 0,
          cmPercent: 0,
          rowCount: 0,
        };
        currentYearArray.forEach((span: any) => {
          summaryCurrentYear.workDays += parseFloat(
            parseFloat(span.workDays).toFixed(2)
          );
          summaryCurrentYear.effortRate += parseFloat(
            parseFloat(span.effortRate).toFixed(2)
          );
          summaryCurrentYear.actualHours += parseFloat(
            parseFloat(span.actualHours).toFixed(2)
          );
          summaryCurrentYear.actualDays += parseFloat(
            parseFloat(span.actualDays).toFixed(2)
          );
          summaryCurrentYear.actualRevenue += parseFloat(
            parseFloat(span.actualRevenue).toFixed(2)
          );
          summaryCurrentYear.actualCost += parseFloat(
            parseFloat(span.actualCost).toFixed(2)
          );
          summaryCurrentYear.cm$ += parseFloat(parseFloat(span.cm$).toFixed(2));
          summaryCurrentYear.cmPerc += parseFloat(
            parseFloat(span.cmPercent ?? 0).toFixed(2)
          );
          if (span.cmPercent) summaryCurrentYear.rowCount++;
        });

        summaryCurrentYear.cmPercent =
          summaryCurrentYear.cmPerc / summaryCurrentYear.rowCount;

        summaryCurrentYear.effortRate =
          summaryCurrentYear.effortRate / summaryCurrentYear.rowCount;

        currentYearArray = summaryCurrentYear;
      }

      let newResponse: any = {
        employeeId: resource,
        fullName: fullName,
        now,
        currentYear: currentYearArray,
      };

      responses.push(newResponse);
    });

    return responses;
  }

  async helperGetProjectsByUserId(
    employeeId: number,
    mode: string,
    phase: number
  ) {
    let response: any = [];

    let employee = await this.manager.findOne(Employee, employeeId, {
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

    let projects = await this.find({
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

    // console.log('result', result);

    projects.map((project) => {
      let add_flag = 0;
      if (project.phase || phase === 1) {
        if (mode == 'O' || mode == 'o' || mode == '') {
          project.opportunityResources.map((resource) => {
            resource.opportunityResourceAllocations.filter((allocation) => {
              if (
                allocation.contactPersonId === employeeContactPersonId &&
                allocation.isMarkedAsSelected
              ) {
                add_flag = 1;
              }
            });
          });
          if (add_flag === 1)
            response.push({ value: project.id, label: project.title });
        }
        if ((mode == 'M' || mode == 'm' || mode == '') && add_flag === 0) {
          if (project.projectManagerId == employeeId) {
            response.push({
              value: project.id,
              label: project.title,
            });
          }
        }
      }
    });

    return response;
  }

  async helperGetMilestonesByUserId(employeeId: number, phase: number) {
    let response: any = [];

    let employee = await this.manager.findOne(Employee, employeeId, {
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

    let result = await this.find({
      where: [{ status: 'P' }, { status: 'C' }],
      relations: [
        'organization',
        'milestones',
        'milestones.opportunityResources',
        'milestones.opportunityResources.panelSkill',
        'milestones.opportunityResources.panelSkillStandardLevel',
        'milestones.opportunityResources.opportunityResourceAllocations',
        'milestones.opportunityResources.opportunityResourceAllocations.contactPerson',
      ],
    });

    // console.log('result', result);

    result.map((project) => {
      if (project.phase || phase == 1) {
        project.milestones.map((milestone) => {
          let add_flag = 0;
          milestone.opportunityResources.map((resource) => {
            resource.opportunityResourceAllocations.filter((allocation) => {
              if (
                allocation.contactPersonId === employeeContactPersonId &&
                allocation.isMarkedAsSelected
              ) {
                add_flag = 1;
              }
            });
          });
          if (add_flag === 1)
            if (project.type == 2) {
              response.push({
                value: milestone.id,
                label: project.title,
              });
            } else if (project.type == 1) {
              response.push({
                value: milestone.id,
                label: `${project.title} - (${milestone.title})`,
              });
            }
        });
      }
    });

    return response;
  }

  async authAnyGetUserProjects() {
    let response: any = [];

    let projects = await this.find({
      where: [
        { status: OpportunityStatus.WON },
        { status: OpportunityStatus.COMPLETED },
      ],
    });

    projects.forEach((project) => {
      response.push({ value: project.id, label: project.title });
    });

    return response;
  }

  async authManageGetUserProjects(authId: number) {
    let response: any = [];

    let projects = await this.find({
      where: [
        { status: OpportunityStatus.WON },
        { status: OpportunityStatus.COMPLETED },
      ],
    });

    // console.log('result', result);

    projects.map((project) => {
      if (project.projectManagerId == authId)
        response.push({
          value: project.id,
          label: project.title,
        });
    });

    return response;
  }

  async authOwnGetUserProjects(authId: number) {
    let response: any = [];

    let projects = await this.find({
      where: [
        { status: OpportunityStatus.WON },
        { status: OpportunityStatus.COMPLETED },
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

    // console.log('result', result);

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

    projects.map((project) => {
      project.opportunityResources.map((resource) => {
        resource.opportunityResourceAllocations.filter((allocation) => {
          if (
            allocation.contactPersonId === employeeContactPersonId &&
            allocation.isMarkedAsSelected
          ) {
            response.push({
              value: project.id,
              label: project.title,
            });
          }
        });
      });
    });

    return response;
  }

  //!--------------------------- HELPER FUNCTIONS ----------------------------//

  _validateProjectDates(
    startDate: Date | null,
    endDate: Date | null,
    milestones: Milestone[],
    resources: OpportunityResource[],
    timesheetMilestoneEntries: TimesheetMilestoneEntry[],
    leaveRequests: LeaveRequest[]
  ) {
    if (moment(startDate).isAfter(moment(endDate), 'date')) {
      throw new Error('Invalid date input');
    }

    if (startDate) {
      for (let milestone of milestones) {
        if (
          moment(startDate).isAfter(moment(milestone.startDate), 'date') &&
          milestone.project.type == ProjectType.MILESTONE_BASE
        ) {
          throw new Error(
            'Project Start Date cannot be after Milestone Start Date'
          );
        }
      }
      for (let poisition of resources) {
        if (moment(startDate).isAfter(moment(poisition.startDate), 'date')) {
          throw new Error(
            'Project Start Date cannot be after Resource / Position Start Date'
          );
        }
      }
      for (let entry of timesheetMilestoneEntries) {
        if (entry.entries.length) {
          let details = entry.getEntriesDetails;
          if (
            moment(startDate).isAfter(
              moment(details.startDate, 'DD-MM-YYYY'),
              'date'
            )
          ) {
            throw new Error(
              'Project Start Date cannot be After Timesheet Start Date'
            );
          }
        }
      }
      for (let leaveRequest of leaveRequests) {
        if (leaveRequest.entries.length) {
          let details = leaveRequest.getEntriesDetails;
          if (moment(startDate).isAfter(moment(details.startDate), 'date')) {
            throw new Error(
              'Project Start Date cannot be After Leave Request Start Date'
            );
          }
        }
      }
    }
    if (endDate) {
      for (let milestone of milestones) {
        if (
          moment(endDate).isBefore(moment(milestone.endDate), 'date') &&
          milestone.project.type == ProjectType.MILESTONE_BASE
        ) {
          throw new Error(
            'Project End Date cannot be before Milestone End Date'
          );
        }
      }
      for (let poisition of resources) {
        if (moment(endDate).isBefore(moment(poisition.endDate), 'date')) {
          throw new Error(
            'Project End Date cannot be before Resource / Position End Date'
          );
        }
      }
      for (let entry of timesheetMilestoneEntries) {
        if (entry.entries.length) {
          let details = entry.getEntriesDetails;
          if (
            moment(endDate).isBefore(
              moment(details.endDate, 'DD-MM-YYYY'),
              'date'
            )
          ) {
            throw new Error(
              'Project End Date cannot be Before Timesheet End Date'
            );
          }
        }
      }
      for (let leaveRequest of leaveRequests) {
        if (leaveRequest.entries.length) {
          let details = leaveRequest.getEntriesDetails;
          if (moment(endDate).isBefore(moment(details.endDate), 'date')) {
            throw new Error(
              'Project End Date cannot be Before Leave Request End Date'
            );
          }
        }
      }
    }
  }

  _validateMilestoneDates(
    startDate: Date | null,
    endDate: Date | null,
    project: Opportunity,
    resources: OpportunityResource[],
    timesheetMilestoneEntries: TimesheetMilestoneEntry[],
    leaveRequests: LeaveRequest[]
  ) {
    if (startDate && !project.startDate) {
      throw new Error('Opportunity start date is not set');
    }
    if (endDate && !project.endDate) {
      throw new Error('Opportunity end date is not set');
    }

    if (moment(startDate).isAfter(moment(endDate), 'date')) {
      throw new Error('Invalid date input');
    }

    if (startDate) {
      if (moment(startDate).isBefore(moment(project.startDate), 'date')) {
        throw new Error(
          'Milestone Start Date cannot be Before Project Start Date'
        );
      }
      if (moment(startDate).isAfter(moment(project.endDate), 'date')) {
        throw new Error(
          'Milestone Start Date cannot be After Project End Date'
        );
      }
      for (let position of resources) {
        if (position.startDate) {
          if (moment(startDate).isAfter(moment(position.startDate), 'date')) {
            throw new Error(
              'Milestone Start Date cannot be After Resource / Position Start Date'
            );
          }
        }
        if (position.endDate) {
          // if (moment(startDate).isBefore(moment(position.endDate), 'date')) {
          //   throw new Error(
          //     'Milestone Start Date cannot be Before Resource / Position End Date'
          //   );
          // }
        }
      }
      for (let entry of timesheetMilestoneEntries) {
        if (entry.entries.length) {
          let details = entry.getEntriesDetails;
          if (
            moment(endDate).isBefore(
              moment(details.endDate, 'DD-MM-YYYY'),
              'date'
            )
          ) {
            throw new Error(
              'Milestone End Date cannot be Before Timesheet End Date'
            );
          }
        }
      }

      for (let leaveRequest of leaveRequests) {
        if (leaveRequest.entries.length) {
          let details = leaveRequest.getEntriesDetails;
          if (moment(startDate).isBefore(moment(details.startDate), 'date')) {
            throw new Error(
              'Milestone End Date cannot be Before Leave Request End Date'
            );
          }
        }
      }
    }
    if (endDate) {
      if (moment(endDate).isBefore(moment(project.startDate), 'date')) {
        throw new Error(
          'Milestone End Date cannot be Before Project Start Date'
        );
      }
      if (moment(endDate).isAfter(moment(project.endDate), 'date')) {
        throw new Error('Milestone End Date cannot be After Project End Date');
      }
      for (let position of resources) {
        if (position.startDate) {
          // if (moment(endDate).isAfter(moment(position.startDate), 'date')) {
          //   throw new Error(
          //     'Milestone End Date cannot be After Resource / Position Start Date'
          //   );
          // }
        }
        if (position.endDate) {
          if (moment(endDate).isBefore(moment(position.endDate), 'date')) {
            throw new Error(
              'Milestone End Date cannot be Before Resource / Position End Date'
            );
          }
        }
      }
      for (let entry of timesheetMilestoneEntries) {
        if (moment(endDate).isBefore(moment(entry.timesheet.endDate), 'date')) {
          throw new Error(
            'Milestone End Date cannot be Before Timesheet End Date'
          );
        }
      }
      for (let leaveRequest of leaveRequests) {
        if (leaveRequest.entries.length) {
          let details = leaveRequest.getEntriesDetails;
          if (moment(endDate).isBefore(moment(details.endDate), 'date')) {
            throw new Error(
              'Project End Date cannot be Before Leave Request End Date'
            );
          }
        }
      }
    }
  }

  _validateResourceDates(
    startDate: Date | null,
    endDate: Date | null,
    milestone: Milestone,
    leaveRequests: LeaveRequest[],
    timesheet: Timesheet[]
  ) {
    if (startDate && !milestone.startDate) {
      throw new Error('Milestone start date is not set');
    }
    if (endDate && !milestone.endDate) {
      throw new Error('Milestone end date is not set');
    }

    if (moment(startDate).isAfter(moment(endDate), 'date')) {
      throw new Error('Invalid date input');
    }

    if (startDate) {
      if (moment(startDate).isBefore(moment(milestone.startDate), 'date')) {
        throw new Error(
          'Resource Start Date cannot be Before Milestone Start Date'
        );
      }
      if (moment(startDate).isAfter(moment(milestone.endDate), 'date')) {
        throw new Error(
          'Resource Start Date cannot be After Milestone End Date'
        );
      }
    }

    if (endDate) {
      if (moment(endDate).isBefore(moment(milestone.startDate), 'date')) {
        throw new Error(
          'Resource End Date cannot be Before Milestone Start Date'
        );
      }
      if (moment(endDate).isAfter(moment(milestone.endDate), 'date')) {
        throw new Error('Resource End Date cannot be After Milestone End Date');
      }
    }
  }

  _validateResourceHours(hours: number, timesheets: Timesheet[]) {}
}

// async getProjectTracking(
//   projectId: number,
//   fiscalYear: { start: string; end: string; actual: string }
// ): Promise<any | undefined> {
//   if (!projectId || isNaN(projectId)) {
//     throw new Error('Project not found ');
//   }
//   console.log(projectId, 'PROJECT ID ===================');

//   let project = await this.findOne(projectId, {
//     relations: [
//       'milestones',
//       'milestones.opportunityResources',
//       'milestones.opportunityResources.opportunityResourceAllocations',
//       'milestones.opportunityResources.opportunityResourceAllocations.contactPerson',
//       'milestones.opportunityResources.opportunityResourceAllocations.contactPerson.contactPersonOrganizations',
//       'milestones.opportunityResources.opportunityResourceAllocations.contactPerson.contactPersonOrganizations.employee',
//       'milestones.opportunityResources.opportunityResourceAllocations.contactPerson.contactPersonOrganizations.employee.employmentContracts',
//     ],
//   });

//   if (!project) {
//     throw new Error('Project not found');
//   }

//   interface monthDTO {
//     isAllocated: Boolean;
//     positionStart?: Moment | string;
//     positionEnd?: Moment | string;
//     actualHours: number;
//     totalDaysInMonth: number;
//     holidays: number;
//   }
//   interface allocationEntity {
//     contactpersonId: number | null;
//     employeeId: number | undefined;
//     name: String;
//     dailyHours: number;
//     hourlySellRate: number;
//     dailySellRate: number;
//     dailyBuyRate: number;
//     projectStartDate: string;
//     projectEndDate: string;
//     currentYear: {
//       [key: string]: monthDTO;
//     };
//     previousYear: any;
//     totals: any;
//   }

//   let startDate = moment(fiscalYear.start, 'DD-MM-YYYY');
//   let startDateClone = startDate.clone();
//   let endDate = moment(fiscalYear.end, 'DD-MM-YYYY');
//   let months: {
//     [key: string]: monthDTO;
//   } = {};
//   let allocationIds: number[] = [];

//   let allocationEntities: allocationEntity[] = [];
//   let allocationEntitiesIndex: any = {};

//   while (
//     endDate > startDateClone ||
//     startDateClone.format('M') === endDate.format('M')
//   ) {
//     months[startDateClone.format('YYYY-MM-DD')] = {
//       isAllocated: false,
//       actualHours: 0,
//       totalDaysInMonth: startDateClone.daysInMonth(),
//       holidays: 0,
//       //NOT SETTING
//       // workingDays: 0,
//       // effortRate: 0,
//       // actualDays: 0,
//       // revenue: 0,
//       // cost: 0,
//       // cm: 0,
//       // cmPercent: 0,
//     };
//     startDateClone.add(1, 'month');
//   }

//   let calendars = await this.manager.find(Calendar, {
//     relations: ['calendarHolidays', 'calendarHolidays.holidayType'],
//   });

//   calendars.forEach((calendar) => {
//     calendar.calendarHolidays.forEach((holiday) => {
//       if (
//         months[moment(holiday.date, 'YYYY-MM-DD').format('YYYY-MM-DD')] !==
//         undefined
//       ) {
//         months[
//           moment(holiday.date, 'YYYY-MM-DD').format('YYYY-MM-DD')
//         ].holidays += 1;
//       }
//     });
//   });

//   project.milestones.forEach((milestone) => {
//     milestone.opportunityResources.forEach((position) => {
//       let positionStartDate = moment(position.startDate, 'YYYY-MM-DD');
//       let positionStartDateClone = positionStartDate.clone();
//       let positionEndDate = moment(position.endDate, 'YYYY-MM-DD');
//       // let positionMonths: any = {}
//       if (
//         positionStartDate.isBetween(startDate, endDate, 'date') ||
//         positionEndDate.isBetween(startDate, endDate, 'date') ||
//         startDate.isBetween(positionStartDate, positionEndDate, 'date') ||
//         endDate.isBetween(positionStartDate, positionEndDate, 'date')
//       )
//         position.opportunityResourceAllocations.forEach((allocation) => {
//           if (allocation.isMarkedAsSelected) {
//             let currentYear = months;
//             while (
//               positionEndDate > positionStartDateClone ||
//               positionStartDateClone.format('M') ===
//                 positionEndDate.format('M')
//             ) {
//               let positionStartDateCloneFormatted = positionStartDateClone
//                 .clone()
//                 .startOf('month')
//                 .format('YYYY-MM-DD');
//               if (currentYear[positionStartDateCloneFormatted] != undefined) {
//                 currentYear[positionStartDateCloneFormatted].isAllocated =
//                   true;
//                   currentYear[positionStartDateCloneFormatted].positionStart = positionStartDate
//                   currentYear[positionStartDateCloneFormatted].positionEnd = positionEndDate
//               }

//               positionStartDateClone.add(1, 'month');
//             }
//             let newAllocationEntity: allocationEntity = {
//               contactpersonId: allocation.contactPersonId,
//               employeeId: allocation.contactPerson.getEmployee?.id,
//               name: allocation.contactPerson.firstName,
//               dailyHours: project?.hoursPerDay ?? 0,
//               hourlySellRate: allocation.sellingRate,
//               dailySellRate:
//                 allocation.sellingRate * (project?.hoursPerDay ?? 0),
//               projectStartDate: moment(project?.startDate).format(
//                 'DD-MM-YYYY'
//               ),
//               dailyBuyRate:
//                 allocation.buyingRate * (project?.hoursPerDay ?? 0),
//               projectEndDate: moment(project?.endDate).format('DD-MM-YYYY'),
//               currentYear: currentYear,
//               previousYear: {},
//               totals: {},
//             };
//             allocationIds.push(newAllocationEntity.employeeId as number);
//             allocationEntities.push(newAllocationEntity);
//             allocationEntitiesIndex[
//               newAllocationEntity.employeeId as number
//             ] = allocationEntities.length - 1;
//           }
//         });
//     });
//   });

//   let timesheets = await this.manager.find(Timesheet, {
//     where: {
//       employeeId: In(allocationIds),
//       startDate: MoreThanOrEqual(startDate.toDate()),
//       endDate: LessThanOrEqual(endDate.toDate()),
//     },
//     relations: ['milestoneEntries', 'milestoneEntries.entries'],
//   });

//   timesheets.forEach((timesheet) => {
//     let timesheetStartDate = moment(timesheet.startDate, 'YYYYY-MM-DD');
//     let timesheetEndDate = moment(timesheet.endDate, 'YYYYY-MM-DD');
//     timesheet.milestoneEntries.forEach((milestoneEntry) => {
//       milestoneEntry.entries.forEach((entry) => {
//         (allocationEntities as any)[
//           allocationEntitiesIndex[timesheet.employeeId]
//         ]['currentYear'][
//           timesheetStartDate.format('YYYY-MM-DD')
//         ].actualHours += entry.hours;
//       });
//     });
//   });

//   return allocationEntities;
// }
