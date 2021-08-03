import { ContractDTO } from '../dto';
import { EntityRepository, Repository } from 'typeorm';
import { EmploymentContract } from './../entities/employmentContract';
import { Employee } from './../entities/employee';

@EntityRepository(EmploymentContract)
export class SubContractorContractRepository extends Repository<EmploymentContract> {
  async createAndSave(contract: ContractDTO): Promise<any> {
    let employee = await this.manager.findOne(
      Employee,
      contract.subContractorId
    );
    if (!employee) {
      throw new Error('Employee not found');
    }

    // check any overlapping contract
    let { count } = await this.createQueryBuilder('employmentContract')
      .select('Count(*)', 'count')
      .where('employee_id = ' + contract.subContractorId)
      .andWhere(
        '(end_date is NULL OR FROM_UNIXTIME(' +
          contract.startDate +
          '/1000) <= end_date) AND (' +
          (contract.endDate || 'NULL') +
          ' is NULL OR start_date <= FROM_UNIXTIME(' +
          contract.endDate +
          '/1000))'
      )
      .getRawOne();

    console.log('count: ', count);

    if (count > 0) {
      throw Error('overlapping contract found');
    }
    let obj = new EmploymentContract();
    obj.employee = employee;
    obj.startDate = new Date(contract.startDate);
    if (contract.endDate) {
      obj.endDate = new Date(contract.endDate);
    }
    obj.comments = contract.comments;
    obj.noOfHours = contract.noOfHours;
    obj.noOfHoursPer = contract.noOfHoursPer;
    obj.remunerationAmount = contract.remunerationAmount;
    obj.remunerationAmountPer = contract.remunerationAmountPer;
    return await this.save(obj);
  }

  async getAllActive(options?: any): Promise<any[]> {
    let params: any;
    if (options) {
      params = {
        where: {
          employee: {
            id: options.subContractorId,
          },
        },
      };
    }
    return this.find(params);
  }

  async updateAndReturn(
    id: number,
    contract: ContractDTO
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
          contract.startDate +
          '/1000) <= end_date) AND (' +
          (contract.endDate || 'NULL') +
          ' is NULL OR start_date <= FROM_UNIXTIME(' +
          contract.endDate +
          '/1000))'
      )
      .getRawOne();

    console.log('count: ', count);

    if (count > 0) {
      throw Error('overlapping contract found');
    }

    employmentContractObj.employeeId = employee.id;
    employmentContractObj.startDate = new Date(contract.startDate);
    if (contract.endDate) {
      employmentContractObj.endDate = new Date(contract.endDate);
    }
    employmentContractObj.comments = contract.comments;
    employmentContractObj.noOfHours = contract.noOfHours;
    employmentContractObj.noOfHoursPer = contract.noOfHoursPer;
    employmentContractObj.remunerationAmount = contract.remunerationAmount;
    employmentContractObj.remunerationAmountPer =
      contract.remunerationAmountPer;

    await this.update(id, employmentContractObj);
    return this.findOne(id);
  }

  async findOneCustom(id: number): Promise<any | undefined> {
    return this.findOne(id);
  }

  async deleteCustom(id: number): Promise<any | undefined> {
    return this.softDelete(id);
  }
}
