import {
  createConnection,
  EntityManager,
  getManager,
  IsNull,
  Not,
} from 'typeorm';
import { LeaveRequest } from './entities/leaveRequest';
import { LeaveRequestBalance } from './entities/leaveRequestBalance';
import { LeaveRequestPolicyLeaveRequestType } from './entities/leaveRequestPolicyLeaveRequestType';
const connection = createConnection();

connection
  .then(async () => {
    const manager = getManager();

    await manager.transaction(async (trx: EntityManager) => {
      let allBalances = await trx.find(LeaveRequestBalance, {});

      let loopedBalances: any = {};

      for (let balance of allBalances) {
        // let policyTypePivot = await trx.findOne(
        //   LeaveRequestPolicyLeaveRequestType,
        //   balance.typeId,
        //   { withDeleted: true }
        // );

        // if (!policyTypePivot) continue;

        if (loopedBalances[`${balance.typeId}_${balance.employeeId}`]) {
          await trx.remove(balance);
        } else {
          loopedBalances[`${balance.typeId}_${balance.employeeId}`] = true;
        }
      }

      for (let balance of allBalances) {
        let policyTypePivot = await trx.findOne(
          LeaveRequestPolicyLeaveRequestType,
          balance.typeId,
          { relations: ['leaveRequestType'], withDeleted: true }
        );

        if (!policyTypePivot) continue;

        balance.typeId = policyTypePivot.leaveRequestTypeId;

        await trx.save(balance);
      }

      let allLeaveRequests = await trx.find(LeaveRequest, {
        withDeleted: true,
      });

      for (let leaveRequest of allLeaveRequests) {
        if (!leaveRequest.typeId) continue;

        let policyTypePivot = await trx.findOne(
          LeaveRequestPolicyLeaveRequestType,
          leaveRequest.typeId,
          { withDeleted: true }
        );

        if (!policyTypePivot) continue;

        leaveRequest.typeId = policyTypePivot.leaveRequestTypeId;

        await trx.save(leaveRequest);
      }

      return true;
    });

    console.log('balances updated');

    return true;
  })
  .catch((error) => {
    console.error('error in DB connection: ', error);
  });
