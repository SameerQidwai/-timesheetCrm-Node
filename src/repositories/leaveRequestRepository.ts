import {
  LeaveRequestApproveRejectDTO,
  LeaveRequestBalanceAccuredDTO,
  LeaveRequestDTO,
} from '../dto';
import {
  EntityRepository,
  Repository,
  In,
  LessThan,
  MoreThan,
  Between,
  Not,
  IsNull,
} from 'typeorm';
import { LeaveRequest } from '../entities/leaveRequest';
import { LeaveRequestEntry } from '../entities/leaveRequestEntry';
import { LeaveRequestType } from '../entities/leaveRequestType';
import { Opportunity } from '../entities/opportunity';
import { Attachment } from '../entities/attachment';
import { LeaveRequestBalance } from '../entities/leaveRequestBalance';
import { Employee } from '../entities/employee';
import { LeaveRequestPolicyLeaveRequestType } from '../entities/leaveRequestPolicyLeaveRequestType';
import { LeaveRequestStatus, OpportunityStatus } from '../constants/constants';
import { EntityType } from '../constants/constants';
import moment from 'moment';
import { Calendar } from '../entities/calendar';
import { OpportunityResourceAllocation } from '../entities/opportunityResourceAllocation';
import { OpportunityResource } from '../entities/opportunityResource';

@EntityRepository(LeaveRequest)
export class LeaveRequestRepository extends Repository<LeaveRequest> {
  async getOwnLeaveRequests(authId: number): Promise<any | undefined> {
    let leaveRequests = await this.find({
      where: { employeeId: authId },
      relations: [
        'entries',
        'employee',
        'employee.contactPersonOrganization',
        'employee.contactPersonOrganization.contactPerson',
        'type',
        'type.leaveRequestType',
        'work',
      ],
    });

    if (leaveRequests.length < 1) {
      throw new Error('Leave Requests not found');
    }

    //-- START OF MODIFIED RESPSONSE FOR FRONTEND

    leaveRequests.forEach((leaveRequest) => {
      (
        leaveRequest as any
      ).employeeName = `${leaveRequest.employee.contactPersonOrganization.contactPerson.firstName} ${leaveRequest.employee.contactPersonOrganization.contactPerson.lastName}`;
      (leaveRequest as any).leaveRequestName =
        leaveRequest.type?.leaveRequestType.label ?? 'Unpaid';
      (leaveRequest as any).status = leaveRequest.getStatus;
      let leavRequestDetails = leaveRequest.getEntriesDetails;
      (leaveRequest as any).startDate = leavRequestDetails.startDate;
      (leaveRequest as any).endDate = leavRequestDetails.endDate;
      (leaveRequest as any).totalHours = leavRequestDetails.totalHours;
      (leaveRequest as any).project = leaveRequest.work?.title ?? null;

      delete (leaveRequest as any).entries;
      delete (leaveRequest as any).employee;
      delete (leaveRequest as any).type;
      delete (leaveRequest as any).work;
    });

    return leaveRequests;

    //-- END OF MODIFIED RESPONSE FOR FRONTEND
  }

  async addLeaveRequest(
    authId: number,
    leaveRequestDTO: LeaveRequestDTO
  ): Promise<any | undefined> {
    let leaveRequest = await this.manager.transaction(
      async (transactionalEntityManager) => {
        if (isNaN(parseInt(leaveRequestDTO.typeId as any))) {
          throw new Error('Undefined Type');
        }

        let leaveRequestObj = new LeaveRequest();

        leaveRequestObj.desc = leaveRequestDTO.description;

        let leaveRequestPolicyType = await transactionalEntityManager.findOne(
          LeaveRequestPolicyLeaveRequestType,
          leaveRequestDTO.typeId
        );

        if (!leaveRequestPolicyType && leaveRequestDTO.typeId != 0) {
          throw new Error('Leave Request Type not found!');
        }

        if (leaveRequestDTO.workId) {
          var project = await transactionalEntityManager.findOne(
            Opportunity,
            leaveRequestDTO.workId
          );

          if (!project) {
            throw new Error('Project not found!');
          }
        }
        leaveRequestObj.workId = leaveRequestDTO.workId;
        leaveRequestObj.typeId =
          leaveRequestDTO.typeId == 0 ? null : leaveRequestDTO.typeId;

        let employee = await transactionalEntityManager.findOne(
          Employee,
          authId,
          {
            relations: [
              'employmentContracts',
              'employmentContracts.leaveRequestPolicy',
              'employmentContracts.leaveRequestPolicy.leaveRequestPolicyLeaveRequestTypes',
              'contactPersonOrganization',
              'contactPersonOrganization.contactPerson',
            ],
          }
        );

        if (!employee) {
          throw new Error('Employee not found!');
        }

        if (employee.getActiveContract == null) {
          throw new Error('No Active Contract of Employee');
        }

        if (!employee.getActiveContract.leaveRequestPolicy) {
          throw new Error('No Active Leave Request of Employee');
        }

        let _firstDate = moment(leaveRequestDTO.entries[0].date).format(
          'YYYY-MM-DD'
        );
        let _lastDate = moment(
          leaveRequestDTO.entries[leaveRequestDTO.entries.length - 1].date
        ).format('YYYY-MM-DD');

        console.log('FIRSTTT DATEEE', _firstDate);
        console.log('LASTTTT DATEEE', _lastDate);

        let _leaveRequestTypeId =
          leaveRequestDTO.typeId == 0 ? null : leaveRequestDTO.typeId;
        let _leaveRequestWorkId =
          leaveRequestDTO.workId == undefined ? null : leaveRequestDTO.workId;

        console.log('TYPE AND WORK', _leaveRequestTypeId, _leaveRequestWorkId);

        let query = transactionalEntityManager
          .createQueryBuilder(LeaveRequestEntry, 'entry')
          .orderBy('entry.id')
          .leftJoinAndSelect(
            'leave_requests',
            'leaveRequest',
            'leaveRequest.id = entry.leave_request_id'
          )
          .where('leaveRequest.employee_id = :authId', { authId });

        if (leaveRequestDTO.workId == undefined) {
          query.andWhere('leaveRequest.work_id is NULL');
        } else {
          query.andWhere('leaveRequest.work_id = :_leaveRequestWorkId', {
            _leaveRequestWorkId,
          });
        }
        if (leaveRequestDTO.typeId == 0) {
          query.andWhere('leaveRequest.type_id is NULL');
        } else {
          query.andWhere('leaveRequest.type_id = :_leaveRequestTypeId', {
            _leaveRequestTypeId,
          });
        }

        let oldEntries = await query
          .andWhere('entry.date BETWEEN :_firstDate AND :_lastDate', {
            _firstDate,
            _lastDate,
          })
          .getRawMany();

        if (oldEntries.length > 0) {
          throw new Error(
            `On Date: ${moment(oldEntries[0].entry_date).format(
              'DD-MM-YYYY'
            )} leave request is already created`
          );
        }

        if (project) {
          let employeeAllocations = await transactionalEntityManager.find(
            OpportunityResourceAllocation,
            {
              where: {
                contactPersonId:
                  employee.contactPersonOrganization.contactPerson.id,
              },
              relations: ['OpportunityResource'],
            }
          );

          for (let allocation of employeeAllocations) {
            if (allocation.opportunityResource.opportunityId == project.id) {
              this._validateRequestDates(
                _firstDate,
                _lastDate,
                allocation.opportunityResource
              );
            }
          }
        }

        let leaveRequestBalance = await transactionalEntityManager.findOne(
          LeaveRequestBalance,
          {
            where: { typeId: leaveRequestDTO.typeId, employeeId: authId },
          }
        );

        leaveRequestObj.employeeId = authId;
        leaveRequestObj.submittedBy = authId;
        leaveRequestObj.submittedAt = moment().toDate();
        leaveRequestObj.entries = [];

        let _totalHours = 0;

        leaveRequestDTO.entries.forEach((leaveRequestEntry) => {
          let parsedDate = moment(leaveRequestEntry.date).isValid();
          if (!parsedDate) {
            throw new Error('Invalid Date');
          }
          let leaveRequestEntryObj = new LeaveRequestEntry();
          leaveRequestEntryObj.hours = leaveRequestEntry.hours;
          leaveRequestEntryObj.date = leaveRequestEntry.date;
          leaveRequestEntryObj.leaveRequestId = leaveRequestObj.id;
          _totalHours += parseFloat(leaveRequestEntry.hours as any);
          leaveRequestObj.entries.push(leaveRequestEntryObj);
        });

        //Checking if current balance has less hours than minimum required

        if (leaveRequestBalance && leaveRequestPolicyType) {
          if (
            leaveRequestBalance.balanceHours <
            leaveRequestPolicyType.minimumBalanceRequired
          ) {
            throw new Error('Balance is less than minimum required!');
          }

          if (
            leaveRequestBalance.balanceHours ==
              leaveRequestPolicyType.minimumBalance ||
            _totalHours >
              leaveRequestBalance.balanceHours +
                Math.abs(leaveRequestPolicyType.minimumBalance)
          ) {
            throw new Error('Balance is less than minimum balance!');
          }

          leaveRequestBalance.balanceHours =
            leaveRequestBalance.balanceHours - _totalHours;
          leaveRequestBalance.used = leaveRequestBalance.used + _totalHours;

          leaveRequestBalance = await transactionalEntityManager.save(
            leaveRequestBalance
          );
        } else if (leaveRequestDTO.typeId == 0) {
        } else {
          throw new Error('Leave Balance not found');
        }

        let leaveRequest = await transactionalEntityManager.save(
          leaveRequestObj
        );

        if (leaveRequestDTO.attachments.length > 0) {
          for (const file of leaveRequestDTO.attachments) {
            let attachmentObj = new Attachment();
            attachmentObj.fileId = file;
            attachmentObj.targetId = leaveRequest.id;
            attachmentObj.targetType = EntityType.LEAVE_REQUEST;
            attachmentObj.userId = authId;
            let attachment = await transactionalEntityManager.save(
              attachmentObj
            );
          }
        }

        return leaveRequest;
      }
    );

    // console.log(timesheetDTO);

    return leaveRequest;
  }

  async getAnyLeaveRequest(requestId: number): Promise<any | undefined> {
    let leaveRequest = await this.findOne(requestId, {
      relations: ['entries', 'employee', 'employee.employmentContracts'],
    });

    if (!leaveRequest) {
      throw new Error('Leave Request not found');
    }
    let leavRequestDetails = leaveRequest.getEntriesDetails;
    (leaveRequest as any).startDate = leavRequestDetails.startDate;
    (leaveRequest as any).endDate = leavRequestDetails.endDate;

    let attachments = await this.manager.find(Attachment, {
      where: { targetType: 'LRE', targetId: leaveRequest.id },
      relations: ['file'],
    });

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

    if (leaveRequest.employee.getActiveContract == null) {
      throw new Error('No active contract');
    }

    let contractDetails = {
      noOfHours: leaveRequest.employee.getActiveContract.noOfHours,
      noOfDays: leaveRequest.employee.getActiveContract.noOfDays,
      hoursPerDay: (
        leaveRequest.employee.getActiveContract.noOfHours /
        leaveRequest.employee.getActiveContract.noOfDays
      ).toFixed(2),
    };

    delete (leaveRequest as any).employee;

    (leaveRequest as any).attachments = attachments;
    (leaveRequest as any).holidays = holidays;
    (leaveRequest as any).contractDetails = contractDetails;

    return leaveRequest;
  }

  async getManageLeaveRequest(
    authId: number,
    requestId: number
  ): Promise<any | undefined> {
    let employeeIds = await this._userManagesEmployeeIds(authId);
    let projectIds = await this._userManagesProjectIds(authId);

    let leaveRequest = await this.findOne(requestId, {
      relations: ['entries', 'employee', 'employee.employmentContracts'],
      where: [{ employeeId: In(employeeIds) }, { workId: In(projectIds) }],
    });

    if (!leaveRequest) {
      throw new Error('Leave Request not found');
    }

    let leavRequestDetails = leaveRequest.getEntriesDetails;
    (leaveRequest as any).startDate = leavRequestDetails.startDate;
    (leaveRequest as any).endDate = leavRequestDetails.endDate;

    let attachments = await this.manager.find(Attachment, {
      where: { targetType: 'LRE', targetId: leaveRequest.id },
      relations: ['file'],
    });

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

    if (leaveRequest.employee.getActiveContract == null) {
      throw new Error('No active contract');
    }

    let contractDetails = {
      noOfHours: leaveRequest.employee.getActiveContract.noOfHours,
      noOfDays: leaveRequest.employee.getActiveContract.noOfDays,
      hoursPerDay: (
        leaveRequest.employee.getActiveContract.noOfHours /
        leaveRequest.employee.getActiveContract.noOfDays
      ).toFixed(2),
    };

    delete (leaveRequest as any).employee;
    (leaveRequest as any).attachments = attachments;
    (leaveRequest as any).holidays = holidays;
    (leaveRequest as any).contractDetails = contractDetails;

    return leaveRequest;
  }

  async getOwnLeaveRequest(
    authId: number,
    requestId: number
  ): Promise<any | undefined> {
    let leaveRequest = await this.findOne(requestId, {
      relations: ['entries'],
      where: { employeeId: authId },
    });

    if (!leaveRequest) {
      throw new Error('Leave Request not found');
    }
    let leavRequestDetails = leaveRequest.getEntriesDetails;
    (leaveRequest as any).startDate = leavRequestDetails.startDate;
    (leaveRequest as any).endDate = leavRequestDetails.endDate;

    let attachments = await this.manager.find(Attachment, {
      where: { targetType: 'LRE', targetId: leaveRequest.id },
      relations: ['file'],
    });

    (leaveRequest as any).attachments = attachments;

    return leaveRequest;
  }

  async getAnyLeaveRequests(
    authId: number,
    startDate: string | null = moment().startOf('year').format('YYYY-MM-DD'),
    endDate: string | null = moment().endOf('year').format('YYYY-MM-DD'),
    userId: number,
    workId: number
  ): Promise<any | undefined> {
    let cStartDate = moment(startDate, 'DD-MM-YYYY');
    let cEndDate = moment(endDate, 'DD-MM-YYYY');

    console.log('STAAART', cStartDate);
    console.log('ENDDDDD', cEndDate);

    let response: LeaveRequest[] = [];
    let leaveRequests = await this.find({
      relations: [
        'entries',
        'employee',
        'employee.contactPersonOrganization',
        'employee.contactPersonOrganization.contactPerson',
        'type',
        'type.leaveRequestType',
        'work',
      ],
    });

    if (leaveRequests.length < 1) {
      throw new Error('Leave Requests not found');
    }

    //-- START OF MODIFIED RESPSONSE FOR FRONTEND

    leaveRequests.forEach((leaveRequest) => {
      let requestStatus: LeaveRequestStatus = leaveRequest.rejectedAt
        ? LeaveRequestStatus.REJECTED
        : leaveRequest.approvedAt
        ? LeaveRequestStatus.APPROVED
        : LeaveRequestStatus.SUBMITTED;

      (
        leaveRequest as any
      ).employeeName = `${leaveRequest.employee.contactPersonOrganization.contactPerson.firstName} ${leaveRequest.employee.contactPersonOrganization.contactPerson.lastName}`;
      (leaveRequest as any).leaveRequestName =
        leaveRequest.type?.leaveRequestType.label ?? 'Unpaid';
      (leaveRequest as any).status = requestStatus;
      let leavRequestDetails = leaveRequest.getEntriesDetails;
      (leaveRequest as any).startDate = leavRequestDetails.startDate;
      (leaveRequest as any).endDate = leavRequestDetails.endDate;
      (leaveRequest as any).totalHours = leavRequestDetails.totalHours;
      (leaveRequest as any).project = leaveRequest.work?.title ?? null;

      delete (leaveRequest as any).employee;
      delete (leaveRequest as any).type;
      delete (leaveRequest as any).work;

      if (
        moment(leaveRequest.submittedAt) >= cStartDate &&
        moment(leaveRequest.submittedAt) <= cEndDate &&
        (userId == leaveRequest.employeeId || isNaN(userId)) &&
        (workId == leaveRequest.workId || isNaN(workId))
      ) {
        delete (leaveRequest as any).entries;
        response.push(leaveRequest);
      }
    });

    return response;

    //-- END OF MODIFIED RESPONSE FOR FRONTEND
  }

  async getManageLeaveRequests(
    authId: number,
    startDate: string = moment().startOf('year').format('DD-MM-YYYY'),
    endDate: string = moment().endOf('year').format('DD-MM-YYYY'),
    userId: number,
    workId: number
  ): Promise<any | undefined> {
    let cStartDate = moment(startDate, 'DD-MM-YYYY');
    let cEndDate = moment(endDate, 'DD-MM-YYYY');

    let employeeIds = await this._userManagesEmployeeIds(authId);
    let projectIds = await this._userManagesProjectIds(authId);

    let response: LeaveRequest[] = [];
    let leaveRequests = await this.find({
      where: [{ employeeId: In(employeeIds) }, { workId: In(projectIds) }],
      relations: [
        'entries',
        'employee',
        'employee.contactPersonOrganization',
        'employee.contactPersonOrganization.contactPerson',
        'type',
        'type.leaveRequestType',
        'work',
      ],
    });

    if (leaveRequests.length < 1) {
      throw new Error('Leave Requests not found');
    }

    //-- START OF MODIFIED RESPSONSE FOR FRONTEND

    leaveRequests.forEach((leaveRequest) => {
      let requestStatus: LeaveRequestStatus = leaveRequest.rejectedAt
        ? LeaveRequestStatus.REJECTED
        : leaveRequest.approvedAt
        ? LeaveRequestStatus.APPROVED
        : LeaveRequestStatus.SUBMITTED;

      (
        leaveRequest as any
      ).employeeName = `${leaveRequest.employee.contactPersonOrganization.contactPerson.firstName} ${leaveRequest.employee.contactPersonOrganization.contactPerson.lastName}`;
      (leaveRequest as any).leaveRequestName =
        leaveRequest.type?.leaveRequestType.label ?? 'Unpaid';
      (leaveRequest as any).status = requestStatus;
      let leavRequestDetails = leaveRequest.getEntriesDetails;
      (leaveRequest as any).startDate = leavRequestDetails.startDate;
      (leaveRequest as any).endDate = leavRequestDetails.endDate;
      (leaveRequest as any).totalHours = leavRequestDetails.totalHours;
      (leaveRequest as any).project = leaveRequest.work?.title ?? null;

      delete (leaveRequest as any).employee;
      delete (leaveRequest as any).type;
      delete (leaveRequest as any).work;

      if (
        moment(leaveRequest.submittedAt) >= cStartDate &&
        moment(leaveRequest.submittedAt) <= cEndDate &&
        (userId == leaveRequest.employeeId || isNaN(userId)) &&
        (workId == leaveRequest.workId || isNaN(workId))
      ) {
        delete (leaveRequest as any).entries;
        response.push(leaveRequest);
      }
    });

    return response;

    //-- END OF MODIFIED RESPONSE FOR FRONTEND
  }

  async approveAnyLeaveRequest(
    authId: number,
    leaveRequestApproveDTO: LeaveRequestApproveRejectDTO
  ): Promise<any | undefined> {
    let leaveRequests = await this.manager.transaction(
      async (transactionalEntityManager) => {
        let leaveRequests = await transactionalEntityManager.find(
          LeaveRequest,
          {
            where: { id: In(leaveRequestApproveDTO.leaveRequests) },
            relations: ['entries'],
          }
        );

        if (leaveRequests.length < 1) {
          throw new Error('Leave Requests not found');
        }

        leaveRequests.forEach((leaveRequest) => {
          if (leaveRequest.approvedAt != null) {
            throw new Error('Cannot perform this action');
          }

          leaveRequest.approvedAt = moment().toDate();
          leaveRequest.approvedBy = authId;
          leaveRequest.note = leaveRequestApproveDTO.note;
        });

        leaveRequests = await transactionalEntityManager.save(leaveRequests);

        return leaveRequests;
      }
    );

    return leaveRequests;
    // milestoneEntry.entries.map(entry => entry.submittedAt = )
  }

  async rejectAnyLeaveRequest(
    authId: number,
    leaveRequestApproveDTO: LeaveRequestApproveRejectDTO
  ): Promise<any | undefined> {
    let leaveRequests = await this.manager.transaction(
      async (transactionalEntityManager) => {
        let leaveRequests = await transactionalEntityManager.find(
          LeaveRequest,
          {
            where: { id: In(leaveRequestApproveDTO.leaveRequests) },
            relations: ['entries'],
          }
        );

        if (leaveRequests.length < 1) {
          throw new Error('Leave Requests not found');
        }

        for (let leaveRequest of leaveRequests) {
          if (
            leaveRequest.approvedAt != null ||
            leaveRequest.rejectedAt != null
          ) {
            throw new Error('Cannot perform this action');
          }
          if (leaveRequest.typeId != null) {
            let _oldHours = 0;
            leaveRequest.entries.forEach((entry) => {
              _oldHours += parseFloat(entry.hours as any);
            });

            let leaveRequestBalance = await transactionalEntityManager.findOne(
              LeaveRequestBalance,
              {
                where: {
                  typeId: leaveRequest.typeId,
                  employeeId: leaveRequest.employeeId,
                },
              }
            );

            if (!leaveRequestBalance) {
              throw new Error('Leave Request Balance not found');
            }
            leaveRequestBalance.balanceHours =
              leaveRequestBalance.balanceHours + _oldHours;
            leaveRequestBalance.used = leaveRequestBalance.used - _oldHours;

            leaveRequestBalance = await transactionalEntityManager.save(
              leaveRequestBalance
            );
          }

          leaveRequest.rejectedAt = moment().toDate();
          leaveRequest.rejectedBy = authId;
          leaveRequest.note = leaveRequestApproveDTO.note;
        }

        leaveRequests = await transactionalEntityManager.save(leaveRequests);

        return leaveRequests;
      }
    );

    return leaveRequests;
    // milestoneEntry.entries.map(entry => entry.submittedAt = )
  }

  async unapproveAnyLeaveRequest(
    authId: number,
    leaveRequestApproveDTO: LeaveRequestApproveRejectDTO
  ): Promise<any | undefined> {
    let leaveRequests = await this.manager.transaction(
      async (transactionalEntityManager) => {
        let leaveRequests = await transactionalEntityManager.find(
          LeaveRequest,
          {
            where: {
              id: In(leaveRequestApproveDTO.leaveRequests),
            },
            relations: ['entries'],
          }
        );

        if (leaveRequests.length < 1) {
          throw new Error('Leave Requests not found');
        }

        for (let leaveRequest of leaveRequests) {
          if (leaveRequest.approvedAt == null) {
            throw new Error('Cannot perform this action');
          }
          if (leaveRequest.typeId != null) {
            let _oldHours = 0;
            leaveRequest.entries.forEach((entry) => {
              _oldHours += parseFloat(entry.hours as any);
            });

            let leaveRequestBalance = await transactionalEntityManager.findOne(
              LeaveRequestBalance,
              {
                where: {
                  typeId: leaveRequest.typeId,
                  employeeId: leaveRequest.employeeId,
                },
              }
            );

            if (!leaveRequestBalance) {
              throw new Error('Leave Request Balance not found');
            }
            leaveRequestBalance.balanceHours =
              leaveRequestBalance.balanceHours + _oldHours;
            leaveRequestBalance.used = leaveRequestBalance.used - _oldHours;

            leaveRequestBalance = await transactionalEntityManager.save(
              leaveRequestBalance
            );
          }

          leaveRequest.approvedAt = null;
          leaveRequest.approvedBy = null;
          leaveRequest.note = leaveRequestApproveDTO.note;
        }

        leaveRequests = await transactionalEntityManager.save(leaveRequests);

        return leaveRequests;
      }
    );

    return leaveRequests;
    // milestoneEntry.entries.map(entry => entry.submittedAt = )
  }

  async approveManageLeaveRequest(
    authId: number,
    leaveRequestApproveDTO: LeaveRequestApproveRejectDTO
  ): Promise<any | undefined> {
    let leaveRequests = await this.manager.transaction(
      async (transactionalEntityManager) => {
        let employeeIds = await this._userManagesEmployeeIds(authId);
        let projectIds = await this._userManagesProjectIds(authId);
        let leaveRequests = await transactionalEntityManager.find(
          LeaveRequest,
          {
            where: [
              {
                id: In(leaveRequestApproveDTO.leaveRequests),
                employeeId: In(employeeIds),
              },
              {
                id: In(leaveRequestApproveDTO.leaveRequests),
                workId: In(projectIds),
              },
            ],
            relations: ['entries'],
          }
        );

        if (leaveRequests.length < 1) {
          throw new Error('Leave Requests not found');
        }

        leaveRequests.forEach((leaveRequest) => {
          if (leaveRequest.approvedAt != null) {
            throw new Error('Cannot perform this action');
          }

          leaveRequest.approvedAt = moment().toDate();
          leaveRequest.approvedBy = authId;
          leaveRequest.note = leaveRequestApproveDTO.note;
        });

        leaveRequests = await transactionalEntityManager.save(leaveRequests);

        return leaveRequests;
      }
    );

    return leaveRequests;
    // milestoneEntry.entries.map(entry => entry.submittedAt = )
  }

  async rejectManageLeaveRequest(
    authId: number,
    leaveRequestApproveDTO: LeaveRequestApproveRejectDTO
  ): Promise<any | undefined> {
    let leaveRequests = await this.manager.transaction(
      async (transactionalEntityManager) => {
        let employeeIds = await this._userManagesEmployeeIds(authId);
        let projectIds = await this._userManagesProjectIds(authId);

        let leaveRequests = await transactionalEntityManager.find(
          LeaveRequest,
          {
            where: [
              {
                id: In(leaveRequestApproveDTO.leaveRequests),
                employeeId: In(employeeIds),
              },
              {
                id: In(leaveRequestApproveDTO.leaveRequests),
                workId: In(projectIds),
              },
            ],
            relations: ['entries'],
          }
        );

        if (leaveRequests.length < 1) {
          throw new Error('Leave Requests not found');
        }

        for (let leaveRequest of leaveRequests) {
          if (
            leaveRequest.approvedAt != null ||
            leaveRequest.rejectedAt != null
          ) {
            throw new Error('Cannot perform this action');
          }

          if (leaveRequest.typeId != null) {
            let _oldHours = 0;
            leaveRequest.entries.forEach((entry) => {
              _oldHours += parseFloat(entry.hours as any);
            });

            let leaveRequestBalance = await transactionalEntityManager.findOne(
              LeaveRequestBalance,
              {
                where: {
                  typeId: leaveRequest.typeId,
                  employeeId: leaveRequest.employeeId,
                },
              }
            );

            if (!leaveRequestBalance) {
              throw new Error('Leave Request Balance not found');
            }
            leaveRequestBalance.balanceHours =
              leaveRequestBalance.balanceHours + _oldHours;
            leaveRequestBalance.used = leaveRequestBalance.used - _oldHours;

            leaveRequestBalance = await transactionalEntityManager.save(
              leaveRequestBalance
            );
          }

          leaveRequest.rejectedAt = moment().toDate();
          leaveRequest.rejectedBy = authId;
          leaveRequest.note = leaveRequestApproveDTO.note;
        }

        leaveRequests = await transactionalEntityManager.save(leaveRequests);

        return leaveRequests;
      }
    );

    return leaveRequests;
    // milestoneEntry.entries.map(entry => entry.submittedAt = )
  }

  async unapproveManageLeaveRequest(
    authId: number,
    leaveRequestApproveDTO: LeaveRequestApproveRejectDTO
  ): Promise<any | undefined> {
    let leaveRequests = await this.manager.transaction(
      async (transactionalEntityManager) => {
        let employeeIds = await this._userManagesEmployeeIds(authId);
        let projectIds = await this._userManagesProjectIds(authId);

        let leaveRequests = await transactionalEntityManager.find(
          LeaveRequest,
          {
            where: [
              {
                id: In(leaveRequestApproveDTO.leaveRequests),
                employeeId: In(employeeIds),
              },
              {
                id: In(leaveRequestApproveDTO.leaveRequests),
                workId: In(projectIds),
              },
            ],
            relations: ['entries'],
          }
        );

        if (leaveRequests.length < 1) {
          throw new Error('Leave Requests not found');
        }

        for (let leaveRequest of leaveRequests) {
          if (leaveRequest.approvedAt != null) {
            throw new Error('Cannot perform this action');
          }

          if (leaveRequest.typeId != null) {
            let _oldHours = 0;
            leaveRequest.entries.forEach((entry) => {
              _oldHours += parseFloat(entry.hours as any);
            });

            let leaveRequestBalance = await transactionalEntityManager.findOne(
              LeaveRequestBalance,
              {
                where: {
                  typeId: leaveRequest.typeId,
                  employeeId: leaveRequest.employeeId,
                },
              }
            );

            if (!leaveRequestBalance) {
              throw new Error('Leave Request Balance not found');
            }
            leaveRequestBalance.balanceHours =
              leaveRequestBalance.balanceHours + _oldHours;
            leaveRequestBalance.used = leaveRequestBalance.used - _oldHours;

            leaveRequestBalance = await transactionalEntityManager.save(
              leaveRequestBalance
            );
          }

          leaveRequest.approvedAt = null;
          leaveRequest.approvedBy = null;
          leaveRequest.note = leaveRequestApproveDTO.note;
        }

        leaveRequests = await transactionalEntityManager.save(leaveRequests);

        return leaveRequests;
      }
    );

    return leaveRequests;
    // milestoneEntry.entries.map(entry => entry.submittedAt = )
  }

  async editLeaveRequest(
    authId: number,
    requestId: number,
    leaveRequestDTO: LeaveRequestDTO
  ): Promise<any | undefined> {
    let leaveRequest = await this.manager.transaction(
      async (transactionalEntityManager) => {
        let leaveRequestObj = await this.findOne(requestId, {
          where: { employeeId: authId },
          relations: ['entries'],
        });

        if (!leaveRequestObj) {
          throw new Error('Leave Request not found!');
        }

        if (
          leaveRequestObj.typeId != leaveRequestDTO.typeId &&
          leaveRequestObj.typeId != null &&
          leaveRequestDTO.typeId != 0
        ) {
          throw new Error('Cannot update Type');
        }

        if (leaveRequestObj.approvedAt) {
          throw new Error('Cannot edit Approved Request!');
        }

        leaveRequestObj.desc = leaveRequestDTO.description;

        let leaveRequestPolicyType = await transactionalEntityManager.findOne(
          LeaveRequestPolicyLeaveRequestType,
          leaveRequestDTO.typeId
        );

        if (!leaveRequestPolicyType && leaveRequestDTO.typeId != 0) {
          throw new Error('Leave Request Type not found!');
        }

        if (leaveRequestDTO.workId) {
          var project = await transactionalEntityManager.findOne(
            Opportunity,
            leaveRequestDTO.workId
          );

          if (!project) {
            throw new Error('Project not found!');
          }

          leaveRequestObj.workId = leaveRequestDTO.workId;
        } else {
          leaveRequestObj.workId = null;
        }

        let employee = await transactionalEntityManager.findOne(
          Employee,
          authId,
          {
            relations: [
              'employmentContracts',
              'employmentContracts.leaveRequestPolicy',
              'employmentContracts.leaveRequestPolicy.leaveRequestPolicyLeaveRequestTypes',
            ],
          }
        );

        if (!employee) {
          throw new Error('Employee not found!');
        }

        if (employee.getActiveContract == null) {
          throw new Error('No Active Contract of Employee');
        }

        if (!employee.getActiveContract.leaveRequestPolicy) {
          throw new Error('No Active Policy of Employee');
        }

        let _firstDate = moment(leaveRequestDTO.entries[0].date).format(
          'YYYY-MM-DD'
        );
        let _lastDate = moment(
          leaveRequestDTO.entries[leaveRequestDTO.entries.length - 1].date
        ).format('YYYY-MM-DD');

        console.log('FIRSTTT DATEEE', _firstDate);
        console.log('LASTTTT DATEEE', _lastDate);
        let _leaveRequestTypeId =
          leaveRequestDTO.typeId == null ? 0 : leaveRequestDTO.typeId;
        let _leaveRequestWorkId =
          leaveRequestDTO.workId == null ? 0 : leaveRequestDTO.workId;
        let query = transactionalEntityManager
          .createQueryBuilder(LeaveRequestEntry, 'entry')
          .orderBy('entry.id')
          .leftJoinAndSelect(
            'leave_requests',
            'leaveRequest',
            'leaveRequest.id = entry.leave_request_id'
          )
          .where('leaveRequest.employee_id = :authId', { authId });

        if (leaveRequestDTO.workId == undefined) {
          query.andWhere('leaveRequest.work_id is NULL');
        } else {
          query.andWhere('leaveRequest.work_id = :_leaveRequestWorkId', {
            _leaveRequestWorkId,
          });
        }
        if (leaveRequestDTO.typeId == 0) {
          query.andWhere('leaveRequest.type_id is NULL');
        } else {
          query.andWhere('leaveRequest.type_id = :_leaveRequestTypeId', {
            _leaveRequestTypeId,
          });
        }

        let oldEntries = await query
          .andWhere('leaveRequest.id != :requestId', { requestId })
          .andWhere('entry.date BETWEEN :_firstDate AND :_lastDate', {
            _firstDate,
            _lastDate,
          })
          .getRawMany();

        if (oldEntries.length > 0) {
          throw new Error(
            `On Date: ${moment(oldEntries[0].entry_date).format(
              'DD-MM-YYYY'
            )} leave request is already created`
          );
        }

        if (project) {
          let employeeAllocations = await transactionalEntityManager.find(
            OpportunityResourceAllocation,
            {
              where: {
                contactPersonId:
                  employee.contactPersonOrganization.contactPerson.id,
              },
              relations: ['OpportunityResource'],
            }
          );

          for (let allocation of employeeAllocations) {
            if (allocation.opportunityResource.opportunityId == project.id) {
              this._validateRequestDates(
                _firstDate,
                _lastDate,
                allocation.opportunityResource
              );
            }
          }
        }

        let leaveRequestBalance: LeaveRequestBalance | undefined;
        if (leaveRequestObj.typeId != null && leaveRequestPolicyType) {
          leaveRequestBalance = await transactionalEntityManager.findOne(
            LeaveRequestBalance,
            {
              where: {
                typeId: leaveRequestPolicyType.id,
                employeeId: authId,
              },
            }
          );
        }

        leaveRequestObj.employeeId = authId;
        leaveRequestObj.submittedBy = authId;
        leaveRequestObj.submittedAt = moment().toDate();
        leaveRequestObj.rejectedAt = null;
        leaveRequestObj.rejectedBy = null;

        let _oldHours = 0;

        leaveRequestObj.entries.forEach((entry) => {
          _oldHours += parseFloat(entry.hours as any);
        });

        if (leaveRequestBalance && leaveRequestPolicyType) {
          //Checking if current balance has less hours than minimum required
          if (
            leaveRequestBalance.balanceHours + _oldHours <
            leaveRequestPolicyType.minimumBalanceRequired
          ) {
            throw new Error('Balance is less than minimum required!');
          }

          await this.manager.delete(LeaveRequestEntry, leaveRequestObj.entries);

          let _totalHours = 0;

          for (let leaveRequestEntry of leaveRequestDTO.entries) {
            let parsedDate = moment(leaveRequestEntry.date).isValid();
            if (!parsedDate) {
              throw new Error('Invalid Date');
            }
            let leaveRequestEntryObj = new LeaveRequestEntry();
            leaveRequestEntryObj.hours = leaveRequestEntry.hours;
            leaveRequestEntryObj.date = leaveRequestEntry.date;
            leaveRequestEntryObj.leaveRequestId = leaveRequestObj.id;
            _totalHours += parseFloat(leaveRequestEntry.hours as any);
            leaveRequestObj.entries.push(leaveRequestEntryObj);
          }

          if (
            leaveRequestBalance.balanceHours + _oldHours ==
              leaveRequestPolicyType.minimumBalance ||
            _totalHours >
              leaveRequestBalance.balanceHours +
                Math.abs(leaveRequestPolicyType.minimumBalance) +
                _oldHours
          ) {
            throw new Error('Balance is less than minimum balance!');
          }

          leaveRequestBalance.balanceHours =
            leaveRequestBalance.balanceHours - _totalHours + _oldHours;
          leaveRequestBalance.used =
            leaveRequestBalance.used + _totalHours - _oldHours;

          leaveRequestBalance = await transactionalEntityManager.save(
            leaveRequestBalance
          );
        } else if (
          leaveRequestDTO.typeId == 0 ||
          isNaN(leaveRequestDTO.typeId)
        ) {
          await this.manager.delete(LeaveRequestEntry, leaveRequestObj.entries);

          let _totalHours = 0;

          for (let leaveRequestEntry of leaveRequestDTO.entries) {
            let parsedDate = moment(leaveRequestEntry.date).isValid();
            if (!parsedDate) {
              throw new Error('Invalid Date');
            }
            let leaveRequestEntryObj = new LeaveRequestEntry();
            leaveRequestEntryObj.hours = leaveRequestEntry.hours;
            leaveRequestEntryObj.date = leaveRequestEntry.date;
            leaveRequestEntryObj.leaveRequestId = leaveRequestObj.id;
            _totalHours += parseFloat(leaveRequestEntry.hours as any);
            leaveRequestObj.entries.push(leaveRequestEntryObj);
          }
        } else {
          throw new Error('Leave Balance not found');
        }

        let leaveRequest = await transactionalEntityManager.save(
          leaveRequestObj
        );

        let deleteableAttachments: Attachment[] = [];
        let newAttachments = [...leaveRequestDTO.attachments];
        let oldAttachments = await transactionalEntityManager.find(Attachment, {
          where: { targetId: leaveRequest.id, targetType: 'LRE' },
        });

        if (oldAttachments.length > 0) {
          oldAttachments.forEach((oldAttachment) => {
            let flag_found = false;

            leaveRequestDTO.attachments.forEach((attachment) => {
              let _indexOf = newAttachments.indexOf(attachment);
              if (oldAttachment.fileId === attachment) {
                flag_found = true;
                if (_indexOf > -1) {
                  newAttachments.splice(_indexOf, 1);
                }
              } else {
                if (_indexOf <= -1) {
                  newAttachments.push(attachment);
                }
              }
            });
            if (!flag_found) {
              deleteableAttachments.push(oldAttachment);
            }
          });
          await transactionalEntityManager.remove(
            Attachment,
            deleteableAttachments
          );
        }

        console.log('NEW', newAttachments);
        console.log('DELETE', deleteableAttachments);

        for (const file of newAttachments) {
          let attachmentObj = new Attachment();
          attachmentObj.fileId = file;
          attachmentObj.targetId = leaveRequest.id;
          attachmentObj.targetType = EntityType.LEAVE_REQUEST;
          attachmentObj.userId = authId;
          let attachment = await transactionalEntityManager.save(attachmentObj);
        }

        return leaveRequest;
      }
    );

    // console.log(timesheetDTO);

    return leaveRequest;
  }

  async deleteLeaveRequest(
    authId: number,
    requestId: number
  ): Promise<any | undefined> {
    let leaveRequest = await this.manager.transaction(
      async (transactionalEntityManager) => {
        let leaveRequest = await this.findOne(requestId, {
          where: { employeeId: authId },
          relations: ['entries'],
        });

        if (!leaveRequest) {
          throw new Error('Leave Request not found!');
        }

        if (leaveRequest.approvedAt) {
          throw new Error('Cannot delete Approved Request!');
        }

        await transactionalEntityManager.softDelete(
          LeaveRequestEntry,
          leaveRequest.entries
        );
        return await transactionalEntityManager.softDelete(
          LeaveRequest,
          leaveRequest.id
        );
      }
    );

    return leaveRequest;
  }

  async getAnyLeaveRequestBalances(
    authId: number,
    employeeId: number
  ): Promise<any | undefined> {
    let auth = await this.manager.findOne(Employee, authId, {});

    if (!auth) {
      throw new Error('Employee not found');
    }

    let employee = await this.manager.findOne(Employee, employeeId, {
      relations: [
        'leaveRequestBalances',
        'leaveRequestBalances.type',
        'leaveRequestBalances.type.leaveRequestType',
      ],
    });

    if (!employee) {
      throw new Error('Employee not found');
    }

    let leaveRequestBalances = employee.leaveRequestBalances;
    leaveRequestBalances.forEach((balance) => {
      (balance as any).name = balance.type.leaveRequestType.label;
    });

    return leaveRequestBalances;
  }

  async getLeaveRequestBalances(authId: number): Promise<any | undefined> {
    let employee = await this.manager.findOne(Employee, authId, {
      relations: [
        'leaveRequestBalances',
        'leaveRequestBalances.type',
        'leaveRequestBalances.type.leaveRequestType',
      ],
    });

    if (!employee) {
      throw new Error('Employee not found');
    }

    let leaveRequestBalances = employee.leaveRequestBalances;
    leaveRequestBalances.forEach((balance) => {
      (balance as any).name = balance.type.leaveRequestType.label;
    });

    return leaveRequestBalances;
  }

  async updateLeaveRequestBalancedAccured(
    id: number,
    accuredDTO: LeaveRequestBalanceAccuredDTO
  ): Promise<any | undefined> {
    let leaveRequestBalance = await this.manager.findOne(
      LeaveRequestBalance,
      id
    );

    if (!leaveRequestBalance) {
      throw new Error('Leave Request Balance Entry not found');
    }

    let difference = leaveRequestBalance.carryForward - accuredDTO.carryForward;
    leaveRequestBalance.carryForward = accuredDTO.carryForward;
    leaveRequestBalance.balanceHours -= difference;

    return this.manager.save(leaveRequestBalance);
  }

  async _userManagesEmployeeIds(
    authId: number
  ): Promise<Array<number> | Array<null>> {
    let employeeIds: Array<number> = [];

    let employees = await this.manager.find(Employee);
    employees.forEach((employee) => {
      if (employee.lineManagerId == authId) {
        employeeIds.push(employee.id);
      }
    });

    return employeeIds;
  }

  async _userManagesProjectIds(
    authId: number
  ): Promise<Array<number> | Array<null>> {
    let projectIds: Array<number> = [];

    let projects = await this.manager.find(Opportunity, {
      where: { status: OpportunityStatus.WON },
    });
    projects.forEach((project) => {
      if (project.projectManagerId == authId) {
        projectIds.push(project.id);
      }
    });

    return projectIds;
  }

  //!--------------------------- HELPER FUNCTIONS ----------------------------//

  _validateRequestDates(
    starDate: Date | string,
    endDate: Date | string,
    opportunity: OpportunityResource
  ) {
    if (opportunity.startDate) {
      if (moment(starDate).isBefore(moment(opportunity.startDate), 'date')) {
        throw new Error(
          'Leave Request Date cannot be Before Project Start Date'
        );
      }
      if (moment(endDate).isBefore(moment(opportunity.startDate), 'date')) {
        throw new Error(
          'Milestone Start Date cannot be Before Project Start Date'
        );
      }
    }
    if (opportunity.endDate) {
      if (moment(starDate).isAfter(moment(opportunity.endDate), 'date')) {
        throw new Error('Leave Request Date cannot be After Project End Date');
      }
      if (moment(endDate).isAfter(moment(opportunity.endDate), 'date')) {
        throw new Error(
          'Milestone Start Date cannot be After Project End Date'
        );
      }
    }
  }
}
