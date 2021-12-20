import {
  OpportunityDTO,
  OpportunityResourceAllocationDTO,
  OpportunityResourceDTO,
  ProjectDTO,
  ProjectResourceDTO,
  PurchaseOrderDTO,
  MilestoneDTO,
} from '../dto';
import { EntityRepository, Repository } from 'typeorm';
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
import e from 'express';

@EntityRepository(Opportunity)
export class ProjectRepository extends Repository<Opportunity> {
  async createAndSave(project: ProjectDTO): Promise<any> {
    let id: number;
    id = await this.manager.transaction(async (transactionalEntityManager) => {
      let projectObj = new Opportunity();
      projectObj.title = project.title;
      if (project.startDate) {
        projectObj.startDate = new Date(project.startDate);
      }
      if (project.endDate) {
        projectObj.endDate = new Date(project.endDate);
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
      milestoneObj.endDate = newProject.startDate;
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
    project: ProjectDTO
  ): Promise<any | undefined> {
    await this.manager.transaction(async (transactionalEntityManager) => {
      let projectObj = await this.findOneCustomWithoutContactPerson(id);

      projectObj.title = project.title;
      if (project.startDate) {
        projectObj.startDate = new Date(project.startDate);
      }
      if (project.endDate) {
        projectObj.endDate = new Date(project.endDate);
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
      if (project.contactPersonId == null) {
        projectObj.contactPersonId = null;
      } else if (project.contactPersonId) {
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
      //   projectObj.accountDirectorId = 1;

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
      //   projectObj.accountManagerId = 1;

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
    return this.softDelete(id);
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
    let milestone = new Milestone();
    milestone.title = milestoneDTO.title;
    milestone.description = milestoneDTO.description;
    milestone.startDate = new Date(milestoneDTO.startDate);
    milestone.endDate = new Date(milestoneDTO.endDate);
    milestone.isApproved = milestoneDTO.isApproved;
    milestone.projectId = projectId;
    milestone.progress = milestoneDTO.progress;
    return this.manager.save(milestone);
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
    milestone.title = milestoneDTO.title;
    milestone.description = milestoneDTO.description;
    milestone.startDate = new Date(milestoneDTO.startDate);
    milestone.endDate = new Date(milestoneDTO.endDate);
    milestone.isApproved = milestoneDTO.isApproved;
    milestone.progress = milestoneDTO.progress;
    await this.manager.save(milestone);
    return this.findOneCustomMilestone(projectId, milestoneId);
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
        ],
      });

      if (!project) {
        throw new Error('Project not found!');
      }

      let milestone = project.milestones.filter((x) => x.id == milestoneId)[0];

      let resource = milestone.opportunityResources.filter(
        (x) => x.id == id
      )[0];

      if (!resource) {
        throw new Error('Resource not found!');
      }
      resource.billableHours = projectResourceDTO.billableHours;

      if (projectResourceDTO.startDate) {
        resource.startDate = new Date(projectResourceDTO.startDate);
      }
      if (projectResourceDTO.endDate) {
        resource.endDate = new Date(projectResourceDTO.endDate);
      }

      let index = resource.opportunityResourceAllocations.findIndex(
        (x) => x.isMarkedAsSelected == true
      );

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

    milestone.opportunityResources = milestone.opportunityResources.filter(
      (x) => x.id !== id
    );
    return await this.manager.save(project);
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

  async helperGetProjectsByUserId(employeeId: number) {
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
        'opportunityResources',
        'opportunityResources.panelSkill',
        'opportunityResources.panelSkillStandardLevel',
        'opportunityResources.opportunityResourceAllocations',
        'opportunityResources.opportunityResourceAllocations.contactPerson',
      ],
    });

    // console.log('result', result);

    result.map((project) => {
      let add_flag = 0;
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
}
