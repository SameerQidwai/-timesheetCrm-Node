import { LeaveRequestDTO } from '../dto';
import { EntityRepository, Repository, In } from 'typeorm';
import { LeaveRequest } from '../entities/leaveRequest';
import { LeaveRequestEntry } from '../entities/leaveRequestEntry';
import { TimeOffType } from '../entities/timeOffType';
import { Opportunity } from '../entities/opportunity';
import { Attachment } from '../entities/attachment';
import { LeaveRequestStatus } from '../constants/constants';
import { EntityType } from '../constants/constants';
import moment from 'moment';

@EntityRepository(LeaveRequest)
export class LeaveRequestRepository extends Repository<LeaveRequest> {
  async getOwnLeaveRequests(authId: number): Promise<any | undefined> {
    let leaveRequests = await this.find({
      where: { submittedBy: authId },
      relations: [],
    });

    if (leaveRequests.length < 1) {
      throw new Error('Leave Requests not found');
    }

    //-- START OF MODIFIED RESPSONSE FOR FRONTEND

    leaveRequests.forEach((request) => {
      let requestStatus: LeaveRequestStatus = request.rejectedAt
        ? LeaveRequestStatus.REJECTED
        : request.submittedAt
        ? LeaveRequestStatus.SUBMITTED
        : request.approvedAt
        ? LeaveRequestStatus.APPROVED
        : LeaveRequestStatus.SUBMITTED;

      (request as any).status = requestStatus;
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
        let leaveRequestObj = new LeaveRequest();
        leaveRequestObj.desc = leaveRequestDTO.description;
        let types = await transactionalEntityManager.find(TimeOffType, {
          where: { id: leaveRequestDTO.typeId },
        });

        if (!types[0]) {
          throw new Error('Leave Request Type not found!');
        }
        leaveRequestObj.typeId = leaveRequestDTO.typeId;

        let projects = await transactionalEntityManager.find(Opportunity, {
          where: { id: leaveRequestDTO.workId },
        });

        if (!projects[0]) {
          throw new Error('Project not found!');
        }
        leaveRequestObj.workId = leaveRequestDTO.workId;

        leaveRequestObj.submittedBy = authId;
        leaveRequestObj.submittedAt = moment().toDate();
        leaveRequestObj.entries = [];

        leaveRequestDTO.entries.forEach((leaveRequestEntry) => {
          let leaveRequestEntryObj = new LeaveRequestEntry();
          leaveRequestEntryObj.hours = leaveRequestEntry.hours;
          leaveRequestEntryObj.date = leaveRequestEntry.date;
          leaveRequestEntryObj.leaveRequestId = leaveRequestObj.id;

          leaveRequestObj.entries.push(leaveRequestEntryObj);
        });

        let leaveRequest = await transactionalEntityManager.save(
          leaveRequestObj
        );

        if (leaveRequestDTO.attachments.length > 0) {
          let deleteableAttachments: Attachment[] = [];
          let newAttachments = [...leaveRequestDTO.attachments];
          let oldAttachments = await transactionalEntityManager.find(
            Attachment,
            {
              where: { targetId: leaveRequest.id, targetType: 'PEN' },
            }
          );

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

  async approveAnyLeaveRequest(
    authId: number,
    requestEntries: Array<number>
  ): Promise<any | undefined> {
    let leaveRequests = await this.manager.transaction(
      async (transactionalEntityManager) => {
        let leaveRequests = await transactionalEntityManager.find(
          LeaveRequest,
          {
            where: {
              id: In(requestEntries),
            },
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
    requestEntries: Array<number>
  ): Promise<any | undefined> {
    let leaveRequests = await this.manager.transaction(
      async (transactionalEntityManager) => {
        let leaveRequests = await transactionalEntityManager.find(
          LeaveRequest,
          {
            where: {
              id: In(requestEntries),
            },
            relations: ['entries'],
          }
        );

        if (leaveRequests.length < 1) {
          throw new Error('Leave Requests not found');
        }

        leaveRequests.forEach((leaveRequest) => {
          if (
            leaveRequest.approvedAt != null &&
            leaveRequest.rejectedAt != null
          ) {
            throw new Error('Cannot perform this action');
          }

          leaveRequest.rejectedAt = moment().toDate();
          leaveRequest.rejectedBy = authId;
        });

        leaveRequests = await transactionalEntityManager.save(leaveRequests);

        return leaveRequests;
      }
    );

    return leaveRequests;
    // milestoneEntry.entries.map(entry => entry.submittedAt = )
  }
}
