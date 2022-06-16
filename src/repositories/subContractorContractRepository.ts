import { ContractDTO } from '../dto';
import { EntityRepository, Repository } from 'typeorm';
import { EmploymentContract } from './../entities/employmentContract';
import { Employee } from './../entities/employee';
import moment from 'moment';

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

    let subContractorContractStartDate = moment(contract.startDate).format(
      'YYYY-MM-DD'
    );
    let subContractorContractEndDate;
    if (contract.endDate != null) {
      subContractorContractEndDate = moment(contract.endDate).format(
        'YYYY-MM-DD'
      );
    } else {
      subContractorContractEndDate = null;
    }

    // check any overlapping contract
    let { count } = await this.createQueryBuilder('employmentContract')
      .select('Count(*)', 'count')
      .where('employee_id = ' + contract.subContractorId)
      .andWhere(
        '(end_date is NULL OR FROM_UNIXTIME(' +
          subContractorContractStartDate +
          '/1000) <= end_date) AND (' +
          (subContractorContractEndDate || 'NULL') +
          ' is NULL OR start_date <= FROM_UNIXTIME(' +
          subContractorContractEndDate +
          '/1000))'
      )
      .getRawOne();

    console.log('count: ', count);

    if (count > 0) {
      throw new Error('overlapping contract found');
    }
    let obj = new EmploymentContract();
    obj.employee = employee;
    obj.startDate = new Date(subContractorContractStartDate);
    if (subContractorContractEndDate) {
      obj.endDate = new Date(subContractorContractEndDate);
    } else {
      (obj.endDate as any) = null;
    }
    obj.comments = contract.comments;
    obj.noOfHours = contract.noOfHours;
    obj.noOfDays = contract.noOfDays;
    obj.remunerationAmount = contract.remunerationAmount;
    obj.remunerationAmountPer = contract.remunerationAmountPer;
    obj.fileId = contract.fileId;
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

    let subContractorContractStartDate = moment(contract.startDate).format(
      'YYYY-MM-DD'
    );
    let subContractorContractEndDate;
    if (contract.endDate != null) {
      subContractorContractEndDate = moment(contract.endDate).format(
        'YYYY-MM-DD'
      );
    } else {
      subContractorContractEndDate = null;
    }

    console.log(subContractorContractStartDate, subContractorContractEndDate);
    // check any overlapping contract
    let { count } = await this.createQueryBuilder('employmentContract')
      .select('Count(*)', 'count')
      .where('(employee_id = ' + employee.id + ' AND id <> ' + id + ')')
      .andWhere(
        '(end_date is NULL OR FROM_UNIXTIME(' +
          subContractorContractStartDate +
          '/1000) <= end_date) AND (' +
          (subContractorContractEndDate || 'NULL') +
          ' is NULL OR start_date <= FROM_UNIXTIME(' +
          subContractorContractEndDate +
          '/1000))'
      )
      .getRawOne();

    console.log('count: ', count);

    if (count > 0) {
      throw new Error('overlapping contract found');
    }

    employmentContractObj.employeeId = employee.id;
    employmentContractObj.startDate = new Date(subContractorContractStartDate);
    if (subContractorContractEndDate) {
      employmentContractObj.endDate = new Date(subContractorContractEndDate);
    } else {
      (employmentContractObj.endDate as any) = null;
    }
    employmentContractObj.comments = contract.comments;
    employmentContractObj.noOfHours = contract.noOfHours;
    employmentContractObj.noOfDays = contract.noOfDays;
    employmentContractObj.remunerationAmount = contract.remunerationAmount;
    employmentContractObj.remunerationAmountPer =
      contract.remunerationAmountPer;
    if (employmentContractObj.fileId)
      employmentContractObj.fileId = contract.fileId;

    await this.update(id, employmentContractObj);
    return this.findOneCustom(id);
  }

  async findOneCustom(id: number): Promise<any | undefined> {
    return this.findOne(id, { relations: ['file'] });
  }

  async deleteCustom(id: number): Promise<any | undefined> {
    return this.softDelete(id);
  }
}
