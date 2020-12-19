import { StandardLevelDTO, StandardSkillDTO } from "../dto";
import { EntityRepository,Repository } from "typeorm";
import { StandardSkill } from "./../entities/standardSkill";
import { StandardSkillStandardLevel } from "./../entities/standardSkillStandardLevel";
import { StandardLevel } from "./../entities/standardLevel";

@EntityRepository(StandardSkill)
export class StandardSkillRepository extends Repository<StandardSkill> {

    async createAndSave(standardSkill: StandardSkillDTO): Promise<any> {
        let id: number;
        id = await this.manager.transaction(async transactionalEntityManager => {
            let standardSkillObj = new StandardSkill();
            standardSkillObj.label = standardSkill.label;
            standardSkillObj = await transactionalEntityManager.save(standardSkillObj);
            id = standardSkillObj.id;
            let standardLevelList = await transactionalEntityManager.findByIds(StandardLevel, standardSkill.standardSkillStandardLevels.map(x => x.standardLevelId));
            console.log("standardLevelList.length: ", standardLevelList.length);
            
            let standardSkillStandardLevels = standardSkill.standardSkillStandardLevels.map(standardSkillStandardLevel => {
                let standardSkillStandardLevelObj = new StandardSkillStandardLevel();
                let standardLevel = standardLevelList.filter(x => x.id == standardSkillStandardLevel.standardLevelId);
                if (!standardLevel.length) {
                    throw new Error("standardLevel not found!");
                }
                standardSkillStandardLevelObj.standardSkill = standardSkillObj;
                standardSkillStandardLevelObj.standardLevel = standardLevel[0];
                standardSkillStandardLevelObj.priority = standardSkillStandardLevel.priority;
                return standardSkillStandardLevelObj;
            });
            
            standardSkillStandardLevels = await transactionalEntityManager.save(standardSkillStandardLevels);
            console.log("standardSkillStandardLevels: ", standardSkillStandardLevels);
            return standardSkillObj.id;
        });
        return await this.findOneCustom(id);
    }

    async getAllActive(): Promise<any[]> {
        return this.find({ relations: ["standardSkillStandardLevels", "standardSkillStandardLevels.standardLevel"] });
    }

    async updateAndReturn(id: number, standardSkill: StandardSkillDTO): Promise<any|undefined> {
        
        await this.manager.transaction(async transactionalEntityManager => {
            let standardSkillObj = await this.findOneCustom(id);
            standardSkillObj.label = standardSkill.label;
            let standardLevelList = await transactionalEntityManager.findByIds(StandardLevel, standardSkill.standardSkillStandardLevels.map(x => x.standardLevelId));
            
            let standardSkillStandardLevelsPromise = standardSkill.standardSkillStandardLevels.map(async standardSkillStandardLevel => {
                let standardSkillStandardLevelObj: StandardSkillStandardLevel | undefined;
                standardSkillStandardLevelObj = await transactionalEntityManager
                    .findOne(StandardSkillStandardLevel, {
                        relations: ["standardLevel", "standardSkill"],
                        where: {
                            standardLevel: {
                                id: standardSkillStandardLevel.standardLevelId
                            },
                            standardSkill: {
                                id: standardSkillObj.id
                            }
                        }
                    });
                if (!standardSkillStandardLevelObj) {
                    standardSkillStandardLevelObj = new StandardSkillStandardLevel();
                    standardSkillStandardLevelObj.standardSkill = standardSkillObj;
                    let standardLevel = standardLevelList.filter(x => x.id == standardSkillStandardLevel.standardLevelId);
                    if (!standardLevel.length) {
                        throw new Error("standardLevel not found!");
                    }
                    standardSkillStandardLevelObj.standardLevel = standardLevel[0];
                }
                console.log("standardSkillStandardLevelObj - found or not: ", standardSkillStandardLevelObj);
                
                standardSkillStandardLevelObj.priority = standardSkillStandardLevelObj.priority;
                return standardSkillStandardLevelObj;
            });
            let standardSkillStandardLevels = await Promise.all(standardSkillStandardLevelsPromise);
            standardSkillObj["standardSkillStandardLevels"] = standardSkillStandardLevels;
            await transactionalEntityManager.save(standardSkillObj);
        });
        return await this.findOneCustom(id);
    }

    async findOneCustom(id: number): Promise<any|undefined> {
        return this.findOne(id, { relations: ["standardSkillStandardLevels", "standardSkillStandardLevels.standardLevel"] });
    }

    async deleteCustom(id: number): Promise<any|undefined> {
        return this.softDelete(id);
    }

}