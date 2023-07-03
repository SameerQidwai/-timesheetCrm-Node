import { getManager } from 'typeorm';
import { LeaveRequestTriggerFrequency } from './constants/constants';
import { Employee } from './entities/employee';
import moment from 'moment-timezone';
import { LeaveRequestBalance } from './entities/leaveRequestBalance';
moment.tz.setDefault('Etc/UTC');

export let runYearly = async () => {
  getManager().transaction(async (transactionalEntityManager) => {
    let employees = await transactionalEntityManager.find(Employee, {
      relations: [
        'employmentContracts',
        'employmentContracts.leaveRequestPolicy',
        'employmentContracts.leaveRequestPolicy.leaveRequestPolicyLeaveRequestTypes',
        'leaveRequestBalances',
      ],
      where: { active: true },
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
                  if (
                    policy.leaveRequestTypeId == balance.typeId &&
                    _flag_found == 0
                  ) {
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
                      balance.carryForward = policy.resetHours;
                      balance.used = 0;
                    }
                    balance.lastCronAt = moment().toDate();
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
                  leaveRequestBalanceObj.typeId = policy.leaveRequestTypeId;
                  leaveRequestBalanceObj.employeeId = employee.id;
                  leaveRequestBalanceObj.carryForward = 0;
                  leaveRequestBalanceObj.lastCronAt = moment().toDate();
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

    for (let employee of employees) {
      for (let balance of employee.leaveRequestBalances) {
        balance.carryForward = balance.balanceHours;
        balance.used = 0;
        await transactionalEntityManager.save(balance);
      }
    }
  });
};
