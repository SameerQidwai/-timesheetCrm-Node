import { OpportunityDTO } from "../dto";
import { EntityRepository, Repository } from "typeorm";
import { Organization } from "./../entities/organization";
import { Opportunity } from "./../entities/opportunity";
import { Panel } from "./../entities/panel";

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
            await transactionalEntityManager.save(opportunityObj);
            return opportunityObj.id;
        });
        return await this.findOneCustom(id);
    }

    async getAllActive(): Promise<any[]> {
        return this.find();
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
}