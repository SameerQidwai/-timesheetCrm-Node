import { createConnection } from 'typeorm';
const connection = createConnection();
import { getManager } from 'typeorm';
import { Employee } from './entities/employee';
import { LeaveRequestBalance } from './entities/leaveRequestBalance';
import { LeaveRequestTriggerFrequency } from './constants/constants';

connection
  .then(async () => {
    await runYearly();
  })
  .catch((error) => {
    console.error('error in DB connection: ', error);
  });

let runYearly = async () => {
  console.log('Yearly Cron Starts');
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
                policy.earnEvery == LeaveRequestTriggerFrequency.YEAR ||
                policy.resetEvery == LeaveRequestTriggerFrequency.YEAR
              ) {
                let _flag_create = 1;
                employee.leaveRequestBalances.forEach((balance) => {
                  let _flag_found = 0;
                  if (policy.id == balance.typeId && _flag_found == 0) {
                    _flag_found = 1;
                    _flag_create = 0;
                  }

                  if (_flag_found == 1) {
                    if (policy.earnEvery == LeaveRequestTriggerFrequency.YEAR) {
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
                      policy.resetEvery == LeaveRequestTriggerFrequency.YEAR
                    ) {
                      balance.balanceHours = policy.resetHours;
                      balance.carryForward = 0;
                      balance.used = 0;
                    }
                    promises.push(balance);
                  }
                });
                if (_flag_create == 1) {
                  let leaveRequestBalanceObj = new LeaveRequestBalance();
                  if (policy.earnEvery == LeaveRequestTriggerFrequency.YEAR) {
                    leaveRequestBalanceObj.balanceHours = policy.earnHours;
                  } else if (
                    policy.resetEvery == LeaveRequestTriggerFrequency.YEAR
                  ) {
                    leaveRequestBalanceObj.balanceHours = policy.resetHours;
                  }
                  leaveRequestBalanceObj.typeId = policy.id;
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

  console.log('Yearly Cron Ends');
};
