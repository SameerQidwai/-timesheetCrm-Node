import { NextFunction, Request, Response } from 'express';
import { getConnection, getManager, In } from 'typeorm';
import { SystemVariable } from '../entities/systemVariable';
import { parseSystemVariable } from '../utilities/helpers';

export let crmLock = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const crmLockFlag = await getManager().findOne(SystemVariable, {
    where: { label: 'crmLock' },
  });

  console.log(crmLockFlag);

  if (!crmLockFlag) {
    return next();
  }

  if (parseSystemVariable(crmLockFlag)) {
    return next(new Error('System is locked, please try again'));
  }

  return next();
};
