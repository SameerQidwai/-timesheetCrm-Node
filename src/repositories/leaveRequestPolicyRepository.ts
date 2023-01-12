import { LeaveRequestPolicyDTO } from '../dto';
import { EntityRepository, Repository } from 'typeorm';
import { LeaveRequestPolicy } from '../entities/leaveRequestPolicy';
import { LeaveRequestPolicyLeaveRequestType } from '../entities/leaveRequestPolicyLeaveRequestType';
import { LeaveRequestType } from '../entities/leaveRequestType';
import { EmploymentContract } from '../entities/employmentContract';
import { LeaveRequestBalance } from '../entities/leaveRequestBalance';

@EntityRepository(LeaveRequestPolicy)
export class LeaveRequestPolicyRepository extends Repository<LeaveRequestPolicy> {
  async createAndSave(leaveRequestPolicy: LeaveRequestPolicyDTO): Promise<any> {
    let id: number;
    id = await this.manager.transaction(async (transactionalEntityManager) => {
      let leaveRequestPolicyObj = new LeaveRequestPolicy();
      leaveRequestPolicyObj.label = leaveRequestPolicy.label;
      leaveRequestPolicyObj = await transactionalEntityManager.save(
        leaveRequestPolicyObj
      );
      id = leaveRequestPolicyObj.id;
      let leaveRequestTypeList = await transactionalEntityManager.findByIds(
        LeaveRequestType,
        leaveRequestPolicy.leaveRequestPolicyLeaveRequestTypes.map(
          (x) => x.leaveRequestTypeId
        )
      );
      console.log('leaveRequestTypeList.length: ', leaveRequestTypeList.length);

      let leaveRequestPolicyLeaveRequestTypes =
        leaveRequestPolicy.leaveRequestPolicyLeaveRequestTypes.map(
          (leaveRequestPolicyLeaveRequestType) => {
            let leaveRequestPolicyLeaveRequestTypeObj =
              new LeaveRequestPolicyLeaveRequestType();
            let leaveRequestType = leaveRequestTypeList.filter(
              (x) =>
                x.id == leaveRequestPolicyLeaveRequestType.leaveRequestTypeId
            );
            if (!leaveRequestType.length) {
              throw new Error('leaveRequestType not found!');
            }
            leaveRequestPolicyLeaveRequestTypeObj.leaveRequestPolicy =
              leaveRequestPolicyObj;
            leaveRequestPolicyLeaveRequestTypeObj.leaveRequestType =
              leaveRequestType[0];
            leaveRequestPolicyLeaveRequestTypeObj.earnHours =
              leaveRequestPolicyLeaveRequestType.earnHours;
            leaveRequestPolicyLeaveRequestTypeObj.earnEvery =
              leaveRequestPolicyLeaveRequestType.earnEvery;
            leaveRequestPolicyLeaveRequestTypeObj.resetHours =
              leaveRequestPolicyLeaveRequestType.resetHours;
            leaveRequestPolicyLeaveRequestTypeObj.resetEvery =
              leaveRequestPolicyLeaveRequestType.resetEvery;
            leaveRequestPolicyLeaveRequestTypeObj.threshold =
              leaveRequestPolicyLeaveRequestType.threshold;
            leaveRequestPolicyLeaveRequestTypeObj.minimumBalance =
              leaveRequestPolicyLeaveRequestType.minimumBalance;
            leaveRequestPolicyLeaveRequestTypeObj.minimumBalanceRequired =
              leaveRequestPolicyLeaveRequestType.minimumBalanceRequired;
            leaveRequestPolicyLeaveRequestTypeObj.includeOffDays =
              leaveRequestPolicyLeaveRequestType.includeOffDays;
            return leaveRequestPolicyLeaveRequestTypeObj;
          }
        );

      leaveRequestPolicyLeaveRequestTypes =
        await transactionalEntityManager.save(
          leaveRequestPolicyLeaveRequestTypes
        );
      console.log(
        'leaveRequestPolicyLeaveRequestTypes: ',
        leaveRequestPolicyLeaveRequestTypes
      );
      return leaveRequestPolicyObj.id;
    });
    return await this.findOneCustom(id);
  }

  async getAllActive(): Promise<any[]> {
    return this.find({
      relations: [
        'leaveRequestPolicyLeaveRequestTypes',
        'leaveRequestPolicyLeaveRequestTypes.leaveRequestType',
      ],
    });
  }

  async updateAndReturn(
    id: number,
    leaveRequestPolicy: LeaveRequestPolicyDTO
  ): Promise<any | undefined> {
    await this.manager.transaction(async (transactionalEntityManager) => {
      let leaveRequestPolicyObj = await this.findOneCustom(id);
      leaveRequestPolicyObj.label = leaveRequestPolicy.label;
      // leaveRequestPolicyObj = await transactionalEntityManager.save(leaveRequestPolicyObj);
      let leaveRequestTypeList = await transactionalEntityManager.findByIds(
        LeaveRequestType,
        leaveRequestPolicy.leaveRequestPolicyLeaveRequestTypes.map(
          (x) => x.leaveRequestTypeId
        )
      );

      let leaveRequestPolicyLeaveRequestTypesPromise =
        leaveRequestPolicy.leaveRequestPolicyLeaveRequestTypes.map(
          async (leaveRequestPolicyLeaveRequestType) => {
            let leaveRequestPolicyLeaveRequestTypeObj:
              | LeaveRequestPolicyLeaveRequestType
              | undefined;
            leaveRequestPolicyLeaveRequestTypeObj =
              await transactionalEntityManager.findOne(
                LeaveRequestPolicyLeaveRequestType,
                {
                  relations: ['leaveRequestType', 'leaveRequestPolicy'],
                  where: {
                    leaveRequestType: {
                      id: leaveRequestPolicyLeaveRequestType.leaveRequestTypeId,
                    },
                    leaveRequestPolicy: {
                      id: leaveRequestPolicyObj.id,
                    },
                  },
                }
              );
            if (!leaveRequestPolicyLeaveRequestTypeObj) {
              leaveRequestPolicyLeaveRequestTypeObj =
                new LeaveRequestPolicyLeaveRequestType();
              leaveRequestPolicyLeaveRequestTypeObj.leaveRequestPolicy =
                leaveRequestPolicyObj;
              let leaveRequestType = leaveRequestTypeList.filter(
                (x) =>
                  x.id == leaveRequestPolicyLeaveRequestType.leaveRequestTypeId
              );
              if (!leaveRequestType.length) {
                throw new Error('leaveRequestType not found!');
              }
              leaveRequestPolicyLeaveRequestTypeObj.leaveRequestType =
                leaveRequestType[0];
            }
            console.log(
              'leaveRequestPolicyLeaveRequestTypeObj - found or not: ',
              leaveRequestPolicyLeaveRequestTypeObj
            );

            leaveRequestPolicyLeaveRequestTypeObj.earnHours =
              leaveRequestPolicyLeaveRequestType.earnHours;
            leaveRequestPolicyLeaveRequestTypeObj.earnEvery =
              leaveRequestPolicyLeaveRequestType.earnEvery;
            leaveRequestPolicyLeaveRequestTypeObj.resetHours =
              leaveRequestPolicyLeaveRequestType.resetHours;
            leaveRequestPolicyLeaveRequestTypeObj.resetEvery =
              leaveRequestPolicyLeaveRequestType.resetEvery;
            leaveRequestPolicyLeaveRequestTypeObj.threshold =
              leaveRequestPolicyLeaveRequestType.threshold;
            leaveRequestPolicyLeaveRequestTypeObj.minimumBalance =
              leaveRequestPolicyLeaveRequestType.minimumBalance;
            leaveRequestPolicyLeaveRequestTypeObj.minimumBalanceRequired =
              leaveRequestPolicyLeaveRequestType.minimumBalanceRequired;
            leaveRequestPolicyLeaveRequestTypeObj.includeOffDays =
              leaveRequestPolicyLeaveRequestType.includeOffDays;
            return leaveRequestPolicyLeaveRequestTypeObj;
          }
        );
      let leaveRequestPolicyLeaveRequestTypes = await Promise.all(
        leaveRequestPolicyLeaveRequestTypesPromise
      );
      leaveRequestPolicyObj['leaveRequestPolicyLeaveRequestTypes'] =
        leaveRequestPolicyLeaveRequestTypes;
      // await transactionalEntityManager.save(leaveRequestPolicyLeaveRequestTypes);
      await transactionalEntityManager.save(leaveRequestPolicyObj);

      let contracts = await transactionalEntityManager.find(
        EmploymentContract,
        {
          where: { leaveRequestPolicyId: id },
          relations: [
            'employee',
            'employee.leaveRequestBalances',
            'leaveRequestPolicy',
            'leaveRequestPolicy.leaveRequestPolicyLeaveRequestTypes',
          ],
        }
      );

      for (let contract of contracts) {
        if (!contract.isActive) continue;
        for (let policy of contract.leaveRequestPolicy
          .leaveRequestPolicyLeaveRequestTypes) {
          let _flag_found = 0;
          for (let balance of contract.employee.leaveRequestBalances) {
            if (
              policy.leaveRequestTypeId == balance.typeId &&
              _flag_found == 0
            ) {
              _flag_found = 1;
            }
          }

          if (_flag_found == 0) {
            let leaveRequestBalanceObj = new LeaveRequestBalance();
            leaveRequestBalanceObj.balanceHours = 0;
            leaveRequestBalanceObj.carryForward = 0;
            leaveRequestBalanceObj.used = 0;
            leaveRequestBalanceObj.typeId = policy.leaveRequestTypeId;
            leaveRequestBalanceObj.employeeId = contract.employee.id;

            await transactionalEntityManager.save(leaveRequestBalanceObj);
          }
        }
      }
    });

    return await this.findOneCustom(id);
  }

  async findOneCustom(id: number): Promise<any | undefined> {
    return this.findOne(id, {
      relations: [
        'leaveRequestPolicyLeaveRequestTypes',
        'leaveRequestPolicyLeaveRequestTypes.leaveRequestType',
      ],
    });
  }

  async deleteCustom(id: number): Promise<any | undefined> {
    return this.softDelete(id);
  }
}
