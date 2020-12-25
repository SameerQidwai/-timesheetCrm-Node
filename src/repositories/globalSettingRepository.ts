import { GlobalSettingDTO } from "../dto";
import { EntityRepository, Repository } from "typeorm";
import { GlobalSetting } from "./../entities/globalSetting";

@EntityRepository(GlobalSetting)
export class GlobalSettingRepository extends Repository<GlobalSetting> {

    async createAndSave(globalSetting: GlobalSettingDTO): Promise<GlobalSetting | any> {
        let rowsPromises = Object.keys(globalSetting).map(async globalSettingRow => {
            let row = await this.findOne({
                where: {
                    keyLabel: globalSettingRow
                } 
            });
            if(!row) {
                row = new GlobalSetting();
                row.keyLabel = globalSettingRow
            }
            row.keyValue = globalSetting[globalSettingRow as keyof GlobalSettingDTO];
            row.dataType = "string";
            return row;
        });
        let rows = await Promise.all(rowsPromises);
        console.log("rows: ", rows);
        return this.save(rows);
        // return await this.save(rows);
    }
}