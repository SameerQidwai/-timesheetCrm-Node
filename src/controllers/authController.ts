import { Request, Response } from 'express';
import { EmployeeRepository } from './../repositories/employeeRepository';
import { getCustomRepository } from 'typeorm';
import { EntityType } from '../constants/constants';
import { secret } from '../utilities/configs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { SuperannuationType } from '../constants/constants';

export class AuthController {
  async login(req: Request, res: Response) {
    const repository = getCustomRepository(EmployeeRepository);

    let email: string = req.body.email;
    let password: string = req.body.password;
    let user = await repository.findOne({
      where: { username: email },
    });

    let token: string;
    if (user) {
      console.log('123123', user.password);
      let same = bcrypt.compareSync(password, user.password); // true
      // console.log(password);
      // console.log(user.hash);
      // console.log(same);
      if (!same) {
        return res.status(200).json({
          success: false,
          message: 'Incorrect Password',
        });
      }
      console.log(user.id);
      token = jwt.sign({ id: user.id }, secret, {
        expiresIn: '1h', // 24 * 30 hours
      });

      return res.status(200).json({
        success: true,
        // message: `Win Opportunity ${req.params.id}`,
        message: 'Logged in',
        data: {
          id: user.id,
          email: user.username,
          accessToken: `Bearer ${token}`,
        },
      });
    } else {
      return res.status(200).json({
        success: false,
        message: 'User Not Found',
      });
    }
  }

  async updatePassword(req: Request, res: Response) {
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
  }

  async getSettings(req: Request, res: Response) {
    const repository = getCustomRepository(EmployeeRepository);

    //Get userId from JWT
    const userId = res.locals.jwtPayload.id;

    let user = await repository.findOne({
      where: { id: userId },
      relations: [
        'contactPersonOrganization',
        'contactPersonOrganization.contactPerson',
        'contactPersonOrganization.organization',
        'bankAccounts',
        'employmentContracts',
      ],
    });

    res.status(200).json({
      success: true,
      message: 'Password Updated Successfully',
      data: user,
    });
  }

  async updateSettings(req: Request, res: Response) {
    const repository = getCustomRepository(EmployeeRepository);
    const userId = res.locals.jwtPayload.id;

    let updatedEmployee = await repository.update(userId, {
      nextOfKinName: req.body.nextOfKinName,
      nextOfKinPhoneNumber: req.body.nextOfKinPhoneNumber,
      nextOfKinEmail: req.body.nextOfKinEmail,
      nextOfKinRelation: req.body.nextOfKinRelation,
      tfn: req.body.tfn,
      taxFreeThreshold: req.body.taxFreeThreshold ?? false,
      helpHECS: req.body.helpHECS ?? false,
      superannuationName: req.body.superannuationName,
      superannuationType:
        req.body.superannuationType == 'P'
          ? SuperannuationType.PUBLIC
          : SuperannuationType.SMSF,
      superannuationBankName: req.body.superannuationBankName,
      superannuationBankAccountOrMembershipNumber:
        req.body.superannuationBankAccountOrMembershipNumber,
      superannuationAbnOrUsi: req.body.superannuationAbnOrUsi,
      superannuationBankBsb: req.body.superannuationBankBsb,
      superannuationAddress: req.body.superannuationAddress,
      training: req.body.training,
    });

    res.status(200).json({
      success: true,
      message: 'Settings Updated Successfully',
      data: updatedEmployee,
    });
  }
}
