import { createConnection, getManager } from 'typeorm';
import { LeaveRequestBalance } from './entities/leaveRequestBalance';
import { LeaveRequestPolicyLeaveRequestType } from './entities/leaveRequestPolicyLeaveRequestType';
const connection = createConnection();

connection
  .then(async () => {
    let allBalances = await getManager().find(LeaveRequestBalance, {});

    for (let balance of allBalances) {
      let policyTypePivot = await getManager().findOne(
        LeaveRequestPolicyLeaveRequestType,
        balance.typeId,
        { relations: ['leaveRequestType'] }
      );

      if (!policyTypePivot) continue;

      balance.typeId = policyTypePivot.leaveRequestTypeId;

      await getManager().save(balance);
    }

    console.log('resources updated');

    return true;
  })
  .catch((error) => {
    console.error('error in DB connection: ', error);
  });
