import { Request, Response } from "express";
import { getCustomRepository, ObjectType, Repository } from "typeorm";

export interface IRepository<D> {
    getAllActive(options?: any): Promise<D[]>;
    createAndSave(entity: D): Promise<D>;
    updateAndReturn(id: number, entity: D): Promise<D|undefined>;
    findOneCustom(id: number): Promise<D|undefined>;
    deleteCustom(id: number): Promise<any|undefined>;
}
export class BaseController<D,R extends IRepository<D>> {

    repositoryClass: ObjectType<R>;

    constructor(repositoryClass: ObjectType<R>) {
        console.log("BaseController-constructor");
        this.repositoryClass = repositoryClass; 
    }
    
    async index(req: Request, res: Response) {
        console.log("controller - index: ", this);
        const repository: IRepository<D> = getCustomRepository(this.repositoryClass);
        let queryParams = req.query;
        let options: any = {};
        console.log("queryParams: ", queryParams);
        
        // if(queryParams) {
        //     queryParams.
        // }
        let records = await repository.getAllActive(queryParams);
        console.log("records: ", records);
        res.status(200).json({
            success: true,
            message: "Get ALL",
            data: records
        });
    }

    async create(req: Request, res: Response) {

        const repository: IRepository<D> = getCustomRepository(this.repositoryClass);
        let record = await repository.createAndSave(req.body);
        console.log("record: ", record);
        res.status(200).json({
            success: true,
            message: "Create",
            data: record
        });
    }

    async update(req: Request, res: Response) {
        const repository: IRepository<D> = getCustomRepository(this.repositoryClass);
        let id = req.params.id;
        let record = await repository.updateAndReturn(parseInt(id), req.body);
        res.status(200).json({
            success: true,
            message: `Update ${req.params.id}`,
            data: record
        });
    }

    async get(req: Request, res: Response) {

        const repository: IRepository<D> = getCustomRepository(this.repositoryClass);
        let id = req.params.id;
        let record = await repository.findOneCustom(parseInt(id));
        if(!record) throw new Error("not found");
        res.status(200).json({
            success: true,
            message: `Get ${req.params.id}`,
            data: record
        });
    }

    async delete(req: Request, res: Response) {
        const repository: IRepository<D> = getCustomRepository(this.repositoryClass);
        let id = req.params.id;
        let record = await repository.deleteCustom(parseInt(id));
        res.status(200).json({
            success: true,
            message: `Delete ${req.params.id}`,
            data: record
        });
    }
}