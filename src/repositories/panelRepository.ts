import { PanelDTO } from "../dto";
import { EntityRepository, Repository } from "typeorm";
import { Panel } from "./../entities/panel";

@EntityRepository(Panel)
export class PanelRepository extends Repository<Panel> {

    async createAndSave(panel: PanelDTO): Promise<any> {
        let obj = new Panel();
        obj.label = panel.label;
        return await this.save(obj);
    }

    async getAllActive(): Promise<any[]> {
        return this.find();
    }

    async updateAndReturn(id: number, panel: PanelDTO): Promise<any|undefined> {
        await this.update(id, panel);
        return this.findOne(id);
    }

    async findOneCustom(id: number): Promise<any|undefined> {
        return this.findOne(id);
    }

    async deleteCustom(id: number): Promise<any|undefined> {
        return this.softDelete(id);
    }
}