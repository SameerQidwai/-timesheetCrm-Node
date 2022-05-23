import {
  OpportunityDTO,
  OpportunityResourceAllocationDTO,
  OpportunityResourceDTO,
  ProjectDTO,
  ProjectResourceDTO,
  PurchaseOrderDTO,
  MilestoneDTO,
} from '../dto';
import { EntityRepository, In, IsNull, Not, Repository } from 'typeorm';
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
import moment from 'moment';
import { LeaveRequest } from '../entities/leaveRequest';
import { TimesheetMilestoneEntry } from '../entities/timesheetMilestoneEntry';
import {
  EntityType,
  OpportunityStatus,
  ProjectType,
} from '../constants/constants';

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
        { where: { milestoneId: In(milestoneIds) }, relations: ['timesheet'] }
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
          projectObj.milestones[0].startDate == new Date(projectDTO.startDate);
        }
      } else {
        throw new Error('Project start date Cannot be null');
      }
      if (projectDTO.endDate) {
        projectObj.endDate = new Date(projectDTO.endDate);
        if (projectDTO.type == ProjectType.TIME_BASE) {
          projectObj.milestones[0].startDate == new Date(projectDTO.endDate);
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
    return this.findOne(id, {
      relations: ['organization', 'contactPerson', 'milestones'],
    });
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

  async getAllActiveMilestones(projectId: number): Promise<any | undefined> {
    let results = await this.manager.find(Milestone, {
      where: { projectId: projectId },
    });
    return results;
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
        { where: { milestoneId: milestone.id }, relations: ['timesheet'] }
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
      relations: ['purchaseOrders'],
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

    let newResources: any[] = [];

    for (let milestone of opportunity.milestones) {
      for (let resource of milestone.opportunityResources) {
        let newResource: any = {};
        let allocation = resource.opportunityResourceAllocations.filter(
          (x) => x.isMarkedAsSelected
        )[0];
        newResource.resourceId = resource.id;
        newResource.allocationId = allocation?.id;
        newResource = { ...newResource, ...resource, ...allocation };
        delete newResource.id;
        delete newResource.opportunityResourceAllocations;
        newResources.push(newResource);
      }
      milestone.opportunityResources = newResources;
    }

    return opportunity.milestones;
  }

  async helperGetProjectsByUserId(employeeId: number, mode: string) {
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
      if ((mode == 'M' || mode == 'm' || mode == '') && add_flag === 0)
        if (project.projectManagerId == employeeId)
          response.push({
            value: project.id,
            label: project.title,
          });
    });

    return response;
  }

  async helperGetMilestonesByUserId(employeeId: number) {
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
        if (moment(startDate).isAfter(moment(milestone.startDate), 'date')) {
          throw new Error(
            'Opportunity Start Date cannot be after Milestone Start Date'
          );
        }
      }
      for (let poisition of resources) {
        if (moment(startDate).isAfter(moment(poisition.startDate), 'date')) {
          throw new Error(
            'Opportunity Start Date cannot be after Resource / Position Start Date'
          );
        }
      }
      for (let entry of timesheetMilestoneEntries) {
        if (
          moment(startDate).isAfter(moment(entry.timesheet.startDate), 'date')
        ) {
          throw new Error(
            'Milestone Start Date cannot be After Timesheet Start Date'
          );
        }
      }
      for (let leaveRequest of leaveRequests) {
        let details = leaveRequest.getEntriesDetails;
        if (moment(startDate).isAfter(moment(details.startDate), 'date')) {
          throw new Error(
            'Milestone Start Date cannot be After Timesheet Start Date'
          );
        }
      }
    }
    if (endDate) {
      for (let milestone of milestones) {
        if (moment(endDate).isBefore(moment(milestone.endDate), 'date')) {
          throw new Error(
            'Opportunity End Date cannot be before Milestone End Date'
          );
        }
      }
      for (let poisition of resources) {
        if (moment(endDate).isBefore(moment(poisition.endDate), 'date')) {
          throw new Error(
            'Opportunity End Date cannot be before Resource / Position End Date'
          );
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
        let details = leaveRequest.getEntriesDetails;
        if (moment(startDate).isBefore(moment(details.startDate), 'date')) {
          throw new Error(
            'Milestone End Date cannot be Before Timesheet End Date'
          );
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
      for (let poisition of resources) {
        if (poisition.startDate) {
          if (moment(startDate).isAfter(moment(poisition.startDate), 'date')) {
            throw new Error(
              'Milestone Start Date cannot be After Resource / Position Start Date'
            );
          }
        }
        if (poisition.endDate) {
          if (moment(startDate).isBefore(moment(project.endDate), 'date')) {
            throw new Error(
              'Milestone Start Date cannot be Before Resource / Position End Date'
            );
          }
        }
      }
      for (let entry of timesheetMilestoneEntries) {
        if (
          moment(startDate).isAfter(moment(entry.timesheet.startDate), 'date')
        ) {
          throw new Error(
            'Milestone Start Date cannot be After Timesheet Start Date'
          );
        }
      }
      for (let leaveRequest of leaveRequests) {
        let details = leaveRequest.getEntriesDetails;
        if (moment(startDate).isAfter(moment(details.startDate), 'date')) {
          throw new Error(
            'Milestone Start Date cannot be After Timesheet Start Date'
          );
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
      for (let poisition of resources) {
        if (poisition.startDate) {
          if (moment(endDate).isAfter(moment(poisition.startDate), 'date')) {
            throw new Error(
              'Milestone End Date cannot be After Resource / Position Start Date'
            );
          }
        }
        if (poisition.endDate) {
          if (moment(endDate).isBefore(moment(project.endDate), 'date')) {
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
        let details = leaveRequest.getEntriesDetails;
        if (moment(endDate).isBefore(moment(details.startDate), 'date')) {
          throw new Error(
            'Milestone End Date cannot be Before Timesheet End Date'
          );
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
