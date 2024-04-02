import e, { Request, Response, NextFunction, query } from 'express';
import { Employee } from '../entities/employee';
import { Opportunity } from '../entities/opportunity';
import { getManager } from 'typeorm';
import { Action, Grant, Resource } from '../constants/authorization';

export const canCustom = (
  action: Action,
  defaultResource: Resource | null = null
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    let user: Employee = res.locals.user;

    let query: Resource | null = null;
    let resource: Resource | null = null;
    if (req.query.resource) (query as any) = req.query.resource ?? null;

    if (query == null) {
      if (defaultResource) query = defaultResource;
      else next(new Error('Unknown Resource!'));
    }

    if (query != null) resource = Resource[query];

    if (resource == null) {
      next(new Error('Unknown Resource!'));
    }

    let permissions = user.role.permissions.filter(
      (permission) =>
        permission.action == action && permission.resource == resource
    );
    // if (grant) {
    //   permissions = permissions.filter(permission => permission.grant == grant);
    // }
    console.log('canCustom.ts -- Permission Length =>', permissions.length);
    if (permissions.length) {
      res.locals.grantLevel = permissions.map((x) => x.grant).join('|');
      return next();
    }
    next(new Error('Not Authorized!'));
  };
};
