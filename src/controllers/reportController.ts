import { Request, Response, NextFunction } from 'express';
import { Employee } from '../entities/employee';
import { getManager } from 'typeorm';
import moment, { Moment } from 'moment';
import {
  buyRateByEmployee,
  parseContractType,
} from '../utilities/helperFunctions';
import { StandardSkillStandardLevel } from '../entities/standardSkillStandardLevel';
import { Opportunity } from '../entities/opportunity';

export class ReportController {
  async benchResources(req: Request, res: Response, next: NextFunction) {
    try {
      let queryStartDate = req.query.startDate as string;
      let queryEndDate = req.query.endDate as string;

      let startDate = moment().startOf('year');
      let endDate = moment().endOf('year');

      interface resSkill {
        skill: string;
        level: string;
      }

      let resources: {
        name: string;
        type: string;
        skills: resSkill[];
        buyRate: number;
      }[] = [];
      let ignoreIds: number[] = [];

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

      const manager = getManager();
      let employees = await manager.find(Employee, {
        relations: [
          'employmentContracts',
          'contactPersonOrganization',
          'contactPersonOrganization.contactPerson',
          'contactPersonOrganization.contactPerson.state',
          'leaveRequestBalances',
          'leaveRequestBalances.type',
          'leaveRequestBalances.type.leaveRequestType',
          'contactPersonOrganization.contactPerson.standardSkillStandardLevels',
          'contactPersonOrganization.contactPerson.standardSkillStandardLevels.standardSkill',
          'contactPersonOrganization.contactPerson.standardSkillStandardLevels.standardLevel',
          'contactPersonOrganization.contactPerson.allocations',
          'contactPersonOrganization.contactPerson.allocations.opportunityResource',
        ],
      });

      for (let employee of employees) {
        let ignore = false;
        for (let allocation of employee.contactPersonOrganization.contactPerson
          .allocations) {
          let position = allocation.opportunityResource;

          if (position) {
            let allocationStart = moment(position.startDate);
            let allocationEnd = moment(position.endDate);
            if (
              allocationStart.isBetween(startDate, endDate, 'date', '[]') ||
              allocationEnd.isBetween(startDate, endDate, 'date', '[]') ||
              (allocationStart.isBefore(startDate) &&
                allocationEnd.isAfter(endDate))
            ) {
              ignore = true;
              break;
            }
          }
        }
        if (ignore) {
          ignoreIds.push(employee.id);
        }
      }

      for (let employee of employees) {
        let type = employee.getActiveContract?.type ?? 0;
        if (!ignoreIds.includes(employee.id)) {
          let skills =
            employee.contactPersonOrganization.contactPerson.standardSkillStandardLevels.map(
              (skill) => {
                return {
                  level: skill.standardLevel.label,
                  skill: skill.standardSkill.label,
                };
              }
            );

          resources.push({
            name: employee.getFullName,
            type: parseContractType(type),
            buyRate: await buyRateByEmployee(employee),
            skills,
          });
        }
      }

      res.status(200).json({
        success: true,
        message: 'Benched Resources',
        data: resources,
      });
    } catch (e) {
      next(e);
    }
  }

  async workforceSkills(req: Request, res: Response, next: NextFunction) {
    try {
      const manager = getManager();

      let worforce: {
        skill: string;
        skillLevel: string;
        name: string;
        type: string;
        buyRate: number;
      }[] = [];

      let standardSkillLevels = await manager.find(StandardSkillStandardLevel, {
        order: {
          standardSkillId: 'ASC',
        },
        relations: [
          'standardSkill',
          'standardLevel',
          'contactPersons',
          'contactPersons.contactPersonOrganizations',
          'contactPersons.contactPersonOrganizations.employee',
          'contactPersons.contactPersonOrganizations.employee.contactPersonOrganization',
          'contactPersons.contactPersonOrganizations.employee.contactPersonOrganization.contactPerson',
          'contactPersons.contactPersonOrganizations.employee.contactPersonOrganization.contactPerson.state',
          'contactPersons.contactPersonOrganizations.employee.employmentContracts',
          'contactPersons.contactPersonOrganizations.employee.leaveRequestBalances',
          'contactPersons.contactPersonOrganizations.employee.leaveRequestBalances.type',
          'contactPersons.contactPersonOrganizations.employee.leaveRequestBalances.type.leaveRequestType',
        ],
      });

      for (let standardSkillLevel of standardSkillLevels) {
        for (let contactPerson of standardSkillLevel.contactPersons) {
          let employee = contactPerson.getEmployee;

          if (!employee) continue;

          if (!employee.getActiveContract) continue;

          let type = employee.getActiveContract.type;

          worforce.push({
            skill: standardSkillLevel.standardSkill.label,
            skillLevel: standardSkillLevel.standardLevel.label,
            name: contactPerson.getFullName,
            type: parseContractType(type),
            buyRate: await buyRateByEmployee(employee),
          });
        }
      }

      res.status(200).json({
        success: true,
        message: 'Workforce skills',
        data: worforce,
      });
    } catch (e) {
      next(e);
    }
  }

  async allocations(req: Request, res: Response, next: NextFunction) {
    try {
      const manager = getManager();

      let allocations: {
        workType: string;
        title: String;
        organization: string;
        milestone: string;
        position: string;
        skill: string;
        skillLevel: string;
        name: string;
        type: string;
        booking: string;
        buyRate: number;
        sellRate: number;
        CMPercent: number;
        startDate: Date;
        endDate: Date;
      }[] = [];

      const projectStatuses = ['P', 'C'];

      let works = await manager.find(Opportunity, {
        relations: [
          'organization',
          'milestones',
          'milestones.opportunityResources',
          'milestones.opportunityResources.panelSkill',
          'milestones.opportunityResources.panelSkill.standardSkill',
          'milestones.opportunityResources.panelSkillStandardLevel',
          'milestones.opportunityResources.panelSkillStandardLevel.standardLevel',
          'milestones.opportunityResources.opportunityResourceAllocations',
          'milestones.opportunityResources.opportunityResourceAllocations.contactPerson',
          'milestones.opportunityResources.opportunityResourceAllocations.contactPerson.contactPersonOrganizations',
          'milestones.opportunityResources.opportunityResourceAllocations.contactPerson.contactPersonOrganizations.employee',
          'milestones.opportunityResources.opportunityResourceAllocations.contactPerson.contactPersonOrganizations.employee.employmentContracts',
        ],
      });

      for (let work of works) {
        for (let milestone of work.milestones) {
          for (let position of milestone.opportunityResources) {
            for (let allocation of position.opportunityResourceAllocations) {
              let type =
                allocation.contactPerson.getEmployee?.getActiveContract?.type ??
                0;

              if (allocation.isMarkedAsSelected) {
                allocations.push({
                  workType: projectStatuses.includes(work.status)
                    ? 'Project'
                    : 'Opportunity',
                  title: work.title,
                  organization: work.organization.title,
                  milestone: milestone.title,
                  position: position.title ?? '-N',
                  skill: position.panelSkill.standardSkill.label,
                  skillLevel:
                    position.panelSkillStandardLevel.standardLevel.label,
                  name: allocation.contactPerson.getFullName,
                  type: parseContractType(type),
                  booking: allocation.contactPerson.getEmployee
                    ? 'Allocated'
                    : 'Softbook',
                  buyRate: allocation.buyingRate,
                  sellRate: allocation.sellingRate,
                  CMPercent: 0,
                  startDate: position.startDate,
                  endDate: position.endDate,
                });
              }
            }
          }
        }
      }

      res.status(200).json({
        success: true,
        message: 'Allocations',
        data: allocations,
      });
    } catch (e) {
      next(e);
    }
  }

  async allocationsAll(req: Request, res: Response, next: NextFunction) {
    try {
      const manager = getManager();

      let allocations: {
        workType: string;
        title: String;
        organization: string;
        milestone: string;
        position: string;
        skill: string;
        skillLevel: string;
        name: string;
        type: string;
        booking: string;
        buyRate: number;
        sellRate: number;
        startDate: Date;
        endDate: Date;
      }[] = [];

      const projectStatuses = ['P', 'C'];

      let works = await manager.find(Opportunity, {
        relations: [
          'organization',
          'milestones',
          'milestones.opportunityResources',
          'milestones.opportunityResources.panelSkill',
          'milestones.opportunityResources.panelSkill.standardSkill',
          'milestones.opportunityResources.panelSkillStandardLevel',
          'milestones.opportunityResources.panelSkillStandardLevel.standardLevel',
          'milestones.opportunityResources.opportunityResourceAllocations',
          'milestones.opportunityResources.opportunityResourceAllocations.contactPerson',
          'milestones.opportunityResources.opportunityResourceAllocations.contactPerson.contactPersonOrganizations',
          'milestones.opportunityResources.opportunityResourceAllocations.contactPerson.contactPersonOrganizations.employee',
          'milestones.opportunityResources.opportunityResourceAllocations.contactPerson.contactPersonOrganizations.employee.employmentContracts',
        ],
      });

      for (let work of works) {
        for (let milestone of work.milestones) {
          for (let position of milestone.opportunityResources) {
            for (let allocation of position.opportunityResourceAllocations) {
              let type =
                allocation.contactPerson.getEmployee?.getActiveContract?.type ??
                0;

              allocations.push({
                workType: projectStatuses.includes(work.status)
                  ? 'Project'
                  : 'Opportunity',
                title: work.title,
                organization: work.organization.title,
                milestone: milestone.title,
                position: position.title ?? '-N',
                skill: position.panelSkill.standardSkill.label,
                skillLevel:
                  position.panelSkillStandardLevel.standardLevel.label,
                name: allocation.contactPerson.getFullName,
                type: parseContractType(type),
                booking: allocation.contactPerson.getEmployee
                  ? 'Allocated'
                  : 'Softbook',
                buyRate: allocation.buyingRate,
                sellRate: allocation.sellingRate,
                startDate: position.startDate,
                endDate: position.endDate,
              });
            }
          }
        }
      }

      res.status(200).json({
        success: true,
        message: 'Allocations',
        data: allocations,
      });
    } catch (e) {
      next(e);
    }
  }
}
