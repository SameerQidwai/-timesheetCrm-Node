import { EntityRepository, Repository } from "typeorm";
import { GlobalSetting } from "./../entities/globalSetting";

@EntityRepository(GlobalSetting)
export class GlobalSettingRepository extends Repository<GlobalSetting> {

    async createAndSave(globalSetting: GlobalSetting): Promise<GlobalSetting> {
        let obj = new GlobalSetting();
        obj.fromEmail = globalSetting.fromEmail;
        obj.recordsPerPage = globalSetting.recordsPerPage;
        obj.timeZone = globalSetting.timeZone;
        return await this.save(obj);
    }
}