import { Request, Response, NextFunction } from 'express';
import { Employee } from '../entities/employee';
import { getManager } from 'typeorm';
import moment from 'moment';
import { start } from 'repl';
import { date } from 'joi';
import { EmploymentType } from 'src/constants/constants';

export class ReportController {
  async benchResources(req: Request, res: Response, next: NextFunction) {
    try {
      let queryStartDate = req.query.startDate as string;
      let queryEndDate = req.query.endDate as string;

      let startDate = moment().startOf('year');
      let endDate = moment().endOf('year');

      let resources: {
        name: string;
        type: string;
        skill: string;
        level: string;
        buyRate: number;
      }[] = [];
      let addedIds: number[] = [];

      console.log(queryStartDate, queryEndDate);

      if (queryStartDate) {
        if (moment(queryStartDate).isValid()) {
          startDate = moment(queryStartDate);
        }
      }

      if (queryEndDate) {
        if (moment(queryEndDate).isValid()) {
          endDate = moment(queryEndDate);
        }
      }

      let manager = getManager();
      let employees = await manager.find(Employee, {
        relations: [
          'employmentContracts',
          'contactPersonOrganization',
          'contactPersonOrganization.contactPerson',
          'contactPersonOrganization.contactPerson.standardSkillStandardLevels',
          'contactPersonOrganization.contactPerson.standardSkillStandardLevels.standardSkill',
          'contactPersonOrganization.contactPerson.standardSkillStandardLevels.standardLevel',
          'contactPersonOrganization.contactPerson.allocations',
          'contactPersonOrganization.contactPerson.allocations.opportunityResource',
          'contactPersonOrganization.contactPerson.allocations.opportunityResource.panelSkillStandardLevel',
          'contactPersonOrganization.contactPerson.allocations.opportunityResource.panelSkillStandardLevel.standardLevel',
          'contactPersonOrganization.contactPerson.allocations.opportunityResource.panelSkill',
          'contactPersonOrganization.contactPerson.allocations.opportunityResource.panelSkill.standardSkill',
        ],
      });

      employees.forEach((employee) => {
        employee.contactPersonOrganization.contactPerson.allocations.forEach(
          (allocation) => {
            let position = allocation.opportunityResource;
            let type = employee.getActiveContract?.type ?? 0;
            if (position) {
              let allocationStart = moment(position.startDate);
              let allocationEnd = moment(position.endDate);
              if (
                !allocationStart.isBetween(startDate, endDate, 'date', '[]') &&
                !allocationEnd.isBetween(startDate, endDate, 'date', '[]') &&
                !(
                  allocationStart.isBefore(startDate) &&
                  allocationEnd.isAfter(endDate)
                )
              ) {
                if (!addedIds.includes(employee.id)) {
                  // addedIds.push(employee.id);
                  resources.push({
                    name: employee.getFullName,
                    type:
                      type === 1
                        ? 'Casual'
                        : type === 2
                        ? 'Full Time'
                        : type === 3
                        ? 'Part Time'
                        : 'Inactive Contract',
                    skill: position.panelSkill.standardSkill.label,
                    level: position.panelSkillStandardLevel.standardLevel.label,
                    buyRate: allocation.buyingRate,
                  });
                }
              }
            }
          }
        );
      });

      res.status(200).json({
        success: true,
        message: 'Benched Resources',
        data: resources,
      });
    } catch (e) {
      next(e);
    }
  }
}
