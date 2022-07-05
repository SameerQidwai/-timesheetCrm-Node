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
    let subContractorContractEndDate: string | null;
    if (contract.endDate != null) {
      subContractorContractEndDate = moment(contract.endDate).format(
        'YYYY-MM-DD'
      );
    } else {
      subContractorContractEndDate = null;
    }

    // check any overlapping contract
    let contracts = await this.manager.find(EmploymentContract, {
      where: {
        employeeId: employee.id,
      },
    });

    contracts.forEach((contract) => {
      if (
        moment(subContractorContractStartDate, 'YYYY-MM-DD').isBetween(
          moment(contract.startDate),
          moment(contract.endDate),
          'date',
          '[]'
        )
      ) {
        throw new Error('Overlapping contract found');
      }
      if (subContractorContractEndDate) {
        if (
          moment(subContractorContractEndDate, 'YYYY-MM-DD').isBetween(
            moment(contract.startDate),
            moment(contract.endDate),
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
    let subContractorContractEndDate: string | null;
    if (contract.endDate != null) {
      subContractorContractEndDate = moment(contract.endDate).format(
        'YYYY-MM-DD'
      );
    } else {
      subContractorContractEndDate = null;
    }

    // check any overlapping contract
    let contracts = await this.manager.find(EmploymentContract, {
      where: {
        employeeId: employee.id,
      },
    });

    contracts.forEach((contract) => {
      if (
        moment(subContractorContractStartDate, 'YYYY-MM-DD').isBetween(
          moment(contract.startDate),
          moment(contract.endDate),
          'date',
          '[]'
        )
      ) {
        throw new Error('Overlapping contract found');
      }
      if (subContractorContractEndDate) {
        if (
          moment(subContractorContractEndDate, 'YYYY-MM-DD').isBetween(
            moment(contract.startDate),
            moment(contract.endDate),
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
