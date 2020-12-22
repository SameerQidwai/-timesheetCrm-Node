import { PanelSkillDTO, StandardLevelDTO } from "../dto";
import { EntityRepository,Repository } from "typeorm";
import { StandardSkill } from "./../entities/standardSkill";
import { StandardSkillStandardLevel } from "./../entities/standardSkillStandardLevel";
import { StandardLevel } from "./../entities/standardLevel";
import { PanelSkill } from "../entities/panelSkill";
import { Panel } from "../entities/panel"
import { PanelSkillStandardLevel } from "../entities/panelSkillStandardLevel";

@EntityRepository(PanelSkill)
export class PanelSkillRepository extends Repository<PanelSkill> {

    async createAndSave(panelSkill: PanelSkillDTO): Promise<any> {
        let id: number;
        id = await this.manager.transaction(async transactionalEntityManager => {
            let panelSkillObj = new PanelSkill();
            panelSkillObj.label = panelSkill.label;
            let standardSkill = await transactionalEntityManager.findOne(StandardSkill,panelSkill.standardSkillId);
            let panel = await transactionalEntityManager.findOne(Panel,panelSkill.panelId);
            if(!standardSkill) {
                throw new Error("Standard Skill not found");
            }
            if(!panel) {
                throw new Error("Panel not found");
            }
            panelSkillObj.standardSkill = standardSkill;
            panelSkillObj.panel = panel;
            panelSkillObj = await transactionalEntityManager.save(panelSkillObj);
            id = panelSkillObj.id;
            let standardLevelList = await transactionalEntityManager.findByIds(StandardLevel, panelSkill.panelSkillStandardLevels.map(x => x.standardLevelId));
            console.log("standardLevelList.length: ", standardLevelList.length);
            
            let panelSkillStandardLevels = panelSkill.panelSkillStandardLevels.map(panelSkillStandardLevel => {
                let panelSkillStandardLevelObj = new PanelSkillStandardLevel();
                let standardLevel = standardLevelList.filter(x => x.id == panelSkillStandardLevel.standardLevelId);
                if (!standardLevel.length) {
                    throw new Error("standardLevel not found!");
                }
                panelSkillStandardLevelObj.standardLevel = standardLevel[0];
                panelSkillStandardLevelObj.levelLabel = panelSkillStandardLevel.levelLabel;
                panelSkillStandardLevelObj.shortTermCeil = panelSkillStandardLevel.shortTermCeil;
                panelSkillStandardLevelObj.longTermCeil = panelSkillStandardLevel.longTermCeil;
                panelSkillStandardLevelObj.panelSkill = panelSkillObj;
                return panelSkillStandardLevelObj;
            });
            
            panelSkillStandardLevels = await transactionalEntityManager.save(panelSkillStandardLevels);
            console.log("panelSkillStandardLevels: ", panelSkillStandardLevels);
            return panelSkillObj.id;
        });
        return await this.findOneCustom(id);
    }

    async getAllActive(options?: any): Promise<any[]> {
        let params: any = { relations: ["standardSkill", "panelSkillStandardLevels", "panelSkillStandardLevels.standardLevel"] };
        if (options) {
            params = {
                ...params,
                where: {
                    panel: {
                        id: options.panelId
                    }
                }
            }
        }
        return this.find(params);
    }

    async updateAndReturn(id: number, panelSkill: PanelSkillDTO): Promise<any|undefined> {
        
        await this.manager.transaction(async transactionalEntityManager => {
            let panelSkillObj = await this.findOneCustom(id);
            panelSkillObj.label = panelSkill.label;
            let standardLevelList = await transactionalEntityManager.findByIds(StandardLevel, panelSkill.panelSkillStandardLevels.map(x => x.standardLevelId));
            
            let panelSkillStandardLevelsPromise = panelSkill.panelSkillStandardLevels.map(async panelSkillStandardLevel => {
                let panelSkillStandardLevelObj: PanelSkillStandardLevel | undefined;
                panelSkillStandardLevelObj = await transactionalEntityManager
                    .findOne(PanelSkillStandardLevel, {
                        relations: ["standardLevel", "panelSkill"],
                        where: {
                            standardLevel: {
                                id: panelSkillStandardLevel.standardLevelId
                            },
                            panelSkill: {
                                id: panelSkillObj.id
                            }
                        }
                    });
                if (!panelSkillStandardLevelObj) {
                    panelSkillStandardLevelObj = new PanelSkillStandardLevel();
                    panelSkillStandardLevelObj.panelSkill = panelSkillObj;
                    let standardLevel = standardLevelList.filter(x => x.id == panelSkillStandardLevel.standardLevelId);
                    if (!standardLevel.length) {
                        throw new Error("standardLevel not found!");
                    }
                    panelSkillStandardLevelObj.standardLevel = standardLevel[0];
                }
                console.log("panelSkillStandardLevelObj - found or not: ", panelSkillStandardLevelObj);
                
                panelSkillStandardLevelObj.levelLabel = panelSkillStandardLevelObj.levelLabel;
                panelSkillStandardLevelObj.shortTermCeil = panelSkillStandardLevelObj.shortTermCeil;
                panelSkillStandardLevelObj.longTermCeil = panelSkillStandardLevelObj.longTermCeil;
                return panelSkillStandardLevelObj;
            });
            let panelSkillStandardLevels = await Promise.all(panelSkillStandardLevelsPromise);
            panelSkillObj["panelSkillStandardLevels"] = panelSkillStandardLevels;
            await transactionalEntityManager.save(panelSkillObj);
        });
        return await this.findOneCustom(id);
    }

    async findOneCustom(id: number): Promise<any|undefined> {
        return this.findOne(id, { relations: ["standardSkill", "panelSkillStandardLevels", "panelSkillStandardLevels.standardLevel"] });
    }

    async deleteCustom(id: number): Promise<any|undefined> {
        return this.softDelete(id);
    }

}