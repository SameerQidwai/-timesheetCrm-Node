import { ContractDTO } from '../dto';
import { EntityRepository, Repository } from 'typeorm';
import { EmploymentContract } from './../entities/employmentContract';
import { Employee } from './../entities/employee';
import moment from 'moment-timezone';
import { format } from 'path';

@EntityRepository(EmploymentContract)
export class SubContractorContractRepository extends Repository<EmploymentContract> {
  async createAndSave(contractDTO: ContractDTO): Promise<any> {
    let employee = await this.manager.findOne(
      Employee,
      contractDTO.subContractorId
    );
    if (!employee) {
      throw new Error('Employee not found');
    }

    let cSubContractorContractStartDate = moment(contractDTO.startDate);
    let cSubContractorContractEndDate: moment.Moment;
    if (contractDTO.endDate != null) {
      cSubContractorContractEndDate = moment(contractDTO.endDate);
    } else {
      cSubContractorContractEndDate = moment().add(100, 'years');
    }

    // check any overlapping contract
    let contracts = await this.manager.find(EmploymentContract, {
      where: {
        employeeId: employee.id,
      },
    });

    contracts.forEach((contract) => {
      if (
        cSubContractorContractStartDate.isBetween(
          moment(contract.startDate),
          moment(contract.endDate ?? moment().add(100, 'years').toDate()),
          'date',
          '[]'
        ) ||
        moment(contract.startDate).isBetween(
          cSubContractorContractStartDate,
          cSubContractorContractEndDate,
          'date',
          '[]'
        )
      ) {
        throw new Error('Overlapping contract found');
      }
      if (
        cSubContractorContractEndDate.isBetween(
          moment(contract.startDate),
          moment(contract.endDate ?? moment().add(100, 'years').toDate()),
          'date',
          '[]'
        ) ||
        moment(
          contract.endDate ?? moment().add(100, 'years').toDate()
        ).isBetween(
          cSubContractorContractStartDate,
          cSubContractorContractEndDate,
          'date',
          '[]'
        )
      ) {
        throw new Error('Overlapping contract found');
      }
    });

    let obj = new EmploymentContract();
    obj.employee = employee;
    obj.startDate = moment(contractDTO.startDate).toDate();
    if (contractDTO.endDate) {
      obj.endDate = moment(contractDTO.endDate).toDate();
    } else {
      (obj.endDate as any) = null;
    }
    obj.comments = contractDTO.comments;
    obj.noOfHours = contractDTO.noOfHours;
    obj.noOfDays = contractDTO.noOfDays;
    obj.remunerationAmount = contractDTO.remunerationAmount;
    obj.remunerationAmountPer = contractDTO.remunerationAmountPer;
    obj.fileId = contractDTO.fileId;
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
    contractDTO: ContractDTO
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

    let cSubContractorContractStartDate = moment(contractDTO.startDate);
    let cSubContractorContractEndDate: moment.Moment;
    if (contractDTO.endDate != null) {
      cSubContractorContractEndDate = moment(contractDTO.endDate);
    } else {
      cSubContractorContractEndDate = moment().add(100, 'years');
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
          cSubContractorContractStartDate.isBetween(
            moment(contract.startDate),
            moment(contract.endDate ?? moment().add(100, 'years').toDate()),
            'date',
            '[]'
          ) ||
          moment(contract.startDate).isBetween(
            cSubContractorContractStartDate,
            cSubContractorContractEndDate
          )
        ) {
          throw new Error('Overlapping contract found');
        }

        if (
          cSubContractorContractEndDate.isBetween(
            moment(contract.startDate),
            moment(contract.endDate ?? moment().add(100, 'years').toDate()),
            'date',
            '[]'
          ) ||
          moment(
            contract.endDate ?? moment().add(100, 'years').toDate()
          ).isBetween(
            cSubContractorContractStartDate,
            cSubContractorContractEndDate,
            'date',
            '[]'
          )
        ) {
          throw new Error('Overlapping contract found');
        }
      }
    });

    employmentContractObj.employeeId = employee.id;
    employmentContractObj.startDate = moment(contractDTO.startDate).toDate();
    if (contractDTO.endDate) {
      employmentContractObj.endDate = moment(contractDTO.endDate).toDate();
    } else {
      (employmentContractObj.endDate as any) = null;
    }
    employmentContractObj.comments = contractDTO.comments;
    employmentContractObj.noOfHours = contractDTO.noOfHours;
    employmentContractObj.noOfDays = contractDTO.noOfDays;
    employmentContractObj.remunerationAmount = contractDTO.remunerationAmount;
    employmentContractObj.remunerationAmountPer =
      contractDTO.remunerationAmountPer;
    if (employmentContractObj.fileId)
      employmentContractObj.fileId = contractDTO.fileId;

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
