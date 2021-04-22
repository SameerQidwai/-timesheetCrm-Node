import {
  OpportunityDTO,
  OpportunityResourceAllocationDTO,
  OpportunityResourceDTO,
  ProjectDTO,
  ProjectResourceDTO,
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
      if (project.bidDate) {
        projectObj.bidDate = new Date(project.bidDate);
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
      projectObj.goPercentage = project.goPercentage;
      projectObj.getPercentage = project.getPercentage;

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

  async getAllActive(): Promise<any[]> {
    let result = await this.find({
      where: [{ status: 'P' }, { status: 'C' }],
      relations: ['organization'],
    });
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
      if (project.bidDate) {
        projectObj.bidDate = new Date(project.bidDate);
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
      projectObj.goPercentage = project.goPercentage;
      projectObj.getPercentage = project.getPercentage;

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
        resource.billableHours = projectResourceDTO.billableHours;
        resource.opportunityId = projectId;
        resource = await transactionalEntityManager.save(resource);

        let resourceAllocation = new OpportunityResourceAllocation();
        resourceAllocation.buyingRate = projectResourceDTO.buyingRate;
        resourceAllocation.sellingRate = projectResourceDTO.sellingRate;
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

      resource.panelSkillId = projectResourceDTO.panelSkillId;
      resource.panelSkillStandardLevelId =
        projectResourceDTO.panelSkillStandardLevelId;
      resource.billableHours = projectResourceDTO.billableHours;
      resource.opportunityId = projectId;

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
}
