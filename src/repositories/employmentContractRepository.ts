import { EmploymentContractDTO } from '../dto';
import { EntityRepository, Repository } from 'typeorm';
import { EmploymentContract } from './../entities/employmentContract';
import { Employee } from './../entities/employee';

@EntityRepository(EmploymentContract)
export class EmploymentContractRepository extends Repository<EmploymentContract> {
  async createAndSave(employmentContract: EmploymentContractDTO): Promise<any> {
    let employee = await this.manager.findOne(
      Employee,
      employmentContract.employeeId
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
      throw Error('overlapping contract found');
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
    obj.noOfHoursPer = employmentContract.noOfHoursPer;
    obj.remunerationAmount = employmentContract.remunerationAmount;
    obj.remunerationAmountPer = employmentContract.remunerationAmountPer;
    obj.fileId = employmentContract.fileId;
    return await this.save(obj);
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
    let employmentContractObj = await this.findOne(id);
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
      throw Error('overlapping contract found');
    }

    employmentContractObj.employeeId = employee.id;
    employmentContractObj.comments = employmentContract.comments;
    employmentContractObj.payslipEmail = employmentContract.payslipEmail;
    employmentContractObj.payFrequency = employmentContract.payFrequency;
    employmentContractObj.startDate = new Date(employmentContract.startDate);
    if (employmentContract.endDate) {
      employmentContractObj.endDate = new Date(employmentContract.endDate);
    }
    employmentContractObj.type = employmentContract.type;
    employmentContractObj.noOfHours = employmentContract.noOfHours;
    employmentContractObj.noOfHoursPer = employmentContract.noOfHoursPer;
    employmentContractObj.remunerationAmount =
      employmentContract.remunerationAmount;
    employmentContractObj.remunerationAmountPer =
      employmentContract.remunerationAmountPer;
    if (employmentContract.fileId)
      employmentContractObj.fileId = employmentContract.fileId;
    await this.update(id, employmentContractObj);
    return this.findOne(id);
  }

  async findOneCustom(id: number): Promise<any | undefined> {
    return this.findOne(id, { relations: ['file'] });
  }

  async deleteCustom(id: number): Promise<any | undefined> {
    return this.softDelete(id);
  }
}
