import cron from 'node-cron';
import { getManager } from 'typeorm';
import { Employee } from '../entities/employee';
import { LeaveRequestBalance } from '../entities/leaveRequestBalance';
import { LeaveRequestTriggerFrequency } from '../constants/constants';
import moment from 'moment';

let monthCronString = '1 0 0 15 */1 *';
let yearCronString = '1 10 0 15 7 *';

export const leaveRequestMonthlyCron = cron.schedule(
  monthCronString,
  () => {
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
                        balance.lastCronAt = moment().toDate();
                        balance.used = 0;
                      }
                      promises.push(balance);
                    }
                  });
                  if (_flag_create == 1) {
                    let leaveRequestBalanceObj = new LeaveRequestBalance();
                    if (
                      policy.earnEvery == LeaveRequestTriggerFrequency.MONTH
                    ) {
                      leaveRequestBalanceObj.balanceHours = policy.earnHours;
                    } else if (
                      policy.resetEvery == LeaveRequestTriggerFrequency.MONTH
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
      console.log('Monthly Cron Ran');
    });
  },
  {
    scheduled: true,
    timezone: 'Australia/Melbourne',
  }
);

export const leaveRequestYearlyCron = cron.schedule(
  yearCronString,
  () => {
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
                      if (
                        policy.earnEvery == LeaveRequestTriggerFrequency.YEAR
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
                        policy.resetEvery == LeaveRequestTriggerFrequency.YEAR
                      ) {
                        balance.balanceHours = policy.resetHours;
                        balance.carryForward = policy.resetHours;
                        balance.lastCronAt = moment().toDate();
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

      console.log('Yearly Cron Ran');
    });
  },
  {
    scheduled: true,
    timezone: 'Australia/Melbourne',
  }
);

let runMonthlyCrons = () => {
  console.log('Scheduling Monthly Crons');
  leaveRequestMonthlyCron.start();
  return 1;
};

let runYearlyCrons = () => {
  console.log('Scheduling Yearly Crons');
  leaveRequestYearlyCron.start();
  return 1;
};

let runCrons = async () => {
  console.log('Starting Crons');
  runMonthlyCrons();
  runYearlyCrons();
};

export default runCrons = runCrons;
