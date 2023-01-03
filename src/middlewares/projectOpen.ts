import { NextFunction, Request, Response } from 'express';
import { OpportunityStatus } from '../constants/constants';
import { Opportunity } from '../entities/opportunity';
import { getConnection, getManager, In } from 'typeorm';

export const projectOpen = (resourceIdParamKey: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    let projectId = parseInt(req.params[resourceIdParamKey]);
    const project = await getManager().findOne(Opportunity, projectId, {});

    if (!project) {
      return next(new Error('Project not found'));
    }

    if (!project.phase) {
      next(new Error('Project is closed!'));
    }

    return next();
  };
};
