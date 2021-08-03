import { Request, Response, NextFunction } from 'express';
import { EmployeeRepository } from '../repositories/employeeRepository';
import { getCustomRepository } from 'typeorm';
import { secret } from '../utilities/configs';
import jwt from 'jsonwebtoken';
export let isLoggedIn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const repository = getCustomRepository(EmployeeRepository);

  if (req.headers.authorization) {
    let token = req.headers.authorization.split(' ')[1];
    jwt.verify(token, secret, async (err: any, decoded: any) => {
      if (err) {
        console.log(err);
        return res.status(200).json({
          success: false,
          message: 'Authentication Expired or Invalid',
        });
      } else {
        res.locals.jwtPayload = decoded;
        let user = await repository.findOne(decoded.id, {
          relations: [
            'role',
            'role.permissions',
            'contactPersonOrganization',
            'contactPersonOrganization.contactPerson',
          ],
        });
        if (user) {
          res.locals.user = user;
          const newToken = jwt.sign({ id: user.id }, secret, {
            expiresIn: '1h',
          });
          res.setHeader('Authorization', `Bearer ${newToken}`);
          next();
        } else {
          return res.status(200).json({
            success: false,
            message: 'Something went wrong',
          });
        }
      }
    });
  } else {
    return res.status(200).json({
      success: false,
      message: 'Authorization Header is missing',
    });
  }

  // let token = req.headers['_token'];
  // var decoded = jwt.verify(token, 'onelm');
  // console.log(decoded); // bar
};
