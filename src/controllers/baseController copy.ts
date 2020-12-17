import { Request, Response } from "express";
import { getCustomRepository, ObjectType, Repository } from "typeorm";

export interface IRepository<E> extends Repository<E> {
    getAllActive(): Promise<E[]>;
    createAndSave(entity: any): Promise<E>;
    updateAndReturn(id: number, entity: any): Promise<E|undefined>;
    findOneCustom(id: number): Promise<E|undefined>;
}
export class BaseController<E,R extends IRepository<E>> {

    repository: ObjectType<R>;

    constructor(repository: ObjectType<R>) {
        console.log("BaseController-constructor");
        this.repository = repository; 
    }
    
    async index(req: Request, res: Response) {
        console.log("controller - index: ", this);
        const sampleRepository: IRepository<E> = getCustomRepository(this.repository);
        let records = await sampleRepository.getAllActive();
        console.log("records: ", records);
        res.status(200).json({
            success: true,
            message: "Get ALL",
            data: records
        });
    }

    async create(req: Request, res: Response) {

        const sampleRepository: IRepository<E> = getCustomRepository(this.repository);
        let record = await sampleRepository.createAndSave(req.body);
        console.log("record: ", record);
        res.status(200).json({
            success: true,
            message: "Create",
            data: record
        });
    }

    async update(req: Request, res: Response) {
        const sampleRepository: IRepository<E> = getCustomRepository(this.repository);
        let id = req.params.id;
        let record = await sampleRepository.updateAndReturn(parseInt(id), req.body);
        res.status(200).json({
            success: true,
            message: `Update ${req.params.id}`,
            data: record
        });
    }

    async get(req: Request, res: Response) {

        const sampleRepository = getCustomRepository(this.repository);
        let id = req.params.id;
        let record = await sampleRepository.findOneCustom(parseInt(id));
        if(!record) throw new Error("not found");
        res.status(200).json({
            success: true,
            message: `Get ${req.params.id}`,
            data: record
        });
    }

    async delete(req: Request, res: Response) {
        const sampleRepository = getCustomRepository(this.repository);
        let id = req.params.id;
        let record = await sampleRepository.softDelete(parseInt(id));
        res.status(200).json({
            success: true,
            message: `Delete ${req.params.id}`,
            data: record
        });
    }
}