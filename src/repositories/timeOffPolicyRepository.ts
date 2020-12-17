import { TimeOffPolicyDTO } from "../dto";
import { EntityManager, EntityRepository, getManager, Repository, Transaction, TransactionManager } from "typeorm";
import { TimeOffPolicy } from "./../entities/timeOffPolicy";
import { TimeOffPolicyTimeOffType } from "./../entities/timeOffPolicyTimeOffType";
import { TimeOffType } from "./../entities/timeOffType";

@EntityRepository(TimeOffPolicy)
export class TimeOffPolicyRepository extends Repository<TimeOffPolicy> {

    async createAndSave(timeOffPolicy: TimeOffPolicyDTO): Promise<any> {
        let id: number;
        id = await this.manager.transaction(async transactionalEntityManager => {
            let timeOffPolicyObj = new TimeOffPolicy();
            timeOffPolicyObj.label = timeOffPolicy.label;
            timeOffPolicyObj = await transactionalEntityManager.save(timeOffPolicyObj);
            id = timeOffPolicyObj.id;
            let timeOffTypeList = await transactionalEntityManager.findByIds(TimeOffType, timeOffPolicy.timeOffPolicyTimeOffTypes.map(x => x.timeOffTypeId));
            console.log("timeOffTypeList.length: ", timeOffTypeList.length);
            
            let timeOffPolicyTimeOffTypes = timeOffPolicy.timeOffPolicyTimeOffTypes.map(timeOffPolicyTimeOffType => {
                let timeOffPolicyTimeOffTypeObj = new TimeOffPolicyTimeOffType();
                let timeOffType = timeOffTypeList.filter(x => x.id == timeOffPolicyTimeOffType.timeOffTypeId);
                if (!timeOffType.length) {
                    throw new Error("timeOffType not found!");
                }
                timeOffPolicyTimeOffTypeObj.timeOffPolicy = timeOffPolicyObj;
                timeOffPolicyTimeOffTypeObj.timeOffType = timeOffType[0];
                timeOffPolicyTimeOffTypeObj.hours = timeOffPolicyTimeOffType.hours;
                timeOffPolicyTimeOffTypeObj.increaseEvery = timeOffPolicyTimeOffType.increaseEvery;
                timeOffPolicyTimeOffTypeObj.threshold = timeOffPolicyTimeOffType.threshold;
                return timeOffPolicyTimeOffTypeObj;
            });
            
            timeOffPolicyTimeOffTypes = await transactionalEntityManager.save(timeOffPolicyTimeOffTypes);
            console.log("timeOffPolicyTimeOffTypes: ", timeOffPolicyTimeOffTypes);
            return timeOffPolicyObj.id;
        });
        return await this.findOneCustom(id);
    }

    async getAllActive(): Promise<any[]> {
        return this.find({ relations: ["timeOffPolicyTimeOffTypes", "timeOffPolicyTimeOffTypes.timeOffType"] });
    }

    async updateAndReturn(id: number, timeOffPolicy: TimeOffPolicyDTO): Promise<any|undefined> {
        
        await this.manager.transaction(async transactionalEntityManager => {
            let timeOffPolicyObj = await this.findOneCustom(id);
            timeOffPolicyObj.label = timeOffPolicy.label;
            // timeOffPolicyObj = await transactionalEntityManager.save(timeOffPolicyObj);
            let timeOffTypeList = await transactionalEntityManager.findByIds(TimeOffType, timeOffPolicy.timeOffPolicyTimeOffTypes.map(x => x.timeOffTypeId));
            
            let timeOffPolicyTimeOffTypesPromise = timeOffPolicy.timeOffPolicyTimeOffTypes.map(async timeOffPolicyTimeOffType => {
                let timeOffPolicyTimeOffTypeObj: TimeOffPolicyTimeOffType | undefined;
                timeOffPolicyTimeOffTypeObj = await transactionalEntityManager
                    .findOne(TimeOffPolicyTimeOffType, {
                        relations: ["timeOffType", "timeOffPolicy"],
                        where: {
                            timeOffType: {
                                id: timeOffPolicyTimeOffType.timeOffTypeId
                            },
                            timeOffPolicy: {
                                id: timeOffPolicyObj.id
                            }
                        }
                    });
                if (!timeOffPolicyTimeOffTypeObj) {
                    timeOffPolicyTimeOffTypeObj = new TimeOffPolicyTimeOffType();
                    timeOffPolicyTimeOffTypeObj.timeOffPolicy = timeOffPolicyObj;
                    let timeOffType = timeOffTypeList.filter(x => x.id == timeOffPolicyTimeOffType.timeOffTypeId);
                    if (!timeOffType.length) {
                        throw new Error("timeOffType not found!");
                    }
                    timeOffPolicyTimeOffTypeObj.timeOffType = timeOffType[0];
                }
                console.log("timeOffPolicyTimeOffTypeObj - found or not: ", timeOffPolicyTimeOffTypeObj);
                
                timeOffPolicyTimeOffTypeObj.hours = timeOffPolicyTimeOffType.hours;
                timeOffPolicyTimeOffTypeObj.increaseEvery = timeOffPolicyTimeOffType.increaseEvery;
                timeOffPolicyTimeOffTypeObj.threshold = timeOffPolicyTimeOffType.threshold;
                return timeOffPolicyTimeOffTypeObj;
            });
            let timeOffPolicyTimeOffTypes = await Promise.all(timeOffPolicyTimeOffTypesPromise);
            timeOffPolicyObj["timeOffPolicyTimeOffTypes"] = timeOffPolicyTimeOffTypes;
            // await transactionalEntityManager.save(timeOffPolicyTimeOffTypes);
            await transactionalEntityManager.save(timeOffPolicyObj);
        });
        return await this.findOneCustom(id);
    }

    async findOneCustom(id: number): Promise<any|undefined> {
        return this.findOne(id, { relations: ["timeOffPolicyTimeOffTypes", "timeOffPolicyTimeOffTypes.timeOffType"] });
    }

    async deleteCustom(id: number): Promise<any|undefined> {
        return this.softDelete(id);
    }

}