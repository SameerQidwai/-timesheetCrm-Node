import { Request, Response, NextFunction } from 'express';
import { Employee } from './../entities/employee';
import { Opportunity } from './../entities/opportunity';
import { getManager } from 'typeorm';
import { Action, Grant, Resource } from './../constants/authorization';
import { ExpenseSheet } from '../entities/expenseSheet';
import { getProjectsByUserId } from '../utilities/helperFunctions';

export const can = (
  action: Action,
  resource: Resource,
  resourceIdParamKey: string = ''
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    let user: Employee = res.locals.user;
    let permissions = user.role.permissions.filter(
      (permission) =>
        permission.action == action && permission.resource == resource
    );
    // if (grant) {
    //   permissions = permissions.filter(permission => permission.grant == grant);
    // }
    console.log('can.ts -- Permission Length =>', permissions.length);
    if (permissions.length) {
      res.locals.grantLevel = permissions.map((x) => x.grant).join('|');
      if (!resourceIdParamKey) {
        return next();
      }
      let a = await where(
        resource,
        parseInt(req.params[resourceIdParamKey]),
        res.locals.grantLevel,
        user.id,
        user.contactPersonOrganization.contactPersonId
      );
      if (a) return next();
    }
    next(new Error('Not Authorized!'));
  };
};

export const where = async (
  resource: Resource,
  resourceId: number,
  grantLevel: string,
  userId: number,
  contactPersonId: number
) => {
  console.log('where: ', resourceId, grantLevel);

  if (grantLevel.includes('ANY')) {
    return true;
  }
  const entityManager = getManager();

  switch (resource) {
    case Resource.OPPORTUNITIES: {
      const opportunity = await entityManager.find(Opportunity, {
        where: [
          {
            id: resourceId,
            status: 'O',
          },
          {
            id: resourceId,
            status: 'L',
          },
          {
            id: resourceId,
            status: 'NB',
          },
          {
            id: resourceId,
            status: 'DNP',
          },
        ],
      });
      if (!opportunity.length) {
        return false;
      }
      if (
        grantLevel.includes('MANAGE') &&
        (opportunity[0].opportunityManagerId == userId ||
          opportunity[0].accountDirectorId == userId ||
          opportunity[0].accountManagerId == userId)
      ) {
        return true;
      }
      return false;
    }
    case Resource.PROJECTS: {
      const project = await entityManager.find(Opportunity, {
        where: [
          {
            id: resourceId,
            status: 'P',
          },
          {
            id: resourceId,
            status: 'C',
          },
        ],
        relations: [
          'opportunityResources',
          'opportunityResources.opportunityResourceAllocations',
        ],
      });
      if (!project.length) {
        return false;
      }
      if (
        grantLevel.includes('MANAGE') &&
        (project[0].projectManagerId == userId ||
          project[0].accountDirectorId == userId ||
          project[0].accountManagerId == userId)
      ) {
        return true;
      }

      if (grantLevel.includes('OWN')) {
        let flag = false;
        project[0].opportunityResources.map((resource) => {
          resource.opportunityResourceAllocations.filter((allocation) => {
            if (
              allocation.contactPersonId === contactPersonId &&
              allocation.isMarkedAsSelected
            ) {
              flag = true;
            }
          });
        });
        return flag;
      }
      return false;
    }
    case Resource.TIMESHEETS: {
      /* TODOs:
       * Fetch timesheet with projectEntry
       * Validate if project is managed by user for MANAGE
       * Validate if timesheet UserId is equal to auth user for OWM
       */
    }
    case Resource.EXPENSES: {
      // if (grantLevel.includes('MANAGE')) {
      //   let employee = await entityManager.findOne(Employee, userId, {
      //     relations: [
      //       'contactPersonOrganization',
      //       'contactPersonOrganization.contactPerson',
      //     ],
      //   });
      //   if (!employee) {
      //     throw new Error('Employee not found');
      //   }
      //   const expenseSheet = await entityManager.findOne(
      //     ExpenseSheet,
      //     resourceId,
      //     { relations: ['creator'] }
      //   );
      //   if (!expenseSheet) {
      //     throw new Error('Expense sheet not found');
      //   }
      //   if (employee.lineManagerId == userId) {
      //     return true;
      //   }
      //   let projects = await entityManager.find(Opportunity, {
      //     where: [{ status: 'P' }, { status: 'C' }],
      //     relations: [
      //       'organization',
      //       'opportunityResources',
      //       'opportunityResources.panelSkill',
      //       'opportunityResources.panelSkillStandardLevel',
      //       'opportunityResources.opportunityResourceAllocations',
      //       'opportunityResources.opportunityResourceAllocations.contactPerson',
      //     ],
      //   });
      //   let projectIds: Array<number> = getProjectsByUserId(
      //     projects,
      //     'm',
      //     0,
      //     employee.contactPersonOrganization.contactPersonId,
      //     userId,
      //     true
      //   );
      //   if (projectIds.includes(expenseSheet.projectId)) {
      //     return true;
      //   }
      //   return false;
      // }
    }
  }
};
