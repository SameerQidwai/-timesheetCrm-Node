import { OpportunityDTO, OpportunityResourceDTO } from "../dto";
import { EntityRepository, Repository } from "typeorm";
import { Organization } from "./../entities/organization";
import { Opportunity } from "./../entities/opportunity";
import { Panel } from "./../entities/panel";
import { State } from "./../entities/state";
import { ContactPerson } from "./../entities/contactPerson";
import { OpportunityResource } from "./../entities/opportunityResource";

@EntityRepository(Opportunity)
export class OpportunityRepository extends Repository<Opportunity> {

    async createAndSave(opportunity: OpportunityDTO): Promise<any> {
        let id: number;
        id = await this.manager.transaction(async transactionalEntityManager => {
            let opportunityObj = new Opportunity();
            opportunityObj.title = opportunity.title;
            if(opportunity.startDate) {
                opportunityObj.startDate = new Date(opportunity.startDate);
            }
            if(opportunity.endDate) {
                opportunityObj.endDate = new Date(opportunity.endDate);
            }
            if(opportunity.bidDate) {
                opportunityObj.bidDate = new Date(opportunity.bidDate);
            }
            if(opportunity.entryDate) {
                opportunityObj.entryDate = new Date(opportunity.entryDate);
            }
            opportunityObj.qualifiedOps = (opportunity.qualifiedOps) ? true : false;
            opportunityObj.value = opportunity.value;
            opportunityObj.type = opportunity.type;
            opportunityObj.tender = opportunity.tender;
            opportunityObj.tenderNumber = opportunity.tenderNumber;
            opportunityObj.tenderValue = opportunity.tenderValue;
            opportunityObj.cmPercentage = opportunity.cmPercentage;
            opportunityObj.goPercentage = opportunity.goPercentage;
            opportunityObj.getPercentage = opportunity.getPercentage;

            // validate organization
            let organization: Organization | undefined;
            if (opportunity.organizationId) {
                organization = await this.manager.findOne(Organization, opportunity.organizationId);
                if (!organization) {
                    throw new Error("Organization not found");
                }
                opportunityObj.organizationId = organization.id;
            }

            // validate panel
            let panel: Panel | undefined;
            if (opportunity.panelId) {
                panel = await this.manager.findOne(Panel, opportunity.panelId);
                if (!panel) {
                    throw new Error("Panel not found");
                }
                opportunityObj.panelId = panel.id;
            }

            let contactPerson: ContactPerson | undefined;
            if (opportunity.contactPersonId) {
                contactPerson = await this.manager.findOne(ContactPerson, opportunity.contactPersonId);
                if (!contactPerson) {
                    throw new Error("Contact Person not found");
                }
                opportunityObj.contactPersonId = contactPerson.id;
            }

            let state: State | undefined;
            if (opportunity.stateId) {
                state = await this.manager.findOne(State, opportunity.stateId);
                if (!state) {
                    throw new Error("State not found");
                }
                opportunityObj.stateId = state.id;
            }

            await transactionalEntityManager.save(opportunityObj);
            return opportunityObj.id;
        });
        return await this.findOneCustom(id);
    }

    async getAllActive(): Promise<any[]> {
        let result = await this.find({
            relations: ["organization"]
        });
        return result
    }

    async updateAndReturn(id: number, opportunity: OpportunityDTO): Promise<any|undefined> {
        await this.manager.transaction(async transactionalEntityManager => {
            let opportunityObj = await this.findOneCustom(id);
            
            opportunityObj.title = opportunity.title;
            if(opportunity.startDate) {
                opportunityObj.startDate = new Date(opportunity.startDate);
            }
            if(opportunity.endDate) {
                opportunityObj.endDate = new Date(opportunity.endDate);
            }
            if(opportunity.bidDate) {
                opportunityObj.bidDate = new Date(opportunity.bidDate);
            }
            if(opportunity.entryDate) {
                opportunityObj.entryDate = new Date(opportunity.entryDate);
            }
            opportunityObj.qualifiedOps = (opportunity.qualifiedOps) ? true : false;
            opportunityObj.value = opportunity.value;
            opportunityObj.type = opportunity.type;
            opportunityObj.tender = opportunity.tender;
            opportunityObj.tenderNumber = opportunity.tenderNumber;
            opportunityObj.tenderValue = opportunity.tenderValue;
            opportunityObj.cmPercentage = opportunity.cmPercentage;
            opportunityObj.goPercentage = opportunity.goPercentage;
            opportunityObj.getPercentage = opportunity.getPercentage;

            // validate organization
            let organization: Organization | undefined;
            if (opportunity.organizationId) {
                organization = await this.manager.findOne(Organization, opportunity.organizationId);
                if (!organization) {
                    throw new Error("Organization not found");
                }
                opportunityObj.organizationId = organization.id;
            }

            // validate panel
            let panel: Panel | undefined;
            if (opportunity.panelId) {
                panel = await this.manager.findOne(Panel, opportunity.panelId);
                if (!panel) {
                    throw new Error("Panel not found");
                }
                opportunityObj.panelId = panel.id;
            }

            let contactPerson: ContactPerson | undefined;
            if (opportunity.contactPersonId) {
                contactPerson = await this.manager.findOne(ContactPerson, opportunity.contactPersonId);
                if (!contactPerson) {
                    throw new Error("Contact Person not found");
                }
                opportunityObj.contactPersonId = contactPerson.id;
            }

            let state: State | undefined;
            if (opportunity.stateId) {
                state = await this.manager.findOne(State, opportunity.stateId);
                if (!state) {
                    throw new Error("State not found");
                }
                opportunityObj.stateId = state.id;
            }
            
            await transactionalEntityManager.save(opportunityObj);
        });
        return this.findOneCustom(id);
    }

    async findOneCustom(id: number): Promise<any|undefined> {
        return this.findOne(id);
    }

    async deleteCustom(id: number): Promise<any|undefined> {
        return this.softDelete(id);
    }

    async getAllActiveResources(opportunityId: number) {        
        if (!opportunityId) {
            throw new Error("This Opportunity not found!");
        }
        let opportunity = await this.findOne(opportunityId, {
            relations: ["opportunityResources", "opportunityResources.panelSkill", "opportunityResources.panelSkillStandardLevel", "opportunityResources.user", "opportunityResources.user.contactPersonOrganization", "opportunityResources.user.contactPersonOrganization.contactPerson"]
        });
        if (!opportunity) {
            throw new Error("Opportunity not found!");
        }
        return opportunity.opportunityResources;
    }

    async addResource(opportunityId: number, opportunityResourceDTO: OpportunityResourceDTO) {
        
        if (!opportunityId) {
            throw new Error("Opportunity Id not found!");
        }

        let opportunity = await this.findOne(opportunityId, {
            relations: ["opportunityResources", "opportunityResources.panelSkill", "opportunityResources.panelSkillStandardLevel", "opportunityResources.user"]
        });
        if (!opportunity) {
            throw new Error("Opportunity not found!");
        }

        let resource = new OpportunityResource();
        resource.panelSkillId = opportunityResourceDTO.panelSkillId;
        resource.panelSkillStandardLevelId = opportunityResourceDTO.panelSkillStandardLevelId;
        resource.billableHours = opportunityResourceDTO.billableHours;
        resource.opportunityId = opportunityId;
        console.log(opportunityId);
        resource.sellingRate = opportunityResourceDTO.sellingRate;
        resource.buyingRate = opportunityResourceDTO.buyingRate;
        if (opportunityResourceDTO.userId) {
            let resourceExists = opportunity.opportunityResources.filter(x => x.userId == opportunityResourceDTO.userId);
            if(resourceExists.length) {
                throw new Error("Cannot add resouce for same user again");
            }
        }
        resource.userId = opportunityResourceDTO.userId;
        return this.manager.save(resource);
    }

    async updateResource(opportunityId: number, id: number, opportunityResourceDTO: OpportunityResourceDTO) {
        console.log({opportunityId}, {id}, 'sQidwai');
        
        if (!opportunityId) {
            throw new Error("Opportunity not found!");
        }
        let opportunity = await this.findOne(opportunityId, {
            relations: ["opportunityResources", "opportunityResources.panelSkill", "opportunityResources.panelSkillStandardLevel", "opportunityResources.user"]
        });
        console.log(opportunity);
        
        if (!opportunity) {
            throw new Error("Opportunity not found!");
        }

        let resource = opportunity.opportunityResources.filter(x => x.id == id)[0];
        if(!resource) {
            throw new Error("Resource not found!");
        }
        resource.panelSkillId = opportunityResourceDTO.panelSkillId;
        resource.panelSkillStandardLevelId = opportunityResourceDTO.panelSkillStandardLevelId;
        resource.billableHours = opportunityResourceDTO.billableHours;
        resource.opportunityId = opportunityId;
        resource.sellingRate = opportunityResourceDTO.sellingRate;
        resource.buyingRate = opportunityResourceDTO.buyingRate;
        if (opportunityResourceDTO.userId) {
            let resourceExists = opportunity.opportunityResources.filter(x => x.id != resource.id && x.userId == opportunityResourceDTO.userId);
            if(resourceExists.length) {
                throw new Error("Cannot add resouce for same user again");
            }
        }
        resource.userId = opportunityResourceDTO.userId;
        return this.manager.save(resource);
    }

    async findOneCustomResource(opportunityId: number, id: number): Promise<any|undefined> {
        if (!opportunityId) {
            throw new Error("Opportunity not found!");
        }
        let opportunity = await this.findOne(opportunityId, {
            relations: ["opportunityResources", "opportunityResources.panelSkill", "opportunityResources.panelSkillStandardLevel", "opportunityResources.user"]
        });
        if (!opportunity) {
            throw new Error("Opportunity not found!");
        }
        let resource = opportunity.opportunityResources.filter(x => x.id === id);
        if(!resource) {
            throw new Error("Resource not found");
        }
        return resource;
    }

    async deleteCustomResource(opportunityId: number, id: number): Promise<any|undefined> {
        if (!opportunityId) {
            throw new Error("Opportunity not found!");
        }
        let opportunity = await this.findOne(opportunityId, {
            relations: ["opportunityResources", "opportunityResources.panelSkill", "opportunityResources.panelSkillStandardLevel", "opportunityResources.user"]
        });
        if (!opportunity) {
            throw new Error("Opportunity not found!");
        }
        opportunity.opportunityResources = opportunity.opportunityResources.filter(x => x.id !== id);
        return await this.manager.save(opportunity);
    }
}