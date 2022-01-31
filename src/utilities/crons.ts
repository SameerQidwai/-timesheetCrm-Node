import cron from 'node-cron';
import { getManager } from 'typeorm';
import { Employee } from '../entities/employee';
import { LeaveRequestBalance } from '../entities/leaveRequestBalance';
import { LeaveRequestTriggerFrequency } from '../constants/constants';

let monthCronString = '0 0 * */1 *';
let yearCronString = '0 0 * */12 *';

export const leaveRequestMonthlyCron = cron.schedule(
  monthCronString,
  () => {
    console.log('Monthly Cron Ran');
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
                    if (
                      policy.earnEvery == LeaveRequestTriggerFrequency.MONTH
                    ) {
                      balance.carryForward = balance.balanceHours;
                      balance.balanceHours =
                        balance.balanceHours + policy.earnHours;
                    }
                    if (
                      policy.resetEvery == LeaveRequestTriggerFrequency.MONTH
                    ) {
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
  },
  {
    scheduled: false,
  }
);

export const leaveRequestYearlyCron = cron.schedule(
  yearCronString,
  () => {
    console.log('Yearly Cron Ran');
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
                policy.earnEvery == LeaveRequestTriggerFrequency.YEAR ||
                policy.resetEvery == LeaveRequestTriggerFrequency.YEAR
              ) {
                let _flag_found = 0;
                for (let balance of employee.leaveRequestBalances) {
                  if (policy.id == balance.typeId && _flag_found == 0) {
                    _flag_found = 1;
                  }

                  if (_flag_found == 1) {
                    if (policy.earnEvery == LeaveRequestTriggerFrequency.YEAR) {
                      balance.carryForward = balance.balanceHours;
                      balance.balanceHours =
                        balance.balanceHours + policy.earnHours;
                    }
                    if (
                      policy.resetEvery == LeaveRequestTriggerFrequency.YEAR
                    ) {
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
  },
  {
    scheduled: false,
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
