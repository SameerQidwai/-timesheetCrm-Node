import { StateDTO } from "../dto";
import { EntityRepository, Repository } from "typeorm";
import { State } from "./../entities/state";

@EntityRepository(State)
export class StateRepository extends Repository<State> {

    async createAndSave(state: StateDTO): Promise<any> {
        let obj = new State();
        obj.label = state.label;
        return await this.save(obj);
    }

    async getAllActive(): Promise<any[]> {
        return this.find();
    }

    async updateAndReturn(id: number, state: StateDTO): Promise<any|undefined> {
        await this.update(id, state);
        return this.findOne(id);
    }

    async findOneCustom(id: number): Promise<any|undefined> {
        return this.findOne(id);
    }

    async deleteCustom(id: number): Promise<any|undefined> {
        return this.softDelete(id);
    }
}