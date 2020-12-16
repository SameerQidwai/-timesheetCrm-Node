import { EntityRepository, Repository } from "typeorm";
import { Sample } from "../entities/sample";

@EntityRepository(Sample)
export class SampleRepository extends Repository<Sample> {

    async createAndSave(sample: any): Promise<Sample> {
        let obj = new Sample();
        obj.title = sample.title;
        return this.save(obj);
    }

    async getAllActive(): Promise<Sample[]> {
        return await this.findByIds([1,2]);
    }

    async updateAndReturn(id: number, sample: any): Promise<Sample|undefined> {
        await this.update(id, sample);
        return this.findOne(id);
    }

    async findOneCustom(id: number): Promise<Sample|undefined> {
        return this.findOne(id);
    }
}