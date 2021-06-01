import { Request, Response, NextFunction } from 'express';
import { EmployeeRepository } from '../repositories/employeeRepository';
import { getCustomRepository } from 'typeorm';
import jwt from 'jsonwebtoken';
export let isLoggedIn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const repository = getCustomRepository(EmployeeRepository);

  if (req.headers.authorization) {
    let token = req.headers.authorization.split(' ')[1];
    jwt.verify(token, 'onelm', async (err: any, decoded: any) => {
      console.log(token, decoded);
      if (err) {
        console.log(err);
        return res.status(200).json({
          success: false,
          message: 'Not Authorized',
        });
      } else {
        let user = await repository.findOne(decoded.id);
        const newToken = jwt.sign({ id: user }, 'onelm', {
          expiresIn: '1h',
        });
        res.setHeader('Authorization', `Bearer ${newToken}`);

        next();

        if (user) {
          next();
        } else {
          return res.status(200).json({
            success: false,
            message: 'Something went wrong',
          });
        }
      }
    });
  }

  // let token = req.headers['_token'];
  // var decoded = jwt.verify(token, 'onelm');
  // console.log(decoded); // bar
};
