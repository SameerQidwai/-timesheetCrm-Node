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
    let promises: any = [];
    employees.forEach((employee) => {
      if (employee.getActiveContract != null) {
        if (employee.getActiveContract.leaveRequestPolicy) {
          employee.getActiveContract.leaveRequestPolicy.leaveRequestPolicyLeaveRequestTypes.forEach(
            (policy) => {
              if (
                policy.earnEvery == LeaveRequestTriggerFrequency.MONTH
                // ||policy.resetEvery == LeaveRequestTriggerFrequency.MONTH
              ) {
                let _flag_create = 1;
                employee.leaveRequestBalances.forEach((balance) => {
                  let _flag_found = 0;
                  if (
                    policy.leaveRequestTypeId == balance.typeId &&
                    _flag_found == 0
                  ) {
                    _flag_found = 1;
                    _flag_create = 0;
                  }

                  if (_flag_found == 1) {
                    if (
                      policy.earnEvery == LeaveRequestTriggerFrequency.MONTH
                    ) {
                      // balance.carryForward = balance.balanceHours;
                      if (balance.balanceHours > policy.threshold) {
                        if (policy.threshold == 0) {
                          balance.balanceHours =
                            balance.balanceHours + policy.earnHours;
                        } else if (policy.threshold != 0) {
                          balance.balanceHours = policy.threshold;
                        }
                      } else {
                        balance.balanceHours =
                          balance.balanceHours + policy.earnHours;
                      }
                    }
                    if (
                      policy.resetEvery == LeaveRequestTriggerFrequency.MONTH
                    ) {
                      balance.balanceHours = policy.resetHours;
                      balance.carryForward = policy.resetHours;
                      balance.used = 0;
                    }
                    promises.push(balance);
                  }
                });
                if (_flag_create == 1) {
                  let leaveRequestBalanceObj = new LeaveRequestBalance();
                  if (policy.earnEvery == LeaveRequestTriggerFrequency.MONTH) {
                    leaveRequestBalanceObj.balanceHours = policy.earnHours;
                  } else if (
                    policy.resetEvery == LeaveRequestTriggerFrequency.MONTH
                  ) {
                    leaveRequestBalanceObj.balanceHours = policy.resetHours;
                  }
                  leaveRequestBalanceObj.typeId = policy.leaveRequestTypeId;
                  leaveRequestBalanceObj.employeeId = employee.id;
                  leaveRequestBalanceObj.carryForward = 0;
                  leaveRequestBalanceObj.used = 0;

                  promises.push(leaveRequestBalanceObj);
                }
              }
            }
          );
        }
      }
    });

    let balances = await Promise.all(promises);
    await transactionalEntityManager.save(balances);
  });
  console.log('Monthly Cron Ends');
  return 1;
};
