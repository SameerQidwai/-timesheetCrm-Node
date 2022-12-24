import { Request, Response, NextFunction } from 'express';
import { Employee } from '../entities/employee';
import { getManager } from 'typeorm';
import moment, { Moment } from 'moment';
import {
  buyRateByEmployee,
  parseBookingType,
  parseContractType,
  parseResourceType,
} from '../utilities/helperFunctions';
import { StandardSkillStandardLevel } from '../entities/standardSkillStandardLevel';
import { Opportunity } from '../entities/opportunity';
import { ProfitView } from '../entities/views';
// import { ResourceView } from '../entities/views';

export class ReportController {
  _customQueryParser(query = '') {
    let ids = [];

    for (let item of query.split(',')) {
      if (isNaN(parseInt(item))) continue;

      ids.push(parseInt(item));
    }

    return ids;
  }

  async benchResources(req: Request, res: Response, next: NextFunction) {
    try {
      let queryStartDate = req.query.startDate as string;
      let queryEndDate = req.query.endDate as string;

      let queryResourceType = this._customQueryParser(
        req.query.resourceType as string
      );

      let startDate = moment().startOf('year');
      let endDate = moment().endOf('year');

      interface resSkill {
        skill: string;
        level: string;
      }

      let resources: {
        name: string;
        resourceType: string;
        employmentType: string;
        skills: resSkill[];
        buyRate: number;
      }[] = [];
      let ignoreIds: number[] = [];

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
          'contactPersonOrganization.contactPerson.allocations.opportunityResource.milestone',
          'contactPersonOrganization.contactPerson.allocations.opportunityResource.milestone.project',
        ],
        where: { active: true },
      });

      const projectStatuses = ['P', 'C'];

      for (let employee of employees) {
        let ignore = false;
        for (let allocation of employee.contactPersonOrganization.contactPerson
          .allocations) {
          let position = allocation.opportunityResource;

          if (position) {
            if (!projectStatuses.includes(position.milestone.project.status))
              continue;

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
        let employmentType = employee.getActiveContract?.type ?? 0;
        let resourceType =
          employee.contactPersonOrganization.organizationId == 1 ? 1 : 2;

        if (
          queryResourceType.length &&
          !queryResourceType.includes(resourceType)
        ) {
          continue;
        }

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
            resourceType: parseResourceType(resourceType),
            employmentType: parseContractType(employmentType),
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

      let querySkillId = this._customQueryParser(req.query.skillId as string);
      let queryLevelId = this._customQueryParser(req.query.levelId as string);

      let queryResourceType = this._customQueryParser(
        req.query.resourceType as string
      );

      let worforce: {
        skill: string;
        skillLevel: string;
        name: string;
        resourceType: string;
        employmentType: string;
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

          if (!employee.active) continue;

          let employmentType = employee.getActiveContract?.type ?? 0;
          let resourceType =
            employee.contactPersonOrganization.organizationId == 1 ? 1 : 2;

          if (
            queryResourceType.length &&
            !queryResourceType.includes(resourceType)
          ) {
            continue;
          }

          if (
            (!querySkillId.length ||
              querySkillId.includes(standardSkillLevel.standardSkillId)) &&
            (!queryLevelId.length ||
              queryLevelId.includes(standardSkillLevel.standardLevelId))
          )
            worforce.push({
              skill: standardSkillLevel.standardSkill.label,
              skillLevel: standardSkillLevel.standardLevel.label,
              name: contactPerson.getFullName,
              resourceType: parseResourceType(resourceType),
              employmentType: parseContractType(employmentType),
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

  async opportunityAllocations(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const manager = getManager();

      let queryStartDate = req.query.startDate as string;
      let queryEndDate = req.query.endDate as string;

      let querySkillId = this._customQueryParser(req.query.skillId as string);
      let queryLevelId = this._customQueryParser(req.query.levelId as string);
      let queryResourceType = this._customQueryParser(
        req.query.resourceType as string
      );
      let queryWorkStatus = this._customQueryParser(
        req.query.workStatus as string
      );
      let queryWorkType = this._customQueryParser(req.query.workType as string);
      let queryContactPersonId = this._customQueryParser(
        req.query.contactPersonId as string
      );
      let queryWorkId = this._customQueryParser(req.query.workId as string);
      let queryOrganizationId = this._customQueryParser(
        req.query.organizationId as string
      );

      let startDate = moment().startOf('year');
      let endDate = moment().endOf('year');

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

      interface allocation {
        workType: string;
        title: String;
        organization: string;
        milestone: string;
        position: string;
        skill: string;
        skillLevel: string;
        name: string;
        employmentType: string;
        resourceType: string;
        bookingType: string;
        buyRate: number;
        sellRate: number;
        CMPercent: number;
        startDate: Date;
        endDate: Date;
      }

      let allocations: allocation[] = [];

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
        let workStatus = projectStatuses.includes(work.status) ? 1 : 0;
        if (
          (queryWorkStatus.length && !queryWorkStatus.includes(workStatus)) ||
          (queryWorkType.length && !queryWorkType.includes(work.type))
        ) {
          continue;
        }

        if (queryWorkId.length && !queryWorkId.includes(work.id)) {
          continue;
        }

        if (
          queryOrganizationId.length &&
          !queryOrganizationId.includes(work.organization.id)
        ) {
          continue;
        }

        for (let milestone of work.milestones) {
          for (let position of milestone.opportunityResources) {
            let positionStartDate = moment(position.startDate);
            let positionEndDate = moment(position.endDate);

            if (
              !positionStartDate.isBetween(startDate, endDate, 'date', '[]') &&
              !positionEndDate.isBetween(startDate, endDate, 'date', '[]') &&
              !(
                positionStartDate.isBefore(startDate) &&
                positionEndDate.isAfter(endDate)
              )
            ) {
              continue;
            }

            if (
              (querySkillId.length &&
                !querySkillId.includes(position.panelSkill.standardSkillId)) ||
              (queryLevelId.length &&
                !queryLevelId.includes(
                  position.panelSkillStandardLevel.standardLevelId
                ))
            ) {
              continue;
            }

            if (!position.opportunityResourceAllocations.length) {
              if (queryContactPersonId.length || queryResourceType.length) {
                continue;
              }

              allocations.push({
                workType: workStatus ? 'Project' : 'Opportunity',
                title: work.title,
                organization: work.organization.title,
                milestone: work.type == 1 ? milestone.title : '-',
                position: position.title ?? '-',
                skill: position.panelSkill.standardSkill.label,
                skillLevel:
                  position.panelSkillStandardLevel.standardLevel.label,
                name: '-',
                resourceType: '-',
                employmentType: '-',
                bookingType: 'Unallocated',
                buyRate: 0,
                sellRate: 0,
                CMPercent: 0,
                startDate: position.startDate,
                endDate: position.endDate,
              });
            }

            for (let allocation of position.opportunityResourceAllocations) {
              if (
                queryContactPersonId.length &&
                !queryContactPersonId.includes(allocation.contactPerson.id)
              ) {
                continue;
              }

              let employmentType =
                allocation.contactPerson.getEmployee?.getActiveContract?.type ??
                0;
              let bookingType = 0;
              let resourceType = 0;

              if (allocation.contactPerson.getActiveOrganization)
                resourceType =
                  allocation.contactPerson.getActiveOrganization
                    .organizationId == 1
                    ? 1
                    : 2;

              if (allocation.isMarkedAsSelected)
                bookingType = allocation.contactPerson.getEmployee ? 2 : 1;

              if (
                queryResourceType.length &&
                !queryResourceType.includes(resourceType)
              ) {
                continue;
              }

              allocations.push({
                workType: workStatus ? 'Project' : 'Opportunity',
                title: work.title,
                organization: work.organization.title,
                milestone: work.type == 1 ? milestone.title : '-',
                position: position.title ?? '-',
                skill: position.panelSkill.standardSkill.label,
                skillLevel:
                  position.panelSkillStandardLevel.standardLevel.label,
                name: allocation.contactPerson.getFullName,
                resourceType: parseResourceType(resourceType),
                employmentType: parseContractType(employmentType),
                bookingType: parseBookingType(bookingType),
                buyRate: allocation.buyingRate,
                sellRate: allocation.sellingRate,
                CMPercent: allocation.sellingRate
                  ? ((allocation.sellingRate - allocation.buyingRate) /
                      allocation.sellingRate) *
                    100
                  : 0,
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

  async employeeAllocations(req: Request, res: Response, next: NextFunction) {
    try {
      const manager = getManager();

      let queryStartDate = req.query.startDate as string;
      let queryEndDate = req.query.endDate as string;

      let querySkillId = this._customQueryParser(req.query.skillId as string);
      let queryLevelId = this._customQueryParser(req.query.levelId as string);
      let queryResourceType = this._customQueryParser(
        req.query.resourceType as string
      );
      let queryWorkStatus = this._customQueryParser(
        req.query.workStatus as string
      );
      let queryWorkType = this._customQueryParser(req.query.workType as string);
      let queryContactPersonId = this._customQueryParser(
        req.query.contactPersonId as string
      );
      let queryWorkId = this._customQueryParser(req.query.workId as string);
      let queryOrganizationId = this._customQueryParser(
        req.query.organizationId as string
      );

      let startDate = moment().startOf('year');
      let endDate = moment().endOf('year');

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

      let allocations: {
        name: string;
        resourceType: string;
        employmentType: string;
        bookingType: string;
        workType: string;
        title: String;
        organization: string;
        milestone: string;
        position: string;
        skill: string;
        skillLevel: string;
        buyRate: number;
        sellRate: number;
        startDate: Date | null;
        endDate: Date | null;
      }[] = [];

      const projectStatuses = ['P', 'C'];

      let employees = await manager.find(Employee, {
        relations: [
          'contactPersonOrganization',
          'contactPersonOrganization.contactPerson',
          'contactPersonOrganization.contactPerson.allocations',
          'contactPersonOrganization.contactPerson.allocations.opportunityResource',
          'contactPersonOrganization.contactPerson.allocations.opportunityResource.panelSkill',
          'contactPersonOrganization.contactPerson.allocations.opportunityResource.panelSkill.standardSkill',
          'contactPersonOrganization.contactPerson.allocations.opportunityResource.panelSkillStandardLevel',
          'contactPersonOrganization.contactPerson.allocations.opportunityResource.panelSkillStandardLevel.standardLevel',
          'contactPersonOrganization.contactPerson.allocations.opportunityResource.milestone',
          'contactPersonOrganization.contactPerson.allocations.opportunityResource.milestone.project',
          'contactPersonOrganization.contactPerson.allocations.opportunityResource.milestone.project.organization',
          'employmentContracts',
        ],
        where: { active: true },
      });

      for (let employee of employees) {
        let employeeAllocations =
          employee.contactPersonOrganization.contactPerson.allocations;

        if (
          queryContactPersonId.length &&
          !queryContactPersonId.includes(
            employee.contactPersonOrganization.contactPerson.id
          )
        ) {
          continue;
        }

        let employmentType = employee.getActiveContract?.type ?? 0;
        let resourceType =
          employee.contactPersonOrganization.organizationId == 1 ? 1 : 2;

        if (!employeeAllocations.length) {
          if (
            queryResourceType.length &&
            !queryResourceType.includes(resourceType)
          ) {
            continue;
          }

          //ignoring inner loop queries
          if (
            queryWorkId.length ||
            queryOrganizationId.length ||
            queryWorkStatus.length ||
            queryWorkType.length ||
            queryResourceType.length ||
            querySkillId.length ||
            queryLevelId.length
          ) {
            continue;
          }

          allocations.push({
            name: employee.getFullName,
            resourceType: parseResourceType(resourceType),
            employmentType: parseContractType(employmentType),
            bookingType: 'Unallocated',
            workType: '-',
            title: '-',
            organization: '-',
            milestone: '-',
            position: '-',
            skill: '-',
            skillLevel: '-',
            buyRate: 0,
            sellRate: 0,
            startDate: null,
            endDate: null,
          });
        }

        for (let allocation of employeeAllocations) {
          let position = allocation.opportunityResource;

          if (!position) continue;

          let milestone = allocation.opportunityResource.milestone;

          if (!milestone) continue;

          let positionStartDate = moment(position.startDate);
          let positionEndDate = moment(position.endDate);

          if (
            !positionStartDate.isBetween(startDate, endDate, 'date', '[]') &&
            !positionEndDate.isBetween(startDate, endDate, 'date', '[]') &&
            !(
              positionStartDate.isBefore(startDate) &&
              positionEndDate.isAfter(endDate)
            )
          ) {
            continue;
          }

          let work = milestone.project;

          if (queryWorkId.length && !queryWorkId.includes(work.id)) {
            continue;
          }

          if (
            queryOrganizationId.length &&
            !queryOrganizationId.includes(work.organization.id)
          ) {
            continue;
          }

          let workStatus = projectStatuses.includes(work.status) ? 1 : 0;
          if (
            (queryWorkStatus.length && !queryWorkStatus.includes(workStatus)) ||
            (queryWorkType.length && !queryWorkType.includes(work.type))
          ) {
            continue;
          }

          let bookingType = allocation.isMarkedAsSelected ? 2 : 0;

          if (
            queryResourceType.length &&
            !queryResourceType.includes(resourceType)
          ) {
            continue;
          }

          if (
            (querySkillId.length &&
              !querySkillId.includes(position.panelSkill.standardSkillId)) ||
            (queryLevelId.length &&
              !queryLevelId.includes(
                position.panelSkillStandardLevel.standardLevelId
              ))
          ) {
            continue;
          }

          allocations.push({
            name: employee.getFullName,
            resourceType: parseResourceType(resourceType),
            employmentType: parseContractType(employmentType),
            bookingType: parseBookingType(bookingType),
            workType: workStatus ? 'Project' : 'Opportunity',
            title: work.title,
            organization: work.organization.title,
            milestone: work.type == 1 ? milestone.title : '-',
            position: position.title ?? '-',
            skill: position.panelSkill.standardSkill.label,
            skillLevel: position.panelSkillStandardLevel.standardLevel.label,
            buyRate: allocation.buyingRate,
            sellRate: allocation.sellingRate,
            startDate: position.startDate,
            endDate: position.endDate,
          });
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

  async projectRevnueAnalysis(req: Request ,res: Response, next: NextFunction){
    
    let fiscalYearStart = req.query.fiscalYearStart as string;
    let fiscalYearEnd = req.query.fiscalYearEnd as string;
    // let projectId = this._customQueryParser(req.query.projectId as string);
    let projectId = req.query.projectId as string;
    let excludeProjectId = req.query.excludeProjectId as string;
    // let organizationId = this._customQueryParser(req.query.organizationId as string);
    let organizationId = req.query.organizationId as string;
    let projectFilter = projectId? `AND profit_view.project_id IN (${projectId})` :''
    let excludeProjectFilter = excludeProjectId? `AND profit_view.project_id NOT IN (${excludeProjectId})` :''
    let organizationFilter =organizationId? `AND project_organization_id IN (${organizationId})` :''
    
    const actual = await getManager().query(`
      SELECT revenue_calculator.*, name project_manager_name  
      FROM (SELECT 
        project_type,
        project_amount,
        profit_view.project_id,
        project_organization_id,
        project_organization_name,
        project_title,
        project_manager_id, 
        (CASE WHEN project_type = 2 
          THEN 
            SUM( resource_buying_rate * actual_hours ) 
          ELSE 
            0 
          END )
        month_total_buy, 

        (CASE WHEN project_type = 2 
          THEN 
              SUM( resource_selling_rate * actual_hours ) 
          ELSE 
            project_schedule_segments.amount 
          END )
        month_total_sell, 
        
        SUM(actual_hours) actual_hours, 
        (CASE WHEN project_type = 2 
          THEN 
            DATE_FORMAT(STR_TO_DATE(entry_date,'%e-%m-%Y'), '%b %y') 
          ELSE 
            DATE_FORMAT(project_schedule_segments.start_date, '%b %y') 
          END) 
        month
      
        FROM profit_view
          LEFT JOIN project_schedules ON
            profit_view.project_id = project_schedules.project_id
              LEFT JOIN project_schedule_segments  ON 
                project_schedules.id = project_schedule_segments.schedule_id 
                
        WHERE ( project_status = 'P' OR project_status = 'C' ) 
        
        AND project_start <= STR_TO_DATE('${fiscalYearEnd}' ,'%Y-%m-%d') 
        AND project_end >= STR_TO_DATE('${fiscalYearStart}' ,'%Y-%m-%d') 
        AND project_schedules.deleted_at IS NULL 
        AND project_schedule_segments.deleted_at IS NULL 
        ${projectFilter} ${organizationFilter} ${excludeProjectFilter} 

        GROUP BY project_id, month 
      ) as revenue_calculator
            
        LEFT JOIN contact_person_View ON
          contact_person_View.employee_id = project_manager_id
    `);
    let actualStatement: any = {};
    actual.forEach((el: any) =>{
      actualStatement[el.project_id] = {
        ...(actualStatement?.[el.project_id] ?? {
          projectValue: el.project_amount,
          projectId: el.project_id,
          organizationId: el.project_organization_id,
          organizationName: el.project_organization_name,
          projectTitle: el.project_title,
          projectManagerId: el.project_manager_id,
          projectManagerName: el.project_manager_name,
          projectType: el.project_type,
        }),
        [el.month]: {
          monthTotalBuy: el.month_total_buy,
          monthTotalSell: el.month_total_sell,
        },
        totalSell: actualStatement?.[el.project_id]
          ? (actualStatement[el.project_id]['totalSell'] += el.month_total_sell)
          : el.month_total_sell,
        totalBuy: actualStatement?.[el.project_id]
          ? (actualStatement[el.project_id]['totalBuy'] += el.month_total_buy)
          : el.month_total_buy,
        YTDTotalSell: moment(el.month, 'MMM YY').isBetween(
          fiscalYearStart,
          fiscalYearEnd,
          'month',
          '[]'
        )
          ? actualStatement[el.project_id]
            ? (actualStatement[el.project_id]['YTDTotalSell'] +=
                el.month_total_sell)
            : el.month_total_sell
          : actualStatement?.[el.project_id]?.['YTDTotalSell'] ?? 0,
      };
    })

    res.status(200).json({
      success: true,
      message: 'Project Revenue Analysis',
      data: Object.values(actualStatement),
    });
  }
}
