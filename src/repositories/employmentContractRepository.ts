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
  async createAndSave(
    employmentContractDTO: EmploymentContractDTO
  ): Promise<any> {
    let contract = await this.manager.transaction(
      async (transactionalEntityManager) => {
        let employee = await this.manager.findOne(
          Employee,
          employmentContractDTO.employeeId,
          { relations: ['leaveRequestBalances'] }
        );
        if (!employee) {
          throw new Error('Employee not found');
        }

        let cEmployeeContractStartDate = moment(
          employmentContractDTO.startDate
        );
        let cEmployeeContractEndDate: moment.Moment;
        if (employmentContractDTO.endDate != null) {
          cEmployeeContractEndDate = moment(employmentContractDTO.endDate);
        } else {
          cEmployeeContractEndDate = moment().add(100, 'years');
        }

        // check any overlapping contract
        let contracts = await this.manager.find(EmploymentContract, {
          where: {
            employeeId: employee.id,
          },
        });

        contracts.forEach((contract) => {
          if (
            cEmployeeContractStartDate.isBetween(
              moment(contract.startDate),
              moment(contract.endDate ?? moment().add(100, 'years').toDate()),
              'date',
              '[]'
            ) ||
            moment(contract.startDate).isBetween(
              cEmployeeContractStartDate,
              cEmployeeContractEndDate,
              'date',
              '[]'
            )
          ) {
            throw new Error('Overlapping contract found');
          }
          if (
            cEmployeeContractEndDate.isBetween(
              moment(contract.startDate),
              moment(contract.endDate ?? moment().add(100, 'years').toDate()),
              'date',
              '[]'
            ) ||
            moment(
              contract.endDate ?? moment().add(100, 'years').toDate()
            ).isBetween(
              cEmployeeContractStartDate,
              cEmployeeContractEndDate,
              'date',
              '[]'
            )
          ) {
            throw new Error('Overlapping contract found');
          }
        });

        let obj = new EmploymentContract();
        obj.employee = employee;
        obj.comments = employmentContractDTO.comments;
        obj.payslipEmail = employmentContractDTO.payslipEmail;
        obj.payFrequency = employmentContractDTO.payFrequency;
        obj.startDate = moment(employmentContractDTO.startDate).toDate();
        if (employmentContractDTO.endDate) {
          obj.endDate = moment(employmentContractDTO.endDate).toDate();
        } else {
          (obj.endDate as any) = null;
        }
        obj.bohPercent = employmentContractDTO.bohPercent;
        obj.type = employmentContractDTO.type;
        obj.noOfHours = employmentContractDTO.noOfHours;
        obj.noOfDays = employmentContractDTO.noOfDays;
        obj.remunerationAmount = employmentContractDTO.remunerationAmount;
        obj.remunerationAmountPer = employmentContractDTO.remunerationAmountPer;
        obj.leaveRequestPolicyId = employmentContractDTO.leaveRequestPolicyId;
        obj.fileId = employmentContractDTO.fileId;
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
              if (
                policy.leaveRequestTypeId == balance.typeId &&
                _flag_found == 0
              ) {
                _flag_found = 1;
              }
            }
            if (_flag_found == 0) {
              let leaveRequestBalanceObj = new LeaveRequestBalance();
              leaveRequestBalanceObj.balanceHours = 0;
              leaveRequestBalanceObj.carryForward = 0;
              leaveRequestBalanceObj.used = 0;
              leaveRequestBalanceObj.typeId = policy.leaveRequestTypeId;
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
    employmentContractDTO: EmploymentContractDTO
  ): Promise<any | undefined> {
    let contract = await this.manager.transaction(
      async (transactionalEntityManager) => {
        let employmentContractObj = await this.findOne(id);
        if (!employmentContractObj) {
          throw new Error('Contract not found');
        }
        let employee = await this.manager.findOne(
          Employee,
          employmentContractObj.employeeId,
          { relations: ['leaveRequestBalances'] }
        );
        if (!employee) {
          throw new Error('Employee not found');
        }

        let cEmployeeContractStartDate = moment(
          employmentContractDTO.startDate
        );
        let cEmployeeContractEndDate: moment.Moment;
        if (employmentContractDTO.endDate != null) {
          cEmployeeContractEndDate = moment(employmentContractDTO.endDate);
        } else {
          cEmployeeContractEndDate = moment().add(100, 'years');
        }

        // check any overlapping contract
        let contracts = await this.manager.find(EmploymentContract, {
          where: {
            employeeId: employee.id,
          },
        });

        contracts.forEach((contract) => {
          if (contract.id != id) {
            if (
              cEmployeeContractStartDate.isBetween(
                moment(contract.startDate),
                moment(contract.endDate ?? moment().add(100, 'years').toDate()),
                'date',
                '[]'
              ) ||
              moment(contract.startDate).isBetween(
                cEmployeeContractStartDate,
                cEmployeeContractEndDate,
                'date',
                '[]'
              )
            ) {
              throw new Error('Overlapping contract found');
            }
            if (
              cEmployeeContractEndDate.isBetween(
                moment(contract.startDate),
                moment(contract.endDate ?? moment().add(100, 'years').toDate()),
                'date',
                '[]'
              ) ||
              moment(
                contract.endDate ?? moment().add(100, 'years').toDate()
              ).isBetween(
                cEmployeeContractStartDate,
                cEmployeeContractEndDate,
                'date',
                '[]'
              )
            ) {
              throw new Error('Overlapping contract found');
            }
          }
        });

        employmentContractObj.employeeId = employee.id;
        employmentContractObj.comments = employmentContractDTO.comments;
        employmentContractObj.payslipEmail = employmentContractDTO.payslipEmail;
        employmentContractObj.payFrequency = employmentContractDTO.payFrequency;
        employmentContractObj.startDate = moment(
          employmentContractDTO.startDate
        ).toDate();
        if (employmentContractDTO.endDate) {
          employmentContractObj.endDate = moment(
            employmentContractDTO.endDate
          ).toDate();
        } else {
          (employmentContractObj.endDate as any) = null;
        }

        employmentContractObj.bohPercent = employmentContractDTO.bohPercent;
        employmentContractObj.type = employmentContractDTO.type;
        employmentContractObj.noOfHours = employmentContractDTO.noOfHours;
        employmentContractObj.noOfDays = employmentContractDTO.noOfDays;
        employmentContractObj.remunerationAmount =
          employmentContractDTO.remunerationAmount;
        employmentContractObj.remunerationAmountPer =
          employmentContractDTO.remunerationAmountPer;
        employmentContractObj.leaveRequestPolicyId =
          employmentContractDTO.leaveRequestPolicyId;

        employmentContractObj.fileId = employmentContractDTO.fileId;
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
              if (
                policy.leaveRequestTypeId == balance.typeId &&
                _flag_found == 0
              ) {
                _flag_found = 1;
              }
            }
            if (_flag_found == 0) {
              let leaveRequestBalanceObj = new LeaveRequestBalance();
              leaveRequestBalanceObj.balanceHours = 0;
              leaveRequestBalanceObj.carryForward = 0;
              leaveRequestBalanceObj.used = 0;
              leaveRequestBalanceObj.typeId = policy.leaveRequestTypeId;
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
