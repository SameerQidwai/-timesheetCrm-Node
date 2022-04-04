import { EmploymentContractDTO } from '../dto';
import { EntityRepository, Repository } from 'typeorm';
import { EmploymentContract } from './../entities/employmentContract';
import { Employee } from './../entities/employee';
import { LeaveRequestBalance } from '../entities/leaveRequestBalance';

@EntityRepository(EmploymentContract)
export class EmploymentContractRepository extends Repository<EmploymentContract> {
  async createAndSave(
    employmentContractDTO: EmploymentContractDTO
  ): Promise<any> {
    let contract = await this.manager.transaction(
      async (transactionalEntityManager) => {
        let employee = await this.manager.findOne(
          Employee,
          employmentContractDTO.employeeId
        );
        if (!employee) {
          throw new Error('Employee not found');
        }

        // check any overlapping contract
        let { count } = await this.createQueryBuilder('employmentContract')
          .select('Count(*)', 'count')
          .where('employee_id = ' + employmentContractDTO.employeeId)
          .andWhere(
            '(end_date is NULL OR FROM_UNIXTIME(' +
              employmentContractDTO.startDate +
              '/1000) <= end_date) AND (' +
              (employmentContractDTO.endDate || 'NULL') +
              ' is NULL OR start_date <= FROM_UNIXTIME(' +
              employmentContractDTO.endDate +
              '/1000))'
          )
          .getRawOne();

        console.log('count: ', count);

        if (count > 0) {
          throw Error('overlapping contract found');
        }
        let obj = new EmploymentContract();
        obj.employee = employee;
        obj.comments = employmentContractDTO.comments;
        obj.payslipEmail = employmentContractDTO.payslipEmail;
        obj.payFrequency = employmentContractDTO.payFrequency;
        obj.startDate = new Date(employmentContractDTO.startDate);
        if (employmentContractDTO.endDate) {
          obj.endDate = new Date(employmentContractDTO.endDate);
        }
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
          throw new Error('Something went wrong');
        }

        if (employmentContractDTO.leaveRequestPolicyId) {
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

        return obj;
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
    await this.manager.transaction(async (transactionalEntityManager) => {
      let employmentContractObj = await this.findOne(id, {
        relations: [
          'leaveRequestPolicy',
          'leaveRequestPolicy.leaveRequestPolicyLeaveRequestTypes',
        ],
      });
      if (!employmentContractObj) {
        throw new Error('Contract not found');
      }
      let employee = await this.manager.findOne(
        Employee,
        employmentContractObj?.employeeId
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
            employmentContractDTO.startDate +
            '/1000) <= end_date) AND (' +
            (employmentContractDTO.endDate || 'NULL') +
            ' is NULL OR start_date <= FROM_UNIXTIME(' +
            employmentContractDTO.endDate +
            '/1000))'
        )
        .getRawOne();

      console.log('count: ', count);

      if (count > 0) {
        throw Error('overlapping contract found');
      }

      employmentContractObj.employeeId = employee.id;
      employmentContractObj.comments = employmentContractDTO.comments;
      employmentContractObj.payslipEmail = employmentContractDTO.payslipEmail;
      employmentContractObj.payFrequency = employmentContractDTO.payFrequency;
      employmentContractObj.startDate = new Date(
        employmentContractDTO.startDate
      );
      if (employmentContractDTO.endDate) {
        employmentContractObj.endDate = new Date(employmentContractDTO.endDate);
      }
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

      if (
        employmentContractDTO.leaveRequestPolicyId &&
        employmentContractDTO.leaveRequestPolicyId !=
          employmentContractObj.leaveRequestPolicyId
      ) {
        for (let policy of employmentContractObj.leaveRequestPolicy
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

      return id;
    });

    return this.findOneCustom(id);
  }

  async findOneCustom(id: number): Promise<any | undefined> {
    return this.findOne(id, { relations: ['file'] });
  }

  async deleteCustom(id: number): Promise<any | undefined> {
    return this.softDelete(id);
  }
}
