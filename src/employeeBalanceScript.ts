import { createConnection, getManager } from 'typeorm';
import { Employee } from './entities/employee';
import { LeaveRequestBalance } from './entities/leaveRequestBalance';
const connection = createConnection();

connection
  .then(async () => {
    console.log('Left out Employee Balance Script Start');
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
                let _flag_found = 0;
                employee.leaveRequestBalances.forEach((balance) => {
                  if (policy.id == balance.typeId && _flag_found == 0) {
                    _flag_found = 1;
                  }
                });
                if (_flag_found == 0) {
                  let leaveRequestBalanceObj = new LeaveRequestBalance();
                  leaveRequestBalanceObj.balanceHours = 0;
                  leaveRequestBalanceObj.typeId = policy.id;
                  leaveRequestBalanceObj.employeeId = employee.id;
                  leaveRequestBalanceObj.carryForward = 0;
                  leaveRequestBalanceObj.used = 0;

                  promises.push(leaveRequestBalanceObj);
                }
              }
            );
          }
        }
      });
      let balances = await Promise.all(promises);
      await transactionalEntityManager.save(balances);
      console.log('Left out Employee Balance Script End');
    });
  })
  .catch((error) => {
    console.error('error in DB connection: ', error);
  });
