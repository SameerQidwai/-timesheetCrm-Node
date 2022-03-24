import { Request, Response, NextFunction } from 'express';
import { Any, getCustomRepository } from 'typeorm';
import { EntityType } from '../constants/constants';
import { secret } from '../utilities/configs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { SuperannuationType } from '../constants/constants';
import { Role } from 'src/entities/role';
import { EmployeeRepository } from './../repositories/employeeRepository';
import { ProjectRepository } from '../repositories/projectRepository';
import { Employee } from '../entities/employee';
import { can } from '../middlewares/can';
import { Action, Resource } from '../constants/authorization';

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

      let token: string;
      if (user) {
        let same = bcrypt.compareSync(password, user.password); // true
        if (!same) {
          return res.status(200).json({
            success: false,
            message: 'Incorrect Password',
          });
        }
        token = jwt.sign({ id: user.id }, secret, {
          expiresIn: '1h', // 24 * 30 hours
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

      let user: any = await repository.findOne({
        where: { id: userId },
        relations: [
          'contactPersonOrganization',
          'contactPersonOrganization.contactPerson',
          'contactPersonOrganization.contactPerson.standardSkillStandardLevels',
          'contactPersonOrganization.organization',
          'bankAccounts',
          'employmentContracts',
        ],
      });
      if (user) {
        user.contactPersonOrganization.organizationId != 1
          ? delete user['employmentContracts']
          : '';
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
      const { user } = res.locals;
      let authId = parseInt(user.id);

      let records = await repository.authGetUserUsers(authId);

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
        message: 'Add Skill',
        data: records,
      });
    } catch (e) {
      next(e);
    }
  }
}
