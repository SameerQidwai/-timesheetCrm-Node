import { EntityRepository, Repository } from 'typeorm';
import { LeaveRequestType } from '../entities/leaveRequestType';
import { Employee } from '../entities/employee';
import { Frequency } from '../constants/constants';
import { Calendar } from '../entities/calendar';
import moment from 'moment';

@EntityRepository(LeaveRequestType)
export class LeaveRequestTypeRepository extends Repository<LeaveRequestType> {
  async createAndSave(leaveRequestType: any): Promise<any> {
    let obj = new LeaveRequestType();
    obj.label = leaveRequestType.label;
    return await this.save(obj);
  }

  async getAllActive(): Promise<any[]> {
    return this.find();
  }

  async updateAndReturn(
    id: number,
    leaveRequestType: any
  ): Promise<any | undefined> {
    await this.update(id, leaveRequestType);
    return this.findOne(id);
  }

  async findOneCustom(id: number): Promise<any | undefined> {
    return this.findOne(id);
  }

  async deleteCustom(id: number): Promise<any | undefined> {
    return this.softDelete(id);
  }

  async getActiveByPolicy(authId: number): Promise<any | undefined> {
    let employee = await this.manager.findOne(Employee, authId, {
      relations: [
        'employmentContracts',
        'employmentContracts.leaveRequestPolicy',
        'employmentContracts.leaveRequestPolicy.leaveRequestPolicyLeaveRequestTypes',
        'employmentContracts.leaveRequestPolicy.leaveRequestPolicyLeaveRequestTypes.leaveRequestType',
        'leaveRequestBalances',
        'leaveRequestBalances.type',
      ],
    });

    if (!employee) {
      throw new Error('Something went wrong');
    }

    if (employee.getActiveContract == null) {
      throw new Error('No active contract');
    }

    let calendar = await this.manager.find(Calendar, {
      relations: ['calendarHolidays', 'calendarHolidays.holidayType'],
    });

    let holidays: any = {};

    if (calendar[0]) {
      calendar[0].calendarHolidays.forEach((holiday) => {
        holidays[moment(holiday.date).format('M/D/YYYY').toString()] =
          holiday.holidayType.label;
      });
    }

    let contractDetails = {
      noOfHours: employee.getActiveContract.noOfHours,
      noOfDays: employee.getActiveContract.noOfDays,
      hoursPerDay: (
        employee.getActiveContract.noOfHours /
        employee.getActiveContract.noOfDays
      ).toFixed(2),
    };

    if (employee.getActiveContract.leaveRequestPolicyId == null) {
      return {
        holidays: holidays,
        contractDetails: contractDetails,
        leaveRequestTypes: [],
      };
    }

    let balanceByType: any = {};
    employee.leaveRequestBalances.forEach((balance) => {
      balanceByType[balance.type.leaveRequestTypeId] = balance.balanceHours;
    });

    let leaveRequestTypes =
      employee.getActiveContract.leaveRequestPolicy
        .leaveRequestPolicyLeaveRequestTypes;

    leaveRequestTypes.forEach((type) => {
      (type as any).name = type.leaveRequestType.label;
      (type as any).balance = balanceByType[type.leaveRequestTypeId] ?? 0;

      delete (type as any).leaveRequestType;
    });

    return {
      holidays: holidays,
      contractDetails: contractDetails,
      LeaveRequestTypes: leaveRequestTypes,
    };
  }
}
