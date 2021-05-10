import {
  OpportunityDTO,
  OpportunityResourceAllocationDTO,
  OpportunityResourceDTO,
  ProjectDTO,
  ProjectResourceDTO,
  PurchaseOrderDTO,
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

      await transactionalEntityManager.save(projectObj);
      return projectObj.id;
    });
    return await this.findOneCustom(id);
  }

  async getAllActive(userId: number): Promise<any[]> {
    let result = await this.find({
      where: [{ status: 'P' }, { status: 'C' }],
      relations: [
        'opportunityResources',
        'opportunityResources.panelSkill',
        'opportunityResources.panelSkillStandardLevel',
        'opportunityResources.opportunityResourceAllocations',
        'opportunityResources.opportunityResourceAllocations.contactPerson',
      ],
    });

    if (userId) {
      result.map((project, index) => {
        project.opportunityResources.map((resource) => {
          resource.opportunityResourceAllocations.filter((allocation) => {
            if (allocation.contactPersonId !== userId) {
            }
          });
        });
        result = result.slice(index, 1);
      });
    }

    return result;
  }

  async updateAndReturn(
    id: number,
    project: ProjectDTO
  ): Promise<any | undefined> {
    await this.manager.transaction(async (transactionalEntityManager) => {
      let projectObj = await this.findOneCustom(id);

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
      relations: ['organization', 'contactPerson'],
    });
  }

  async deleteCustom(id: number): Promise<any | undefined> {
    return this.softDelete(id);
  }

  async getAllActiveResources(projectId: number) {
    if (!projectId) {
      throw new Error('This Project not found!');
    }
    let project = await this.findOne(projectId, {
      relations: [
        'opportunityResources',
        'opportunityResources.panelSkill',
        'opportunityResources.panelSkillStandardLevel',
        'opportunityResources.opportunityResourceAllocations',
        'opportunityResources.opportunityResourceAllocations.contactPerson',
      ],
    });
    if (!project) {
      throw new Error('Project not found!');
    }
    return project.opportunityResources;
  }

  async addResource(projectId: number, projectResourceDTO: ProjectResourceDTO) {
    let id = await this.manager.transaction(
      async (transactionalEntityManager) => {
        if (!projectId) {
          throw new Error('Project Id not found!');
        }

        let project = await this.findOne(projectId, {
          relations: [
            'opportunityResources',
            'opportunityResources.panelSkill',
            'opportunityResources.panelSkillStandardLevel',
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
        resource = await transactionalEntityManager.save(resource);

        let resourceAllocation = new OpportunityResourceAllocation();

        if (projectResourceDTO.startDate) {
          resourceAllocation.startDate = new Date(projectResourceDTO.startDate);
        }
        if (projectResourceDTO.endDate) {
          resourceAllocation.endDate = new Date(projectResourceDTO.endDate);
        }

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

    return this.findOneCustomResource(projectId, id);
  }

  // not being used. not working either.
  async updateResource(
    projectId: number,
    id: number,
    projectResourceDTO: ProjectResourceDTO
  ) {
    await this.manager.transaction(async (transactionalEntityManager) => {
      if (!projectId) {
        throw new Error('Project not found!');
      }
      let project = await this.findOne(projectId, {
        relations: [
          'opportunityResources',
          'opportunityResources.opportunityResourceAllocations',
        ],
      });

      if (!project) {
        throw new Error('Project not found!');
      }

      let resource = project.opportunityResources.filter((x) => x.id == id)[0];
      if (!resource) {
        throw new Error('Resource not found!');
      }
      resource.billableHours = projectResourceDTO.billableHours;

      let index = resource.opportunityResourceAllocations.findIndex(
        (x) => x.isMarkedAsSelected == true
      );

      if (projectResourceDTO.startDate) {
        resource.opportunityResourceAllocations[index].startDate = new Date(
          projectResourceDTO.startDate
        );
      }
      if (projectResourceDTO.endDate) {
        resource.opportunityResourceAllocations[index].endDate = new Date(
          projectResourceDTO.endDate
        );
      }

      resource.opportunityResourceAllocations[index].buyingRate =
        projectResourceDTO.buyingRate;

      resource.opportunityResourceAllocations[index].sellingRate =
        projectResourceDTO.sellingRate;

      resource.opportunityResourceAllocations[index].effortRate =
        projectResourceDTO.effortRate;

      await transactionalEntityManager.save(resource);
    });

    return this.findOneCustomResource(projectId, id);
  }

  async findOneCustomResource(
    projectId: number,
    id: number
  ): Promise<any | undefined> {
    if (!projectId) {
      throw new Error('Project not found!');
    }
    let project = await this.findOne(projectId, {
      relations: [
        'opportunityResources',
        'opportunityResources.panelSkill',
        'opportunityResources.panelSkillStandardLevel',
        'opportunityResources.opportunityResourceAllocations',
        'opportunityResources.opportunityResourceAllocations.contactPerson',
      ],
    });
    if (!project) {
      throw new Error('Project not found!');
    }
    let resource = project.opportunityResources.filter((x) => x.id === id)[0];
    if (!resource) {
      throw new Error('Resource not found');
    }
    resource.opportunityResourceAllocations = resource.opportunityResourceAllocations.filter(
      (x) => {
        return x.isMarkedAsSelected;
      }
    );
    return resource;
  }

  // not being used. not working either
  async deleteCustomResource(
    projectId: number,
    id: number
  ): Promise<any | undefined> {
    if (!projectId) {
      throw new Error('Project not found!');
    }
    let project = await this.findOne(projectId, {
      relations: [
        'opportunityResources',
        'opportunityResources.panelSkill',
        'opportunityResources.panelSkillStandardLevel',
        'opportunityResources.opportunityResourceAllocations',
        'opportunityResources.opportunityResourceAllocations.contactPerson',
      ],
    });
    if (!project) {
      throw new Error('Project not found!');
    }
    project.opportunityResources = project.opportunityResources.filter(
      (x) => x.id !== id
    );
    return await this.manager.save(project);
  }

  async getSelectedResources(projectId: number) {
    if (!projectId) {
      throw new Error('This Project not found!');
    }
    let project = await this.findOne(projectId, {
      relations: [
        'opportunityResources',
        'opportunityResources.panelSkill',
        'opportunityResources.panelSkillStandardLevel',
        'opportunityResources.opportunityResourceAllocations',
        'opportunityResources.opportunityResourceAllocations.contactPerson',
      ],
    });

    if (!project) {
      throw new Error('Project not found!');
    }

    let selectedResources = project.opportunityResources.map((value) => {
      return {
        ...value,
        opportunityResourceAllocations: value.opportunityResourceAllocations.filter(
          (value2) => {
            return value2.isMarkedAsSelected === true;
          }
        ),
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
  // not being used. not working either
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

    project.purchaseOrders = project.purchaseOrders.filter((x) => x.id !== id);

    return await this.manager.save(project);
  }
}
