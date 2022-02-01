import { createConnection } from 'typeorm';
const connection = createConnection();
import { getManager } from 'typeorm';
import { Employee } from './entities/employee';
import { LeaveRequestBalance } from './entities/leaveRequestBalance';
import { LeaveRequestTriggerFrequency } from './constants/constants';

connection
  .then(async () => {
    await runMonthly();
  })
  .catch((error) => {
    console.error('error in DB connection: ', error);
  });

let runMonthly = async () => {
  console.log('Monthly Cron Starts');
  getManager().transaction(async (transactionalEntityManager) => {
    let employees = await transactionalEntityManager.find(Employee, {
      relations: [
        'employmentContracts',
        'employmentContracts.leaveRequestPolicy',
        'employmentContracts.leaveRequestPolicy.leaveRequestPolicyLeaveRequestTypes',
        'leaveRequestBalances',
      ],
    });

    for (let employee of employees) {
      if (employee.getActiveContract != null) {
        if (employee.getActiveContract.leaveRequestPolicy) {
          for (let policy of employee.getActiveContract.leaveRequestPolicy
            .leaveRequestPolicyLeaveRequestTypes) {
            if (
              policy.earnEvery == LeaveRequestTriggerFrequency.MONTH ||
              policy.resetEvery == LeaveRequestTriggerFrequency.MONTH
            ) {
              let _flag_found = 0;
              for (let balance of employee.leaveRequestBalances) {
                if (policy.id == balance.typeId && _flag_found == 0) {
                  _flag_found = 1;
                }

                if (_flag_found == 1) {
                  if (policy.earnEvery == LeaveRequestTriggerFrequency.MONTH) {
                    balance.carryForward = balance.balanceHours;
                    balance.balanceHours =
                      balance.balanceHours + policy.earnHours;
                    if (balance.balanceHours > policy.threshold) {
                      balance.balanceHours = policy.threshold;
                    }
                  }
                  if (policy.resetEvery == LeaveRequestTriggerFrequency.MONTH) {
                    balance.balanceHours = policy.resetHours;
                    balance.carryForward = 0;
                    balance.used = 0;
                  }

                  await transactionalEntityManager.save(balance);
                }
              }
              if (_flag_found == 0) {
                let leaveRequestBalanceObj = new LeaveRequestBalance();
                if (policy.earnEvery == LeaveRequestTriggerFrequency.MONTH) {
                  leaveRequestBalanceObj.balanceHours = policy.earnHours;
                } else if (
                  policy.resetEvery == LeaveRequestTriggerFrequency.MONTH
                ) {
                  leaveRequestBalanceObj.balanceHours = policy.resetHours;
                }
                leaveRequestBalanceObj.typeId = policy.id;
                leaveRequestBalanceObj.employeeId = employee.id;
                leaveRequestBalanceObj.carryForward = 0;
                leaveRequestBalanceObj.used = 0;

                await transactionalEntityManager.save(leaveRequestBalanceObj);
              }
            }
          }
        }
      }
    }
  });
  console.log('Monthly Cron Ends');
};
