import { EmploymentContractDTO } from '../dto';
import { EntityRepository, Repository } from 'typeorm';
import { EmploymentContract } from './../entities/employmentContract';
import { Employee } from './../entities/employee';
import { LeaveRequestBalance } from '../entities/leaveRequestBalance';

@EntityRepository(EmploymentContract)
export class EmploymentContractRepository extends Repository<EmploymentContract> {
  async createAndSave(employmentContract: EmploymentContractDTO): Promise<any> {
    let contract = await this.manager.transaction(
      async (transactionalEntityManager) => {
        let employee = await this.manager.findOne(
          Employee,
          employmentContract.employeeId,
          { relations: ['leaveRequestBalances'] }
        );
        if (!employee) {
          throw new Error('Employee not found');
        }

        // check any overlapping contract
        let { count } = await this.createQueryBuilder('employmentContract')
          .select('Count(*)', 'count')
          .where('employee_id = ' + employmentContract.employeeId)
          .andWhere(
            '(end_date is NULL OR FROM_UNIXTIME(' +
              employmentContract.startDate +
              '/1000) <= end_date) AND (' +
              (employmentContract.endDate || 'NULL') +
              ' is NULL OR start_date <= FROM_UNIXTIME(' +
              employmentContract.endDate +
              '/1000))'
          )
          .getRawOne();

        console.log('count: ', count);

        if (count > 0) {
          throw new Error('overlapping contract found');
        }
        let obj = new EmploymentContract();
        obj.employee = employee;
        obj.comments = employmentContract.comments;
        obj.payslipEmail = employmentContract.payslipEmail;
        obj.payFrequency = employmentContract.payFrequency;
        obj.startDate = new Date(employmentContract.startDate);
        if (employmentContract.endDate) {
          obj.endDate = new Date(employmentContract.endDate);
        }
        obj.type = employmentContract.type;
        obj.noOfHours = employmentContract.noOfHours;
        obj.noOfDays = employmentContract.noOfDays;
        obj.remunerationAmount = employmentContract.remunerationAmount;
        obj.remunerationAmountPer = employmentContract.remunerationAmountPer;
        obj.leaveRequestPolicyId = employmentContract.leaveRequestPolicyId;
        obj.fileId = employmentContract.fileId;
        await transactionalEntityManager.save(obj);

        let contract = await transactionalEntityManager.findOne(
          EmploymentContract,
          obj.id,
          {
            relations: [
              'leaveRequestPolicy',
              'leaveRequestPolicy.leaveRequestPolicyLeaveRequestTypes',
            ],
          }
        );

        if (!contract) {
          throw new Error('Contract not found');
        }

        if (contract.leaveRequestPolicy) {
          for (let policy of contract.leaveRequestPolicy
            .leaveRequestPolicyLeaveRequestTypes) {
            let _flag_found = 0;
            for (let balance of employee.leaveRequestBalances) {
              if (policy.id == balance.typeId && _flag_found == 0) {
                _flag_found = 1;
              }
            }
            if (_flag_found == 0) {
              let leaveRequestBalanceObj = new LeaveRequestBalance();
              leaveRequestBalanceObj.balanceHours = 0;
              leaveRequestBalanceObj.carryForward = 0;
              leaveRequestBalanceObj.used = 0;
              leaveRequestBalanceObj.typeId = policy.id;
              leaveRequestBalanceObj.employeeId = employee.id;

              await transactionalEntityManager.save(leaveRequestBalanceObj);
            }
          }
        }

        return contract;
      }
    );

    return contract;
  }

  async getAllActive(options?: any): Promise<any[]> {
    let params: any;
    if (options) {
      params = {
        where: {
          employee: {
            id: options.employeeId,
          },
        },
        relations: ['file'],
      };
    }
    return this.find(params);
  }

  async updateAndReturn(
    id: number,
    employmentContract: EmploymentContractDTO
  ): Promise<any | undefined> {
    let contract = await this.manager.transaction(
      async (transactionalEntityManager) => {
        let employmentContractObj = await this.findOne(id);
        if (!employmentContractObj) {
          throw new Error('Contract not found');
        }
        let employee = await this.manager.findOne(
          Employee,
          employmentContractObj?.employeeId,
          { relations: ['leaveRequestBalances'] }
        );
        if (!employee) {
          throw new Error('Employee not found');
        }

        // check any overlapping contract
        let { count } = await this.createQueryBuilder('employmentContract')
          .select('Count(*)', 'count')
          .where('(employee_id = ' + employee.id + ' AND id <> ' + id + ')')
          .andWhere(
            '(end_date is NULL OR FROM_UNIXTIME(' +
              employmentContract.startDate +
              '/1000) <= end_date) AND (' +
              (employmentContract.endDate || 'NULL') +
              ' is NULL OR start_date <= FROM_UNIXTIME(' +
              employmentContract.endDate +
              '/1000))'
          )
          .getRawOne();

        console.log('count: ', count);

        if (count > 0) {
          throw new Error('overlapping contract found');
        }

        employmentContractObj.employeeId = employee.id;
        employmentContractObj.comments = employmentContract.comments;
        employmentContractObj.payslipEmail = employmentContract.payslipEmail;
        employmentContractObj.payFrequency = employmentContract.payFrequency;
        employmentContractObj.startDate = new Date(
          employmentContract.startDate
        );
        if (employmentContract.endDate) {
          employmentContractObj.endDate = new Date(employmentContract.endDate);
        }
        employmentContractObj.type = employmentContract.type;
        employmentContractObj.noOfHours = employmentContract.noOfHours;
        employmentContractObj.noOfDays = employmentContract.noOfDays;
        employmentContractObj.remunerationAmount =
          employmentContract.remunerationAmount;
        employmentContractObj.remunerationAmountPer =
          employmentContract.remunerationAmountPer;
        employmentContractObj.leaveRequestPolicyId =
          employmentContract.leaveRequestPolicyId;

        employmentContractObj.fileId = employmentContract.fileId;
        await transactionalEntityManager.update(
          EmploymentContract,
          id,
          employmentContractObj
        );

        let contract = await transactionalEntityManager.findOne(
          EmploymentContract,
          id,
          {
            relations: [
              'leaveRequestPolicy',
              'leaveRequestPolicy.leaveRequestPolicyLeaveRequestTypes',
            ],
          }
        );

        if (!contract) {
          throw new Error('Contract not found');
        }

        if (contract.leaveRequestPolicy) {
          for (let policy of contract.leaveRequestPolicy
            .leaveRequestPolicyLeaveRequestTypes) {
            let _flag_found = 0;
            for (let balance of employee.leaveRequestBalances) {
              if (policy.id == balance.typeId && _flag_found == 0) {
                _flag_found = 1;
              }
            }
            if (_flag_found == 0) {
              let leaveRequestBalanceObj = new LeaveRequestBalance();
              leaveRequestBalanceObj.balanceHours = 0;
              leaveRequestBalanceObj.carryForward = 0;
              leaveRequestBalanceObj.used = 0;
              leaveRequestBalanceObj.typeId = policy.id;
              leaveRequestBalanceObj.employeeId = employee.id;

              await transactionalEntityManager.save(leaveRequestBalanceObj);
            }
          }
        }

        return contract;
      }
    );

    return contract;
  }

  async findOneCustom(id: number): Promise<any | undefined> {
    return this.findOne(id, { relations: ['file'] });
  }

  async deleteCustom(id: number): Promise<any | undefined> {
    let contract = await this.findOne(id);
    if (!contract) {
      throw new Error('Contract not found');
    }
    return this.softRemove(contract);
  }
}
