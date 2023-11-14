import { Request, Response, NextFunction, urlencoded } from 'express';
import {
  Any,
  In,
  getCustomRepository,
  getManager,
  MoreThanOrEqual,
} from 'typeorm';
import { secret } from '../utilities/configs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import moment from 'moment-timezone';
import { EmployeeRepository } from './../repositories/employeeRepository';
import { ProjectRepository } from '../repositories/projectRepository';
import { EmploymentContract } from '../entities/employmentContract';
import { dispatchMail } from '../utilities/mailer';
import { Employee } from '../entities/employee';
import { PasswordReset } from '../entities/passwordReset';
import { ResetPasswordMail } from '../mails/resetPasswordMail';
import { Notification } from '../entities/notification';

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(EmployeeRepository);

      let email: string = req.body.email;
      let password: string = req.body.password;
      let user = await repository.findOne({
        where: { username: email },
        relations: ['contactPersonOrganization', 'role', 'role.permissions'],
      });

      let expiry = '1h';

      if (
        req.get('User-Agent')?.includes('okhttp') ||
        req.get('User-Agent')?.includes('Darwin')
      )
        expiry = '30d';

      let token: string;
      if (user && user.active) {
        let same = bcrypt.compareSync(password, user.password); // true
        if (!same) {
          return res.status(200).json({
            success: false,
            message: 'Incorrect Password',
          });
        }
        token = jwt.sign({ id: user.id }, secret, {
          expiresIn: expiry,
        });
        let role = {
          roleId: user.role.id,
          role: user.role.label,
          type:
            user.contactPersonOrganization.organizationId === 1
              ? 'Employee'
              : 'Sub Contractor',
          permissions: user.role.permissions.map((x) => {
            const { resource, action, grant } = x;
            return {
              resource,
              action,
              grant,
            };
          }),
        };
        return res.status(200).json({
          success: true,
          // message: `Win Opportunity ${req.params.id}`,
          message: 'Logged in',
          data: {
            id: user.id,
            email: user.username,
            accessToken: `Bearer ${token}`,
            role: role,
          },
        });
      } else {
        return res.status(200).json({
          success: false,
          message: 'User Not Found',
        });
      }
    } catch (e) {
      next(e);
    }
  }

  async updatePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(EmployeeRepository);

      //Get userId from JWT
      const userId = res.locals.jwtPayload.id;
      const { oldPassword, newPassword } = req.body;

      if (!(oldPassword && newPassword)) {
        throw new Error('Old Password and New Password both are required!');
      }

      let user = await repository.findOne({
        where: { id: userId },
        select: ['id', 'username', 'password'],
      });

      if (!user) {
        throw new Error('User not found!');
      } else {
        // check if old password is valid
        let isValidPassword = bcrypt.compareSync(oldPassword, user.password);

        if (!isValidPassword) {
          throw new Error('Invalid Old Password');
        }

        await repository.update(userId, {
          password: bcrypt.hashSync(newPassword, bcrypt.genSaltSync(8)),
        });
      }

      res.status(200).json({
        success: true,
        message: 'Password Updated Successfully',
        data: null,
      });
    } catch (e) {
      next(e);
    }
  }

  async getSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(EmployeeRepository);

      //Get userId from JWT
      const userId = res.locals.jwtPayload.id;

      let user = await repository.findOne({
        where: { id: userId },
        relations: [
          'contactPersonOrganization',
          'contactPersonOrganization.contactPerson',
          'contactPersonOrganization.contactPerson.standardSkillStandardLevels',
          'contactPersonOrganization.organization',
          'bankAccounts',
          'bankAccounts.file',
          'employmentContracts',
          'employmentContracts.file',
          'superannuationFile',
          'tfnFile',
        ],
      });

      if (!user) {
        throw new Error('User not found');
      }

      let pastContracts: EmploymentContract[] = [];
      let currentContract: EmploymentContract[] = [];
      let futureContracts: EmploymentContract[] = [];
      if (user.contactPersonOrganization.organizationId != 1) {
        delete (user as any).employmentContracts;
      } else {
        // for (let contract of user.employmentContracts) {
        //   if (
        //     moment().isAfter(moment(contract.startDate), 'date') &&
        //     moment().isAfter(moment(contract.endDate), 'date')
        //   ) {
        //     pastContracts.push(contract);
        //   } else if (
        //     moment().isBetween(
        //       moment(contract.startDate),
        //       moment(contract.endDate),
        //       'date'
        //     )
        //   ) {
        //     currentContract.push(contract);
        //   } else if (
        //     moment().isBefore(moment(contract.startDate), 'date') &&
        //     moment().isBefore(moment(contract.endDate), 'date')
        //   ) {
        //     futureContracts.push(contract);
        //   }
        // }
        // if (currentContract.length) {
        //   user.employmentContracts = [currentContract[0]];
        // } else if (futureContracts.length) {
        //   user.employmentContracts = [
        //     futureContracts[futureContracts.length - 1],
        //   ];
        // } else if (pastContracts.length) {
        //   user.employmentContracts = [pastContracts[pastContracts.length - 1]];
        // }
      }

      res.status(200).json({
        success: true,
        message: 'User Setting Received Successfully',
        data: user,
      });
    } catch (e) {
      next(e);
    }
  }

  async updateSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(EmployeeRepository);
      const userId = res.locals.jwtPayload.id;

      let updatedEmployee = await repository.authUpdateSettings(
        userId,
        req.body
      );

      // let updatedEmployee = await repository.update(userId, {
      //   nextOfKinName: req.body.nextOfKinName,
      //   nextOfKinPhoneNumber: req.body.nextOfKinPhoneNumber,
      //   nextOfKinEmail: req.body.nextOfKinEmail,
      //   nextOfKinRelation: req.body.nextOfKinRelation,
      //   tfn: req.body.tfn,
      //   taxFreeThreshold: req.body.taxFreeThreshold ?? false,
      //   helpHECS: req.body.helpHECS ?? false,
      //   superannuationName: req.body.superannuationName,
      //   superannuationType:
      //     req.body.superannuationType == 'P'
      //       ? SuperannuationType.PUBLIC
      //       : SuperannuationType.SMSF,
      //   superannuationBankName: req.body.superannuationBankName,
      //   superannuationBankAccountOrMembershipNumber:
      //     req.body.superannuationBankAccountOrMembershipNumber,
      //   superannuationAbnOrUsi: req.body.superannuationAbnOrUsi,
      //   superannuationBankBsb: req.body.superannuationBankBsb,
      //   superannuationAddress: req.body.superannuationAddress,
      //   training: req.body.training,
      // });

      res.status(200).json({
        success: true,
        message: 'Settings Updated Successfully',
        data: updatedEmployee,
      });
    } catch (e) {
      next(e);
    }
  }

  async getTraining(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(EmployeeRepository);

      //Get userId from JWT
      const userId = res.locals.jwtPayload.id;

      let user = await repository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('Employee not found');
      }

      res.status(200).json({
        success: true,
        message: 'Training Received Successfully',
        data: user.training,
      });
    } catch (e) {
      next(e);
    }
  }

  async updateTraining(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(EmployeeRepository);
      const userId = res.locals.jwtPayload.id;

      let updatedEmployee = await repository.authUpdateTraining(
        userId,
        req.body
      );

      // let updatedEmployee = await repository.update(userId, {
      //   nextOfKinName: req.body.nextOfKinName,
      //   nextOfKinPhoneNumber: req.body.nextOfKinPhoneNumber,
      //   nextOfKinEmail: req.body.nextOfKinEmail,
      //   nextOfKinRelation: req.body.nextOfKinRelation,
      //   tfn: req.body.tfn,
      //   taxFreeThreshold: req.body.taxFreeThreshold ?? false,
      //   helpHECS: req.body.helpHECS ?? false,
      //   superannuationName: req.body.superannuationName,
      //   superannuationType:
      //     req.body.superannuationType == 'P'
      //       ? SuperannuationType.PUBLIC
      //       : SuperannuationType.SMSF,
      //   superannuationBankName: req.body.superannuationBankName,
      //   superannuationBankAccountOrMembershipNumber:
      //     req.body.superannuationBankAccountOrMembershipNumber,
      //   superannuationAbnOrUsi: req.body.superannuationAbnOrUsi,
      //   superannuationBankBsb: req.body.superannuationBankBsb,
      //   superannuationAddress: req.body.superannuationAddress,
      //   training: req.body.training,
      // });

      res.status(200).json({
        success: true,
        message: 'Training Updated Successfully',
        data: updatedEmployee,
      });
    } catch (e) {
      next(e);
    }
  }

  async updateAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(EmployeeRepository);
      const userId = res.locals.jwtPayload.id;

      let updatedEmployee = await repository.authUpdateAddress(
        userId,
        req.body
      );

      // let updatedEmployee = await repository.update(userId, {
      //   nextOfKinName: req.body.nextOfKinName,
      //   nextOfKinPhoneNumber: req.body.nextOfKinPhoneNumber,
      //   nextOfKinEmail: req.body.nextOfKinEmail,
      //   nextOfKinRelation: req.body.nextOfKinRelation,
      //   tfn: req.body.tfn,
      //   taxFreeThreshold: req.body.taxFreeThreshold ?? false,
      //   helpHECS: req.body.helpHECS ?? false,
      //   superannuationName: req.body.superannuationName,
      //   superannuationType:
      //     req.body.superannuationType == 'P'
      //       ? SuperannuationType.PUBLIC
      //       : SuperannuationType.SMSF,
      //   superannuationBankName: req.body.superannuationBankName,
      //   superannuationBankAccountOrMembershipNumber:
      //     req.body.superannuationBankAccountOrMembershipNumber,
      //   superannuationAbnOrUsi: req.body.superannuationAbnOrUsi,
      //   superannuationBankBsb: req.body.superannuationBankBsb,
      //   superannuationAddress: req.body.superannuationAddress,
      //   training: req.body.training,
      // });

      res.status(200).json({
        success: true,
        message: 'Address Updated Successfully',
        data: updatedEmployee,
      });
    } catch (e) {
      next(e);
    }
  }

  async getUserUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(EmployeeRepository);
      let records: any = [];
      const { user } = res.locals;
      const { grantLevel } = res.locals;

      let authId = parseInt(user.id);

      if (grantLevel.includes('ANY')) {
        records = await repository.authGetUserAnyUsers();
      } else if (grantLevel.includes('MANAGE')) {
        records = await repository.authGetUserManageUsers(authId);
      }

      res.status(200).json({
        success: true,
        message: 'User Users',
        data: records,
      });
    } catch (e) {
      next(e);
    }
  }

  async getUserProjects(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(ProjectRepository);
      const { user } = res.locals;
      const { grantLevel } = res.locals;

      let authId = parseInt(user.id);

      let records: any = [];

      if (grantLevel.includes('ANY')) {
        records = await repository.authAnyGetUserProjects();
      } else if (grantLevel.includes('MANAGE')) {
        records = await repository.authManageGetUserProjects(authId);
      } else if (grantLevel.includes('OWN')) {
        records = await repository.authOwnGetUserProjects(authId);
      }

      res.status(200).json({
        success: true,
        message: 'User Projects',
        data: records,
      });
    } catch (e) {
      next(e);
    }
  }

  async addSkill(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(EmployeeRepository);
      const { user } = res.locals;
      let authId = parseInt(user.id);

      let records = await repository.authAddSkill(authId, req.body);

      res.status(200).json({
        success: true,
        message: 'Skills Added Successfully',
        data: records,
      });
    } catch (e) {
      next(e);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const manager = getManager();

      const { email } = req.body;

      let user = await manager.findOne(Employee, {
        relations: [
          'contactPersonOrganization',
          'contactPersonOrganization.contactPerson',
        ],
        where: { username: email },
      });

      if (!user) {
        return res.status(200).json({
          success: true,
          message: 'Password Reset Email Sent',
          data: null,
        });
      }

      if (!user.active) {
        return res.status(200).json({
          success: true,
          message: 'Password Reset Email Sent',
          data: null,
        });
      }

      let link = new PasswordReset();
      link.email = user.username;
      link.token = crypto.randomBytes(32).toString('hex');
      await manager.save(link);

      let userMailData = {
        username: user.getFullName,
        email: user.username,
      };

      dispatchMail(
        new ResetPasswordMail(userMailData.username, link.token),
        userMailData
      );

      return res.status(200).json({
        success: true,
        message: 'Password Reset Email Sent',
        data: null,
      });
    } catch (e) {
      next(e);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const manager = getManager();
      const { token } = req.params;
      const { password } = req.body;

      if (!token) {
        throw new Error('Invalid Link');
      }

      // manager.transaction(async (transactionalEntityManager) => {
      let link = await manager.findOne(PasswordReset, {
        where: {
          token: token,
          used: 0,
        },
      });

      if (!link) {
        throw new Error('Invalid Link');
      }

      if (moment.utc(link.createdAt).add(1, 'day').isBefore(moment().utc())) {
        throw new Error('Link Expired');
      }

      let user = await manager.findOne(Employee, {
        where: {
          username: link.email,
        },
      });

      if (!user) {
        throw new Error('Invalid Token');
      }

      user.password = bcrypt.hashSync(password, bcrypt.genSaltSync(8));

      link.used = true;

      await manager.save(user);
      await manager.save(link);

      // });
      return res.status(200).json({
        success: true,
        message: 'Password Updated Successfully',
        data: null,
      });
    } catch (e) {
      next(e);
    }
  }

  async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      let _flagUnread = parseInt(req.query.unread?.toString() ?? '');
      let limit = parseInt(req.query.limit?.toString() ?? '');
      let page = parseInt(req.query.page?.toString() ?? '');
      limit = isNaN(limit) ? 5 : limit;
      page = isNaN(page) ? 1 : page;

      const manager = getManager();

      const currentUserId = res.locals.jwtPayload.id;

      if (!currentUserId) {
        throw new Error('Unauthorized');
      }

      const currentUser = await manager.findOne(Employee, {
        id: currentUserId,
      });

      if (!currentUser) {
        throw new Error('Unauthorized');
      }

      let unreadCondition = {};
      if (_flagUnread) {
        unreadCondition = {
          readAt: null,
        };
      }

      let [records, count] = await manager.findAndCount(Notification, {
        skip: limit * (page - 1),
        take: limit,
        order: { id: 'DESC' },
        where: { notifiableId: currentUser.id, ...unreadCondition },
      });

      const lastPage = Math.ceil(count / limit);

      // });
      return res.status(200).json({
        success: true,
        message: '',
        data: {
          records: records,
          meta: {
            itemCount:
              count > limit
                ? lastPage == page
                  ? count % limit
                  : limit
                : count,
            totalItems: count,
            itemsPerPage: limit,
            totalPages: lastPage,
            currentPage: page,
          },
        },
      });
    } catch (e) {
      next(e);
    }
  }

  async getUnclearedNotifications(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const manager = getManager();

      const currentUserId = res.locals.jwtPayload.id;

      if (!currentUserId) {
        throw new Error('Unauthorized');
      }

      const currentUser = await manager.findOne(Employee, {
        id: currentUserId,
      });

      if (!currentUser) {
        throw new Error('Unauthorized');
      }

      const notifications = await manager.find(Notification, {
        where: {
          generatedAt: MoreThanOrEqual(
            currentUser.notificationsClearedAt ?? '2000-01-01'
          ),
          notifiableId: currentUser.id,
        },
      });

      return res
        .status(200)
        .json({ success: true, message: '', data: notifications });
    } catch (e) {
      next(e);
    }
  }

  async markNotificationsAsRead(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const manager = getManager();

      const currentUserId = res.locals.jwtPayload.id;

      if (!currentUserId) {
        throw new Error('Unauthorized');
      }

      const currentUser = await manager.findOne(Employee, {
        id: currentUserId,
      });

      if (!currentUser) {
        throw new Error('Unauthorized');
      }

      let ids = [];

      if (req.query.notificationIds)
        for (let item of (req.query.notificationIds as string).split(',')) {
          if (isNaN(parseInt(item))) continue;

          ids.push(parseInt(item));
        }

      ids.push(req.body.notificationIds);

      let notifications = await manager.find(Notification, {
        where: { id: In(ids), notifiableId: currentUser.id },
      });

      for (let notification of notifications) {
        notification.readAt = moment().toDate();
      }

      await manager.save(notifications);

      // });
      return res.status(200).json({
        success: true,
        message: 'Notifications marked as read',
        data: notifications,
      });
    } catch (e) {
      next(e);
    }
  }

  async markNotificationsAsUnRead(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const manager = getManager();

      const currentUserId = res.locals.jwtPayload.id;

      if (!currentUserId) {
        throw new Error('Unauthorized');
      }

      const currentUser = await manager.findOne(Employee, {
        id: currentUserId,
      });

      if (!currentUser) {
        throw new Error('Unauthorized');
      }

      let ids = [];

      if (req.query.notificationIds)
        for (let item of (req.query.notificationIds as string).split(',')) {
          if (isNaN(parseInt(item))) continue;

          ids.push(parseInt(item));
        }

      ids.push(req.body.notificationIds);

      let notifications = await manager.find(Notification, {
        where: { id: In(ids), notifiableId: currentUser.id },
      });

      for (let notification of notifications) {
        (notification.readAt as any) = null;
      }

      await manager.save(notifications);

      // });
      return res.status(200).json({
        success: true,
        message: 'Notifications marked as unread',
        data: notifications,
      });
    } catch (e) {
      next(e);
    }
  }

  async clearRecentNotifications(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const manager = getManager();

      const userId = res.locals.jwtPayload.id;

      let user = await manager.findOne(Employee, {
        where: { id: userId },
      });

      if (!user) {
        throw new Error('User not found!');
      }

      user.notificationsClearedAt = moment().toDate();

      await manager.save(user);

      // });
      return res.status(200).json({
        success: true,
        message: 'Notifications cleared',
        data: null,
      });
    } catch (e) {
      next(e);
    }
  }
}
