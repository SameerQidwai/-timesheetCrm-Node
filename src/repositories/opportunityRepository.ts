import {
  OpportunityDTO,
  MilestoneDTO,
  OpportunityResourceAllocationDTO,
  OpportunityResourceDTO,
  ProjectDTO,
  OpportunityLostDTO,
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
import { Milestone } from '../entities/milestone';
import { PurchaseOrder } from '../entities/purchaseOrder';
import { Attachment } from '../entities/attachment';
import { EntityType } from '../constants/constants';
import { Comment } from '../entities/comment';
import moment from 'moment';
import { LeaveRequest } from 'src/entities/leaveRequest';
import { Timesheet } from 'src/entities/timesheet';

@EntityRepository(Opportunity)
export class OpportunityRepository extends Repository<Opportunity> {
  async createAndSave(opportunity: OpportunityDTO): Promise<any> {
    let id: number;
    id = await this.manager.transaction(async (transactionalEntityManager) => {
      let opportunityObj = new Opportunity();
      opportunityObj.title = opportunity.title;
      if (opportunity.startDate) {
        opportunityObj.startDate = new Date(opportunity.startDate);
      }
      if (opportunity.endDate) {
        opportunityObj.endDate = new Date(opportunity.endDate);
      }
      if (opportunity.bidDate) {
        opportunityObj.bidDate = new Date(opportunity.bidDate);
      }
      if (opportunity.entryDate) {
        opportunityObj.entryDate = new Date(opportunity.entryDate);
      }
      opportunityObj.qualifiedOps = opportunity.qualifiedOps ? true : false;
      opportunityObj.value = opportunity.value;
      opportunityObj.type = opportunity.type;
      opportunityObj.tender = opportunity.tender;
      opportunityObj.tenderNumber = opportunity.tenderNumber;
      opportunityObj.hoursPerDay = opportunity.hoursPerDay;
      opportunityObj.cmPercentage = opportunity.cmPercentage;
      opportunityObj.goPercentage = opportunity.goPercentage;
      opportunityObj.getPercentage = opportunity.getPercentage;
      opportunityObj.stage = opportunity.stage;
      opportunityObj.linkedWorkId = opportunity.linkedWorkId;

      // validate organization
      let organization: Organization | undefined;
      if (opportunity.organizationId) {
        organization = await this.manager.findOne(
          Organization,
          opportunity.organizationId
        );
        if (!organization) {
          throw new Error('Organization not found');
        }
        opportunityObj.organizationId = organization.id;
      }

      // validate panel
      let panel: Panel | undefined;
      if (opportunity.panelId) {
        panel = await this.manager.findOne(Panel, opportunity.panelId);
        if (!panel) {
          throw new Error('Panel not found');
        }
        opportunityObj.panelId = panel.id;
      }

      let contactPerson: ContactPerson | undefined;
      if (opportunity.contactPersonId) {
        contactPerson = await this.manager.findOne(
          ContactPerson,
          opportunity.contactPersonId
        );
        if (!contactPerson) {
          throw new Error('Contact Person not found');
        }
        opportunityObj.contactPersonId = contactPerson.id;
      }

      let state: State | undefined;
      if (opportunity.stateId) {
        state = await this.manager.findOne(State, opportunity.stateId);
        if (!state) {
          throw new Error('State not found');
        }
        opportunityObj.stateId = state.id;
      }

      let accountDirector: Employee | undefined;
      if (opportunity.accountDirectorId) {
        accountDirector = await this.manager.findOne(
          Employee,
          opportunity.accountDirectorId
        );
        if (!accountDirector) {
          throw new Error('Account Director not found');
        }
        opportunityObj.accountDirectorId = accountDirector.id;
        // opportunityObj.accountDirectorId = 1;
      }

      let accountManager: Employee | undefined;

      if (opportunity.accountManagerId) {
        accountManager = await this.manager.findOne(
          Employee,
          opportunity.accountManagerId
        );
        if (!accountManager) {
          throw new Error('Account Manager not found');
        }
        opportunityObj.accountManagerId = accountManager.id;
        // opportunityObj.accountManagerId = 1;
      }

      let opportunityManager: Employee | undefined;
      if (opportunity.opportunityManagerId) {
        opportunityManager = await this.manager.findOne(
          Employee,
          opportunity.opportunityManagerId
        );
        if (!opportunityManager) {
          throw new Error('Opportunity Manager not found');
        }

        opportunityObj.opportunityManagerId = opportunityManager.id;
        // opportunityObj.opportunityManagerId = 1;
      }

      opportunityObj.status = 'O';

      let newOpportunity = await transactionalEntityManager.save(
        opportunityObj
      );

      //CREATING BASE MILESTONE
      let milestoneObj = new Milestone();
      milestoneObj.title = 'Default Milestone';
      milestoneObj.description = '-';
      milestoneObj.startDate = newOpportunity.startDate;
      milestoneObj.endDate = newOpportunity.startDate;
      milestoneObj.isApproved = false;
      milestoneObj.projectId = newOpportunity.id;
      milestoneObj.progress = 0;

      let newMilestone = await transactionalEntityManager.save(
        Milestone,
        milestoneObj
      );

      return newOpportunity.id;
    });

    return await this.findOneCustom(id);
  }

  async getAllActive(): Promise<any[]> {
    let result = await this.find({
      where: [
        { status: 'O' },
        { status: 'L' },
        { status: 'NB' },
        { status: 'DNP' },
      ],
      relations: ['organization', 'milestones'],
    });

    return result;
  }

  async updateAndReturn(
    id: number,
    opportunity: OpportunityDTO
  ): Promise<any | undefined> {
    await this.manager.transaction(async (transactionalEntityManager) => {
      let opportunityObj: Opportunity =
        await this.findOneCustomWithoutContactPerson(id);

      opportunityObj.title = opportunity.title;

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

      if (opportunity.startDate || opportunity.endDate) {
        this._validateOpportunityDates(
          opportunity.startDate,
          opportunity.endDate,
          milestones,
          resources
        );
      }

      if (opportunity.startDate) {
        opportunityObj.startDate = new Date(opportunity.startDate);
      }
      if (opportunity.endDate) {
        opportunityObj.endDate = new Date(opportunity.endDate);
      }
      if (opportunity.bidDate) {
        opportunityObj.bidDate = new Date(opportunity.bidDate);
      }
      if (opportunity.entryDate) {
        opportunityObj.entryDate = new Date(opportunity.entryDate);
      }
      opportunityObj.qualifiedOps = opportunity.qualifiedOps ? true : false;
      opportunityObj.value = opportunity.value;
      opportunityObj.type = opportunity.type;
      opportunityObj.tender = opportunity.tender;
      opportunityObj.tenderNumber = opportunity.tenderNumber;
      opportunityObj.hoursPerDay = opportunity.hoursPerDay;
      opportunityObj.cmPercentage = opportunity.cmPercentage;
      opportunityObj.goPercentage = opportunity.goPercentage;
      opportunityObj.getPercentage = opportunity.getPercentage;
      opportunityObj.stage = opportunity.stage;
      opportunityObj.linkedWorkId = opportunity.linkedWorkId;

      // validate organization
      let organization: Organization | undefined;
      if (opportunity.organizationId) {
        organization = await this.manager.findOne(
          Organization,
          opportunity.organizationId
        );
        if (!organization) {
          throw new Error('Organization not found');
        }
        opportunityObj.organizationId = organization.id;
      }

      // validate panel
      let panel: Panel | undefined;
      if (opportunity.panelId) {
        panel = await this.manager.findOne(Panel, opportunity.panelId);
        if (!panel) {
          throw new Error('Panel not found');
        }
        opportunityObj.panelId = panel.id;
      }

      let contactPerson: ContactPerson | undefined;
      if (opportunity.contactPersonId == null) {
        opportunityObj.contactPersonId = null;
      } else if (opportunity.contactPersonId) {
        contactPerson = await this.manager.findOne(
          ContactPerson,
          opportunity.contactPersonId
        );
        if (!contactPerson) {
          throw new Error('Contact Person not found');
        }
        opportunityObj.contactPersonId = contactPerson.id;
      }

      let state: State | undefined;
      if (opportunity.stateId) {
        state = await this.manager.findOne(State, opportunity.stateId);
        if (!state) {
          throw new Error('State not found');
        }
        opportunityObj.stateId = state.id;
      }

      let accountDirector: Employee | undefined;
      if (opportunity.accountDirectorId == null) {
        opportunityObj.accountDirectorId = null;
      } else if (opportunity.accountDirectorId) {
        accountDirector = await this.manager.findOne(
          Employee,
          opportunity.accountDirectorId
        );
        if (!accountDirector) {
          throw new Error('Account Director not found');
        }
        opportunityObj.accountDirectorId = accountDirector.id;
      }
      // opportunityObj.accountDirectorId = 1;

      let accountManager: Employee | undefined;
      if (opportunity.accountManagerId == null) {
        opportunityObj.accountManagerId = null;
      } else if (opportunity.accountManagerId) {
        accountManager = await this.manager.findOne(
          Employee,
          opportunity.accountManagerId
        );
        if (!accountManager) {
          throw new Error('Account Manager not found');
        }
        opportunityObj.accountManagerId = accountManager.id;
      }
      // opportunityObj.accountManagerId = 1;

      let opportunityManager: Employee | undefined;
      if (opportunity.opportunityManagerId == null) {
        opportunityObj.opportunityManagerId = null;
      } else if (opportunity.opportunityManagerId) {
        opportunityManager = await this.manager.findOne(
          Employee,
          opportunity.opportunityManagerId
        );
        if (!opportunityManager) {
          throw new Error('Opportunity Manager not found');
        }
        opportunityObj.opportunityManagerId = opportunityManager.id;
      }
      // opportunityObj.opportunityManagerId = 1;

      await transactionalEntityManager.save(opportunityObj);
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
      let opportunity = await transactionalEntityManager.findOne(
        Opportunity,
        id,
        {
          relations: ['milestones', 'purchaseOrders'],
        }
      );
      if (!opportunity) {
        throw new Error('Opportunity not found');
      }

      let linkedOpportunities = await transactionalEntityManager.find(
        Opportunity,
        {
          where: { linkedWorkId: id },
        }
      );

      if (opportunity.milestones) {
        throw new Error('Opportunity has milestones');
      }

      if (linkedOpportunities) {
        throw new Error('Opportunity is linked to other Opportunity / Project');
      }

      let attachments = await transactionalEntityManager.find(Attachment, {
        where: { targetType: EntityType.WORK, targetId: id },
      });

      let comments = await transactionalEntityManager.find(Comment, {
        where: { targetType: EntityType.WORK, targetId: id },
      });

      await transactionalEntityManager.softDelete(Attachment, attachments);
      await transactionalEntityManager.softDelete(Attachment, comments);

      await transactionalEntityManager.softDelete(
        PurchaseOrder,
        opportunity.purchaseOrders
      );

      await transactionalEntityManager.softDelete(Opportunity, id);
    });
  }

  async getAllActiveMilestones(
    opportunityId: number
  ): Promise<any | undefined> {
    let results = await this.manager.find(Milestone, {
      where: { projectId: opportunityId },
    });
    return results;
  }

  async addMilestone(
    opportunityId: number,
    milestoneDTO: MilestoneDTO
  ): Promise<any> {
    let milestone = new Milestone();
    milestone.title = milestoneDTO.title;
    milestone.description = milestoneDTO.description;
    milestone.startDate = new Date(milestoneDTO.startDate);
    milestone.endDate = new Date(milestoneDTO.endDate);
    milestone.isApproved = milestoneDTO.isApproved;
    milestone.projectId = opportunityId;
    milestone.progress = milestoneDTO.progress;
    return this.manager.save(milestone);
  }

  async findOneCustomMilestone(
    opportunityId: number,
    milestoneId: number
  ): Promise<any | undefined> {
    if (!opportunityId) {
      throw new Error('Opportunity not found!');
    }
    if (!milestoneId) {
      throw new Error('Milestone not found!');
    }
    let opportunity = await this.findOne(opportunityId, {
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
      throw new Error('Opportunity not found!');
    }
    let milestone = opportunity.milestones.filter((x) => x.id === milestoneId);
    if (!milestone) {
      throw new Error('Milestone not found');
    }
    return milestone;
  }

  async updateMilestone(
    opportunityId: number,
    milestoneId: number,
    milestoneDTO: MilestoneDTO
  ) {
    this.manager.transaction(async (transactionalEntityManager) => {
      if (!opportunityId) {
        throw new Error('Opportunity not found!');
      }

      if (!milestoneId) {
        throw new Error('Milestone not found!');
      }

      let opportunity = await transactionalEntityManager.findOne(
        Opportunity,
        opportunityId,
        {
          relations: ['milestones'],
        }
      );

      if (!opportunity) {
        throw new Error('Opportunity not found!');
      }

      let milestone = opportunity.milestones.filter(
        (x) => x.id == milestoneId
      )[0];
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

      if (milestoneDTO.startDate || milestoneDTO.endDate) {
        this._validateMilestoneDates(
          milestoneDTO.startDate,
          milestoneDTO.endDate,
          opportunity,
          resources
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
      await transactionalEntityManager.save(milestone);
    });

    return this.findOneCustomMilestone(opportunityId, milestoneId);
  }

  async deleteMilestone(
    opportunityId: number,
    id: number
  ): Promise<any | undefined> {
    await this.manager.transaction(async (transactionalEntityManager) => {
      let opportunity = await transactionalEntityManager.findOne(
        Opportunity,
        opportunityId,
        {
          relations: ['milestones', 'milestones.opportunityResources'],
        }
      );

      if (!opportunity) {
        throw new Error('Opportunity not found');
      }

      let milestone = opportunity.milestones.filter((x) => x.id == id)[0];

      if (!milestone) {
        throw new Error('Milestone not found');
      }

      if (milestone.opportunityResources) {
        throw new Error('Milestone has resources');
      }

      return await transactionalEntityManager.softDelete(Milestone, id);
    });
  }

  async getAllActiveResources(opportunityId: number, milestoneId: number) {
    if (!opportunityId) {
      throw new Error('This Opportunity not found!');
    }
    if (!milestoneId) {
      throw new Error('This Milestone not found!');
    }
    let opportunity = await this.findOne(opportunityId, {
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
      throw new Error('Opportunity not found!');
    }

    let milestone = opportunity.milestones.filter(
      (x) => x.id === milestoneId
    )[0];
    if (!milestone) {
      throw new Error('Milestone not found');
    }

    return milestone.opportunityResources;
  }

  async addResource(
    opportunityId: number,
    milestoneId: number,
    opportunityResourceDTO: OpportunityResourceDTO
  ) {
    if (!opportunityId) {
      throw new Error('Opportunity Id not found!');
    }

    if (!milestoneId) {
      throw new Error('This Milestone not found!');
    }
    let opportunity = await this.findOne(opportunityId, {
      relations: [
        'milestones',
        'milestones.opportunityResources',
        'milestones.opportunityResources.panelSkill',
        'milestones.opportunityResources.panelSkillStandardLevel',
      ],
    });
    if (!opportunity) {
      throw new Error('Opportunity not found!');
    }

    let milestone = opportunity.milestones.filter(
      (x) => x.id === milestoneId
    )[0];

    if (!milestone) {
      throw new Error('Milestone not found');
    }

    if (!milestone) {
      throw new Error('Milestone not found');
    }

    if (opportunityResourceDTO.startDate || opportunityResourceDTO.endDate) {
      this._validateResourceDates(
        opportunityResourceDTO.startDate,
        opportunityResourceDTO.endDate,
        milestone
      );
    }

    let resource = new OpportunityResource();
    resource.panelSkillId = opportunityResourceDTO.panelSkillId;
    resource.panelSkillStandardLevelId =
      opportunityResourceDTO.panelSkillStandardLevelId;
    resource.billableHours = opportunityResourceDTO.billableHours;
    resource.title = opportunityResourceDTO.title;
    if (opportunityResourceDTO.startDate) {
      resource.startDate = new Date(opportunityResourceDTO.startDate);
    }
    if (opportunityResourceDTO.endDate) {
      resource.endDate = new Date(opportunityResourceDTO.endDate);
    }
    // resource.startDate = opportunityResourceDTO.startDate;
    // resource.endDate = opportunityResourceDTO.endDate;
    resource.opportunityId = opportunityId;
    resource.milestoneId = milestoneId;
    console.log(opportunityId);
    resource = await this.manager.save(resource);
    return this.findOneCustomResource(opportunityId, milestoneId, resource.id);
  }

  async updateResource(
    opportunityId: number,
    milestoneId: number,
    id: number,
    opportunityResourceDTO: OpportunityResourceDTO
  ) {
    await this.manager.transaction(async (transactionalEntityManager) => {
      if (!opportunityId) {
        throw new Error('Opportunity not found!');
      }
      if (!milestoneId) {
        throw new Error('This Milestone not found!');
      }

      let opportunity = await this.findOne(opportunityId, {
        relations: ['milestones', 'milestones.opportunityResources'],
      });
      console.log(opportunity);

      if (!opportunity) {
        throw new Error('Opportunity not found!');
      }

      let milestone = opportunity.milestones.filter(
        (x) => x.id === milestoneId
      )[0];
      if (!milestone) {
        throw new Error('Milestone not found');
      }

      if (opportunityResourceDTO.startDate || opportunityResourceDTO.endDate) {
        this._validateResourceDates(
          opportunityResourceDTO.startDate,
          opportunityResourceDTO.endDate,
          milestone
        );
      }

      let resource = milestone.opportunityResources.filter(
        (x) => x.id == id
      )[0];
      if (!resource) {
        throw new Error('Resource not found!');
      }

      resource.panelSkillId = opportunityResourceDTO.panelSkillId;
      resource.panelSkillStandardLevelId =
        opportunityResourceDTO.panelSkillStandardLevelId;
      resource.billableHours = opportunityResourceDTO.billableHours;
      resource.title = opportunityResourceDTO.title;
      if (opportunityResourceDTO.startDate) {
        resource.startDate = new Date(opportunityResourceDTO.startDate);
      }
      if (opportunityResourceDTO.endDate) {
        resource.endDate = new Date(opportunityResourceDTO.endDate);
      }
      // resource.startDate = opportunityResourceDTO.startDate;
      // resource.endDate = opportunityResourceDTO.endDate;
      await this.manager.save(resource);
    });
    return this.findOneCustomResource(opportunityId, milestoneId, id);
  }

  async findOneCustomResource(
    opportunityId: number,
    milestoneId: number,
    id: number
  ): Promise<any | undefined> {
    if (!opportunityId) {
      throw new Error('Opportunity not found!');
    }

    if (!milestoneId) {
      throw new Error('This Milestone not found!');
    }
    let opportunity = await this.findOne(opportunityId, {
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
      throw new Error('Opportunity not found!');
    }

    let milestone = opportunity.milestones.filter(
      (x) => x.id === milestoneId
    )[0];
    if (!milestone) {
      throw new Error('Milestone not found');
    }

    let resource = milestone.opportunityResources.filter((x) => x.id === id);
    if (!resource) {
      throw new Error('Resource not found');
    }
    return resource;
  }

  async deleteCustomResource(
    opportunityId: number,
    milestoneId: number,
    id: number
  ): Promise<any | undefined> {
    if (!opportunityId) {
      throw new Error('Opportunity not found!');
    }
    if (!milestoneId) {
      throw new Error('This Milestone not found!');
    }
    let opportunity = await this.findOne(opportunityId, {
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
      throw new Error('Opportunity not found!');
    }

    let milestone = opportunity.milestones.filter(
      (x) => x.id === milestoneId
    )[0];

    if (!milestone) {
      throw new Error('Milestone not found');
    }

    milestone.opportunityResources = milestone.opportunityResources.filter(
      (x) => {
        if (x.id !== id) {
          return x;
        } else {
          if (x.opportunityResourceAllocations.length > 0) {
            throw new Error('Resource with allocations cannot be deleted');
          }
        }
      }
    );
    return await this.manager.save(opportunity);
  }

  async addResourceAllocation(
    opportunityId: number,
    milestoneId: number,
    opportunityResourceId: number,
    opportunityResourceAllocationDTO: OpportunityResourceAllocationDTO
  ) {
    if (!opportunityId) {
      throw new Error('Opportunity Id not found!');
    }

    if (!milestoneId) {
      throw new Error('This Milestone not found!');
    }

    if (!opportunityResourceId) {
      throw new Error('Opportunity Resource Id not found!');
    }

    let opportunity = await this.findOne(opportunityId, {
      relations: [
        'milestones',
        'milestones.opportunityResources',
        'milestones.opportunityResources.opportunityResourceAllocations',
      ],
    });

    if (!opportunity) {
      throw new Error('Opportunity not found!');
    }

    let milestone = opportunity.milestones.filter(
      (x) => x.id == milestoneId
    )[0];

    let opportunityResource = milestone.opportunityResources.filter(
      (x) => x.id == opportunityResourceId
    )[0];

    if (!opportunityResource) {
      throw new Error('Opportunity Resource not found!');
    }

    // Validate if resource is already allocated or not
    if (
      opportunityResourceAllocationDTO.contactPersonId &&
      opportunityResource.opportunityResourceAllocations.filter(
        (x) =>
          x.contactPersonId == opportunityResourceAllocationDTO.contactPersonId
      ).length
    ) {
      throw new Error('Same resource cannot be allocated multiple time!');
    }

    let resourceAllocation = new OpportunityResourceAllocation();
    resourceAllocation.buyingRate = opportunityResourceAllocationDTO.buyingRate;
    resourceAllocation.sellingRate =
      opportunityResourceAllocationDTO.sellingRate;
    // resourceAllocation.isMarkedAsSelected = opportunityResourceAllocationDTO.isMarkedAsSelected;
    if (opportunityResourceAllocationDTO.contactPersonId) {
      resourceAllocation.contactPersonId =
        opportunityResourceAllocationDTO.contactPersonId;
    }

    resourceAllocation.opportunityResourceId = opportunityResourceId;
    // resourceAllocation.startDate = opportunityResourceAllocationDTO.startDate;
    // resourceAllocation.endDate = opportunityResourceAllocationDTO.endDate;
    resourceAllocation.effortRate = opportunityResourceAllocationDTO.effortRate;

    if (opportunityResource.opportunityResourceAllocations.length == 0) {
      resourceAllocation.isMarkedAsSelected = true;
    }

    resourceAllocation = await this.manager.save(resourceAllocation);
    return this.findOneCustomResourceAllocation(
      opportunityId,
      milestoneId,
      opportunityResourceId,
      resourceAllocation.id
    );
  }

  async updateResourceAllocation(
    opportunityId: number,
    milestoneId: number,
    opportunityResourceId: number,
    id: number,
    opportunityResourceAllocationDTO: OpportunityResourceAllocationDTO
  ) {
    if (!opportunityId) {
      throw new Error('Opportunity Id not found!');
    }
    if (!milestoneId) {
      throw new Error('This Milestone not found!');
    }
    if (!opportunityResourceId) {
      throw new Error('Opportunity Resource Id not found!');
    }

    let opportunity = await this.findOne(opportunityId, {
      relations: [
        'milestones',
        'milestones.opportunityResources',
        'milestones.opportunityResources.opportunityResourceAllocations',
      ],
    });

    if (!opportunity) {
      throw new Error('Opportunity not found!');
    }

    let milestone = opportunity.milestones.filter(
      (x) => x.id == milestoneId
    )[0];

    let opportunityResource = milestone.opportunityResources.filter(
      (x) => x.id == opportunityResourceId
    )[0];

    if (!opportunityResource) {
      throw new Error('Opportunity Resource not found!');
    }

    let resourceAllocation =
      opportunityResource.opportunityResourceAllocations.filter(
        (x) => x.id == id
      )[0];
    if (!resourceAllocation) {
      throw new Error('Resource Allocation not found!');
    }

    // Validate if resource is already allocated or not
    if (
      opportunityResourceAllocationDTO.contactPersonId &&
      opportunityResource.opportunityResourceAllocations.filter(
        (x) =>
          x.contactPersonId == opportunityResourceAllocationDTO.contactPersonId
      ).length &&
      resourceAllocation.contactPersonId !=
        opportunityResourceAllocationDTO.contactPersonId
    ) {
      throw new Error('Same resource cannot be allocated multiple time!');
    }

    resourceAllocation.buyingRate = opportunityResourceAllocationDTO.buyingRate;
    resourceAllocation.sellingRate =
      opportunityResourceAllocationDTO.sellingRate;
    // resourceAllocation.isMarkedAsSelected = opportunityResourceAllocationDTO.isMarkedAsSelected;
    if (opportunityResourceAllocationDTO.contactPersonId) {
      resourceAllocation.contactPersonId =
        opportunityResourceAllocationDTO.contactPersonId;
    }
    // resourceAllocation.startDate = opportunityResourceAllocationDTO.startDate;
    // resourceAllocation.endDate = opportunityResourceAllocationDTO.endDate;
    resourceAllocation.effortRate = opportunityResourceAllocationDTO.effortRate;
    resourceAllocation.opportunityResourceId = opportunityResourceId;
    await this.manager.save(resourceAllocation);
    return this.findOneCustomResourceAllocation(
      opportunityId,
      milestoneId,
      opportunityResourceId,
      id
    );
  }

  async findOneCustomResourceAllocation(
    opportunityId: number,
    milestoneId: number,
    opportunityResourceId: number,
    id: number
  ): Promise<any | undefined> {
    if (!opportunityId) {
      throw new Error('Opportunity Id not found!');
    }

    if (!milestoneId) {
      throw new Error('This Milestone not found!');
    }

    if (!opportunityResourceId) {
      throw new Error('Opportunity Resource Id not found!');
    }

    let opportunity = await this.findOne(opportunityId, {
      relations: [
        'milestones',
        'milestones.opportunityResources',
        'milestones.opportunityResources.opportunityResourceAllocations',
        'milestones.opportunityResources.opportunityResourceAllocations.contactPerson',
      ],
    });

    if (!opportunity) {
      throw new Error('Opportunity not found!');
    }

    let milestone = opportunity.milestones.filter(
      (x) => x.id == milestoneId
    )[0];

    let opportunityResource = milestone.opportunityResources.filter(
      (x) => x.id == opportunityResourceId
    )[0];

    if (!opportunityResource) {
      throw new Error('Opportunity Resource not found!');
    }

    let resourceAllocation =
      opportunityResource.opportunityResourceAllocations.filter(
        (x) => x.id == id
      )[0];
    if (!resourceAllocation) {
      throw new Error('Resource Allocation not found!');
    }
    return resourceAllocation;
  }

  async deleteCustomResourceAllocation(
    opportunityId: number,
    milestoneId: number,
    opportunityResourceId: number,
    id: number
  ): Promise<any | undefined> {
    if (!opportunityId) {
      throw new Error('Opportunity Id not found!');
    }

    if (!milestoneId) {
      throw new Error('This Milestone not found!');
    }

    if (!opportunityResourceId) {
      throw new Error('Opportunity Resource Id not found!');
    }

    let opportunity = await this.findOne(opportunityId, {
      relations: [
        'milestones',
        'milestones.opportunityResources',
        'milestones.opportunityResources.opportunityResourceAllocations',
        'milestones.opportunityResources.opportunityResourceAllocations.contactPerson',
      ],
    });

    if (!opportunity) {
      throw new Error('Opportunity not found!');
    }

    let milestone = opportunity.milestones.filter(
      (x) => x.id == milestoneId
    )[0];

    let opportunityResource = milestone.opportunityResources.filter(
      (x) => x.id == opportunityResourceId
    )[0];

    if (!opportunityResource) {
      throw new Error('Opportunity Resource not found!');
    }

    let opportunityResourceIndex = milestone.opportunityResources.findIndex(
      (x) => x.id == opportunityResourceId
    );

    milestone.opportunityResources[
      opportunityResourceIndex
    ].opportunityResourceAllocations = milestone.opportunityResources[
      opportunityResourceIndex
    ].opportunityResourceAllocations.filter((x) => x.id !== id);
    await this.manager.save(opportunity);
    return true;
  }

  async markResourceAllocationAsSelected(
    opportunityId: number,
    milestoneId: number,
    opportunityResourceId: number,
    id: number
  ) {
    if (!opportunityId) {
      throw new Error('Opportunity Id not found!');
    }

    if (!milestoneId) {
      throw new Error('This Milestone not found!');
    }

    if (!opportunityResourceId) {
      throw new Error('Opportunity Resource Id not found!');
    }

    let opportunity = await this.findOne(opportunityId, {
      relations: [
        'milestones',
        'milestones.opportunityResources',
        'milestones.opportunityResources.opportunityResourceAllocations',
        'milestones.opportunityResources.opportunityResourceAllocations.contactPerson',
      ],
    });

    if (!opportunity) {
      throw new Error('Opportunity not found!');
    }

    let milestone = opportunity.milestones.filter(
      (x) => x.id == milestoneId
    )[0];

    let opportunityResource = milestone.opportunityResources.filter(
      (x) => x.id == opportunityResourceId
    )[0];

    if (!opportunityResource) {
      throw new Error('Opportunity Resource not found!');
    }

    let opportunityResourceIndex = milestone.opportunityResources.findIndex(
      (x) => x.id == opportunityResourceId
    );

    milestone.opportunityResources[
      opportunityResourceIndex
    ].opportunityResourceAllocations = milestone.opportunityResources[
      opportunityResourceIndex
    ].opportunityResourceAllocations.map((x) => {
      if (x.id == id) {
        x.isMarkedAsSelected = true;
      } else {
        x.isMarkedAsSelected = false;
      }
      return x;
    });
    await this.manager.save(opportunity);
    return true;
  }

  async markOpportunityAsWin(
    id: number,
    opportunity: ProjectDTO
  ): Promise<any | undefined> {
    await this.manager.transaction(async (transactionalEntityManager) => {
      let opportunityObj = await this.findOneCustomWithoutContactPerson(id);

      opportunityObj.title = opportunity.title;
      if (opportunity.startDate) {
        opportunityObj.startDate = new Date(opportunity.startDate);
      }
      if (opportunity.endDate) {
        opportunityObj.endDate = new Date(opportunity.endDate);
      }
      if (opportunity.bidDate) {
        opportunityObj.bidDate = new Date(opportunity.bidDate);
      }
      if (opportunity.entryDate) {
        opportunityObj.entryDate = new Date(opportunity.entryDate);
      }
      opportunityObj.qualifiedOps = opportunity.qualifiedOps ? true : false;
      opportunityObj.value = opportunity.value;
      opportunityObj.type = opportunity.type;
      opportunityObj.tender = opportunity.tender;
      opportunityObj.tenderNumber = opportunity.tenderNumber;
      opportunityObj.hoursPerDay = opportunity.hoursPerDay;
      opportunityObj.cmPercentage = opportunity.cmPercentage;
      opportunityObj.goPercentage = opportunity.goPercentage;
      opportunityObj.getPercentage = opportunity.getPercentage;

      // validate organization
      let organization: Organization | undefined;
      if (opportunity.organizationId) {
        organization = await this.manager.findOne(
          Organization,
          opportunity.organizationId
        );
        if (!organization) {
          throw new Error('Organization not found');
        }
        opportunityObj.organizationId = organization.id;
      }

      // validate panel
      let panel: Panel | undefined;
      if (opportunity.panelId) {
        panel = await this.manager.findOne(Panel, opportunity.panelId);
        if (!panel) {
          throw new Error('Panel not found');
        }
        opportunityObj.panelId = panel.id;
      }

      let contactPerson: ContactPerson | undefined;
      if (opportunity.contactPersonId) {
        contactPerson = await this.manager.findOne(
          ContactPerson,
          opportunity.contactPersonId
        );
        if (!contactPerson) {
          throw new Error('Contact Person not found');
        }
        opportunityObj.contactPersonId = contactPerson.id;
      }

      let state: State | undefined;
      if (opportunity.stateId) {
        state = await this.manager.findOne(State, opportunity.stateId);
        if (!state) {
          throw new Error('State not found');
        }
        opportunityObj.stateId = state.id;
      }

      let accountDirector: Employee | undefined;
      if (opportunity.accountDirectorId == null) {
        opportunityObj.accountDirectorId = null;
      } else if (opportunity.accountDirectorId) {
        accountDirector = await this.manager.findOne(
          Employee,
          opportunity.accountDirectorId
        );
        if (!accountDirector) {
          throw new Error('Account Director not found');
        }
        opportunityObj.accountDirectorId = accountDirector.id;
      }
      // opportunityObj.accountDirectorId = 1;

      let accountManager: Employee | undefined;
      if (opportunity.accountManagerId == null) {
        opportunityObj.accountManagerId = null;
      } else if (opportunity.accountManagerId) {
        accountManager = await this.manager.findOne(
          Employee,
          opportunity.accountManagerId
        );
        if (!accountManager) {
          throw new Error('Account Manager not found');
        }
        opportunityObj.accountManagerId = accountManager.id;
      }
      // opportunityObj.accountManagerId = 1;

      let opportunityManager: Employee | undefined;
      if (opportunity.projectManagerId == null) {
        opportunityObj.projectManagerId = null;
      } else if (opportunity.projectManagerId) {
        opportunityManager = await this.manager.findOne(
          Employee,
          opportunity.projectManagerId
        );
        if (!opportunityManager) {
          throw new Error('Opportunity Manager not found');
        }
        opportunityObj.projectManagerId = opportunityManager.id;
      }

      opportunityObj.status = 'P';
      opportunityObj.wonDate = new Date()
        .toISOString()
        .slice(0, 19)
        .replace('T', ' ');
      // opportunityObj.opportunityManagerId = 1;

      await transactionalEntityManager.save(opportunityObj);
    });
    return this.findOneCustom(id);
  }

  async markOpportunityAsLost(
    id: number,
    opportunityLostDTO: OpportunityLostDTO
  ): Promise<any | undefined> {
    await this.manager.transaction(async (transactionalEntityManager) => {
      let opportunityObj = await this.findOneCustom(id);

      let typeOfReason = typeof opportunityLostDTO.reason;
      let reason = '';
      let reasonArray = [];
      console.log('Type of Reason', typeOfReason);
      if (typeOfReason == 'string')
        reason = opportunityLostDTO.reason.toString();
      else if (typeOfReason == 'object') {
        reasonArray = opportunityLostDTO.reason as Array<string>;
        reasonArray.forEach((aReason) => {
          reason += `${aReason}^^`;
        });
      }
      opportunityObj.reason = reason;
      opportunityObj.status = opportunityLostDTO.status ?? 'L';
      opportunityObj.feedback = opportunityLostDTO.feedback;
      opportunityObj.wonById = opportunityObj.wonById;
      // opportunityObj.opportunityManagerId = 1;
      opportunityObj.lostDate = new Date()
        .toISOString()
        .slice(0, 19)
        .replace('T', ' ');

      await transactionalEntityManager.save(opportunityObj);
    });
    return this.findOneCustom(id);
  }

  async getManageActive(userId: number): Promise<any[]> {
    let result = await this.find({
      where: [
        {
          status: 'O',
          accountDirectorId: userId,
        },
        {
          status: 'O',
          accountManagerId: userId,
        },
        {
          status: 'O',
          opportunityManagerId: userId,
        },
        {
          status: 'L',
          accountDirectorId: userId,
        },
        {
          status: 'L',
          accountManagerId: userId,
        },
        {
          status: 'L',
          opportunityManagerId: userId,
        },
        {
          status: 'NB',
          accountDirectorId: userId,
        },
        {
          status: 'NB',
          accountManagerId: userId,
        },
        {
          status: 'NB',
          opportunityManagerId: userId,
        },
        {
          status: 'DNP',
          accountDirectorId: userId,
        },
        {
          status: 'DNP',
          accountManagerId: userId,
        },
        {
          status: 'DNP',
          opportunityManagerId: userId,
        },
      ],
      relations: ['organization', 'milestones'],
    });
    return result;
  }

  async helperGetAllWork(
    type: string,
    employeeId: number,
    organizationId: number
  ): Promise<any | undefined> {
    let work: Opportunity[];
    let data: any = [];
    let haveOrganization = false;

    if (!isNaN(organizationId) && organizationId != 0) {
      haveOrganization = true;
    }

    if (type == 'O' || type == 'o') {
      if (haveOrganization) {
        work = await this.find({
          where: [
            { status: 'O', organizationId: organizationId },
            { status: 'L', organizationId: organizationId },
            { status: 'NB', organizationId: organizationId },
            { status: 'DNP', organizationId: organizationId },
          ],
          relations: [
            'organization',
            'opportunityResources',
            'opportunityResources.opportunityResourceAllocations',
          ],
        });
      } else {
        work = await this.find({
          where: [
            { status: 'O' },
            { status: 'L' },
            { status: 'NB' },
            { status: 'DNP' },
          ],
          relations: [
            'organization',
            'opportunityResources',
            'opportunityResources.opportunityResourceAllocations',
          ],
        });
      }
    } else if (type == 'P' || type == 'p') {
      if (haveOrganization) {
        work = await this.find({
          where: [
            { status: 'P', organizationId: organizationId },
            { status: 'C', organizationId: organizationId },
          ],
          relations: [
            'organization',
            'opportunityResources',
            'opportunityResources.opportunityResourceAllocations',
          ],
        });
      } else {
        work = await this.find({
          where: [{ status: 'P' }, { status: 'C' }],
          relations: [
            'organization',
            'opportunityResources',
            'opportunityResources.opportunityResourceAllocations',
          ],
        });
      }
    } else {
      if (haveOrganization) {
        work = await this.find({
          where: { organizationId: organizationId },
          relations: [
            'organization',
            'opportunityResources',
            'opportunityResources.opportunityResourceAllocations',
          ],
        });
      } else {
        work = await this.find({});
      }
    }

    if (!isNaN(employeeId) && employeeId != 0) {
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
      work.forEach((project, index) => {
        if (type == 'P' || 'p') {
          let add_flag = 0;
          project.opportunityResources.forEach((resource) => {
            resource.opportunityResourceAllocations.forEach((allocation) => {
              if (
                allocation.contactPersonId === employeeContactPersonId &&
                allocation.isMarkedAsSelected
              ) {
                add_flag = 1;
              }
            });
          });
          if (add_flag === 1) data.push(project);
        }
      });
    }

    if (!isNaN(employeeId) && employeeId != 0) return data;

    return work;
  }

  //!--------------------------- HELPER FUNCTIONS ----------------------------//

  _validateOpportunityDates(
    startDate: Date | null,
    endDate: Date | null,
    milestones: Milestone[],
    resources: OpportunityResource[]
  ) {
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
    }
    if (endDate) {
      for (let milestone of milestones) {
        if (moment(endDate).isBefore(moment(milestone.endDate))) {
          throw new Error(
            'Opportunity End Date cannot be before Milestone End Date'
          );
        }
      }
      for (let poisition of resources) {
        if (moment(endDate).isBefore(moment(poisition.endDate))) {
          throw new Error(
            'Opportunity End Date cannot be before Resource / Position End Date'
          );
        }
      }
    }
  }

  _validateMilestoneDates(
    startDate: Date | null,
    endDate: Date | null,
    opportunity: Opportunity,
    resources: OpportunityResource[]
  ) {
    if (startDate && !opportunity.startDate) {
      throw new Error('Opportunity start date is not set');
    }
    if (endDate && !opportunity.endDate) {
      throw new Error('Opportunity end date is not set');
    }

    if (moment(startDate).isAfter(moment(endDate))) {
      throw new Error('Invalid date input');
    }

    if (startDate) {
      if (moment(startDate).isBefore(moment(opportunity.startDate), 'date')) {
        throw new Error(
          'Milestone Start Date cannot be Before Milestone Start Date'
        );
      }
      if (moment(startDate).isAfter(moment(opportunity.endDate), 'date')) {
        throw new Error(
          'Milestone Start Date cannot be After Milestone End Date'
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
          if (moment(startDate).isBefore(moment(opportunity.endDate), 'date')) {
            throw new Error(
              'Milestone Start Date cannot be Before Resource / Position Start Date'
            );
          }
        }
      }
    }
    if (endDate) {
      if (moment(endDate).isBefore(moment(opportunity.startDate), 'date')) {
        throw new Error(
          'Milestone Start Date cannot be Before Milestone Start Date'
        );
      }
      if (moment(endDate).isAfter(moment(opportunity.endDate), 'date')) {
        throw new Error(
          'Milestone Start Date cannot be After Milestone End Date'
        );
      }
      for (let poisition of resources) {
        if (poisition.startDate) {
          if (moment(endDate).isAfter(moment(poisition.startDate), 'date')) {
            throw new Error(
              'Milestone Start Date cannot be After Resource / Position Start Date'
            );
          }
        }
        if (poisition.endDate) {
          if (moment(endDate).isBefore(moment(opportunity.endDate), 'date')) {
            throw new Error(
              'Milestone Start Date cannot be Before Resource / Position Start Date'
            );
          }
        }
      }
    }
  }

  _validateResourceDates(
    startDate: Date | null,
    endDate: Date | null,
    milestone: Milestone
  ) {
    if (startDate && !milestone.startDate) {
      throw new Error('Milestone start date is not set');
    }
    if (endDate && !milestone.endDate) {
      throw new Error('Milestone end date is not set');
    }

    if (moment(startDate).isAfter(moment(endDate))) {
      throw new Error('Invalid date input');
    }

    if (startDate) {
      if (moment(startDate).isBefore(moment(milestone.startDate), 'date')) {
        throw new Error(
          'Milestone Start Date cannot be Before Milestone Start Date'
        );
      }
      if (moment(startDate).isAfter(moment(milestone.endDate), 'date')) {
        throw new Error(
          'Milestone Start Date cannot be After Milestone End Date'
        );
      }
    }

    if (endDate) {
      if (moment(endDate).isBefore(moment(milestone.startDate), 'date')) {
        throw new Error(
          'Milestone Start Date cannot be Before Milestone Start Date'
        );
      }
      if (moment(endDate).isAfter(moment(milestone.endDate), 'date')) {
        throw new Error(
          'Milestone Start Date cannot be After Milestone End Date'
        );
      }
    }
  }
}
