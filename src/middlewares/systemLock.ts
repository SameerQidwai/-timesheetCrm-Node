import { NextFunction, Request, Response } from 'express';
import { getConnection, getManager, In } from 'typeorm';
import { SystemVariable } from '../entities/systemVariable';
import { parseGlobalSetting } from '../utilities/helpers';
import { GlobalSetting } from '../entities/globalSetting';

export let crmLock = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const systemLock = await getManager().findOne(GlobalSetting, {
    where: { keyLabel: 'systemLock' },
  });
  // const crmLockFlag = await getManager().findOne(SystemVariable, {
  //   where: { label: 'crmLock' },
  // });

  if (!systemLock) {
    return next();
  }

  if (parseGlobalSetting(systemLock)) {
    return next(new Error('System is locked, please try again'));
  }

  return next();
};
