import { EmploymentContractDTO } from '../dto';
import {
  Between,
  EntityRepository,
  LessThanOrEqual,
  Repository,
} from 'typeorm';
import { EmploymentContract } from './../entities/employmentContract';
import { Employee } from './../entities/employee';
import { LeaveRequestBalance } from '../entities/leaveRequestBalance';
import moment from 'moment';

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

        let employeeContractStartDate = moment(
          employmentContract.startDate
        ).format('YYYY-MM-DD');
        let employeeContractEndDate: string | null;
        if (employmentContract.endDate != null) {
          employeeContractEndDate = moment(employmentContract.endDate).format(
            'YYYY-MM-DD'
          );
        } else {
          employeeContractEndDate = null;
        }

        // check any overlapping contract
        let contracts = await this.manager.find(EmploymentContract, {
          where: {
            employeeId: employee.id,
          },
        });

        contracts.forEach((contract) => {
          if (
            moment(employeeContractStartDate, 'YYYY-MM-DD').isBetween(
              moment(contract.startDate),
              moment(contract.endDate ?? moment().add(100, 'years').toDate()),
              'date',
              '[]'
            )
          ) {
            throw new Error('Overlapping contract found');
          }
          if (employeeContractEndDate) {
            if (
              moment(employeeContractEndDate, 'YYYY-MM-DD').isBetween(
                moment(contract.startDate),
                moment(contract.endDate ?? moment().add(100, 'years').toDate()),
                'date',
                '[]'
              )
            ) {
              throw new Error('Overlapping contract found');
            }
          } else {
            if (!contract.endDate) {
              throw new Error('Overlapping contract found');
            }
          }
        });

        let obj = new EmploymentContract();
        obj.employee = employee;
        obj.comments = employmentContract.comments;
        obj.payslipEmail = employmentContract.payslipEmail;
        obj.payFrequency = employmentContract.payFrequency;
        obj.startDate = new Date(employeeContractStartDate);
        if (employeeContractEndDate) {
          obj.endDate = new Date(employeeContractEndDate);
        } else {
          (obj.endDate as any) = null;
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

        let employeeContractStartDate = moment(
          employmentContract.startDate
        ).format('YYYY-MM-DD');
        let employeeContractEndDate: string | null;
        if (employmentContract.endDate != null) {
          employeeContractEndDate = moment(employmentContract.endDate).format(
            'YYYY-MM-DD'
          );
        } else {
          employeeContractEndDate = null;
        }

        // check any overlapping contract
        let contracts = await this.manager.find(EmploymentContract, {
          where: {
            employeeId: employee.id,
          },
        });

        contracts.forEach((contract) => {
          if (contract.id != id) {
            console.log({
              currentStart: moment(employeeContractStartDate),
              currentEnd: moment(employeeContractEndDate),
              startDate: moment(contract.startDate),
              endDate: moment(contract.endDate),
            });

            if (
              moment(employeeContractStartDate).isBetween(
                moment(contract.startDate),
                moment(contract.endDate ?? moment().add(100, 'years').toDate()),
                'date',
                '[]'
              )
            ) {
              throw new Error('Overlapping contract found');
            }
            if (employeeContractEndDate) {
              if (
                moment(employeeContractEndDate).isBetween(
                  moment(contract.startDate),
                  moment(
                    contract.endDate ?? moment().add(100, 'years').toDate()
                  ),
                  'date',
                  '[]'
                )
              ) {
                throw new Error('Overlapping contract found');
              }
            } else {
              if (!contract.endDate) {
                throw new Error('Overlapping contract found');
              }
            }
          }
        });

        employmentContractObj.employeeId = employee.id;
        employmentContractObj.comments = employmentContract.comments;
        employmentContractObj.payslipEmail = employmentContract.payslipEmail;
        employmentContractObj.payFrequency = employmentContract.payFrequency;
        employmentContractObj.startDate = moment(
          employeeContractStartDate
        ).toDate();
        if (employeeContractEndDate) {
          employmentContractObj.endDate = moment(
            employeeContractEndDate
          ).toDate();
        } else {
          (employmentContractObj.endDate as any) = null;
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
