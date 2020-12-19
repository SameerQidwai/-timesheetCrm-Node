import { EntityRepository, Repository } from "typeorm";
import { StandardLevel } from "./../entities/standardLevel";

@EntityRepository(StandardLevel)
export class StandardLevelRepository extends Repository<StandardLevel> {

    async createAndSave(standardLevel: any): Promise<any> {
        let obj = new StandardLevel();
        obj.label = standardLevel.label;
        return await this.save(obj);
    }

    async getAllActive(): Promise<any[]> {
        return this.find();
    }

    async updateAndReturn(id: number, standardLevel: any): Promise<any|undefined> {
        await this.update(id, standardLevel);
        return this.findOne(id);
    }

    async findOneCustom(id: number): Promise<any|undefined> {
        return this.findOne(id);
    }

    async deleteCustom(id: number): Promise<any|undefined> {
        return this.softDelete(id);
    }
}