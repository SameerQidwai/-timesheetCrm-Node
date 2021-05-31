import { Request, Response } from 'express';
import { EmployeeRepository } from './../repositories/employeeRepository';
import { getCustomRepository } from 'typeorm';
import { EntityType } from '../constants/constants';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class AuthController {
  async login(req: Request, res: Response) {
    const repository = getCustomRepository(EmployeeRepository);

    let email: string = req.body.email;
    let password: string = req.body.password;
    let user = await repository.login(email, password);

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
      token = jwt.sign({ id: user.id }, 'onelm', {
        expiresIn: 86400 * 30, // 24 * 30 hours
      });

      return res.status(200).json({
        success: true,
        // message: `Win Opportunity ${req.params.id}`,
        message: 'Logged in',
        data: {
          email: user.email,
          accessToken: token,
        },
      });
    } else {
      return res.status(200).json({
        success: true,
        message: 'User Not Found',
      });
    }
  }
}
