import { OpportunityDTO, OpportunityResourceDTO } from "./../dto";
import { BaseController } from "./baseController";
import { OpportunityRepository } from "./../repositories/opportunityRepository";
import { Request, Response } from "express";
import { OpportunityResource } from "src/entities/opportunityResource";
import { getCustomRepository } from "typeorm";

export class OpportunityResourceController {
    
    async index(req: Request, res: Response) {
        console.log("controller - index: ", this);
        const repository = getCustomRepository(OpportunityRepository);
        let opportunityId = req.params.opportunityId;
        let records = await repository.getAllActiveResources(parseInt(opportunityId));
        console.log("records: ", records);
        res.status(200).json({
            success: true,
            message: "Get ALL",
            data: records
        });
    }

    async create(req: Request, res: Response) {

        const repository = getCustomRepository(OpportunityRepository);
        let opportunityId = req.params.opportunityId;
        let record = await repository.addResource(parseInt(opportunityId),req.body);
        console.log("record: ", record);
        res.status(200).json({
            success: true,
            message: "Create",
            data: record
        });
    }

    async update(req: Request, res: Response) {
        const repository = getCustomRepository(OpportunityRepository);
        let id = req.params.id;
        let opportunityId = req.params.opportunityId;
        let record = await repository.updateResource(parseInt(opportunityId), parseInt(id), req.body);
        res.status(200).json({
            success: true,
            message: `Update ${req.params.id}`,
            data: record
        });
    }

    async get(req: Request, res: Response) {

        const repository = getCustomRepository(OpportunityRepository);
        let id = req.params.id;
        let opportunityId = req.params.opportunityId;
        let record = await repository.findOneCustomResource(parseInt(opportunityId), parseInt(id));
        if(!record) throw new Error("not found");
        res.status(200).json({
            success: true,
            message: `Get ${req.params.id}`,
            data: record
        });
    }

    async delete(req: Request, res: Response) {
        const repository = getCustomRepository(OpportunityRepository);
        let id = req.params.id;
        let opportunityId = req.params.opportunityId;
        let record = await repository.deleteCustomResource(parseInt(opportunityId), parseInt(id));
        res.status(200).json({
            success: true,
            message: `Delete ${req.params.id}`,
            data: record
        });
    }
}