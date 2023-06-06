import { Request, Response, NextFunction, query } from 'express';
import { Employee } from '../entities/employee';
import { Between, getManager, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import moment from 'moment-timezone';
import { Moment } from 'moment';
import {
  buyRateByEmployee,
  getFiscalYear,
  parseBookingType,
  parseContractType,
  parseResourceType,
  parseWorkStatus,
} from '../utilities/helperFunctions';
import { StandardSkillStandardLevel } from '../entities/standardSkillStandardLevel';
import { Opportunity } from '../entities/opportunity';
import { PurchaseOrder } from '../entities/purchaseOrder';
import { ProjectType, TimesheetSummaryStatus } from '../constants/constants';
import path from 'path';

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

      let queryExcludeWorkId = this._customQueryParser(
        req.query.excludeWorkId as string
      );

      let queryResourceType = this._customQueryParser(
        req.query.resourceType as string
      );

      let currentMoment = moment();
      let startDate = moment(
        `${getFiscalYear(currentMoment)}-${
          process.env.FISCAL_YEAR_START ?? '07'
        }-01`
      ).startOf('month');
      let endDate = startDate.clone().add(1, 'year').subtract(1, 'day');

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
          'leaveRequestBalances',
          'leaveRequestBalances.type',
          'contactPersonOrganization',
          'contactPersonOrganization.contactPerson',
          'contactPersonOrganization.contactPerson.state',
          'contactPersonOrganization.contactPerson.standardSkillStandardLevels',
          'contactPersonOrganization.contactPerson.standardSkillStandardLevels.standardSkill',
          'contactPersonOrganization.contactPerson.standardSkillStandardLevels.standardLevel',
        ],
        where: {
          active: true,
          createdAt: LessThanOrEqual(endDate.toDate()),
        },
      });

      let employeesAllocations = await manager.find(Employee, {
        relations: [
          'contactPersonOrganization',
          'contactPersonOrganization.contactPerson',
          'contactPersonOrganization.contactPerson.allocations',
          'contactPersonOrganization.contactPerson.allocations.opportunityResource',
          'contactPersonOrganization.contactPerson.allocations.opportunityResource.milestone',
          'contactPersonOrganization.contactPerson.allocations.opportunityResource.milestone.project',
        ],
        where: {
          active: true,
          createdAt: LessThanOrEqual(endDate.toDate()),
        },
      });

      const projectStatuses = ['P', 'C'];

      let _index = 0;
      for (let employee of employees) {
        let ignore = false;
        for (let allocation of employeesAllocations[_index]
          .contactPersonOrganization.contactPerson.allocations) {
          let position = allocation.opportunityResource;

          if (!position) continue;

          let milestone = position.milestone;

          if (!milestone) continue;

          let project = milestone.project;

          if (!project) continue;

          if (!projectStatuses.includes(project.status)) continue;

          if (
            queryExcludeWorkId.length &&
            queryExcludeWorkId.includes(project.id)
          ) {
            continue;
          }

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

        if (ignore) {
          ignoreIds.push(employee.id);
        }

        _index++;
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
      let queryBookingType = this._customQueryParser(
        req.query.bookingType as string
      );
      let queryWorkStatus = this._customQueryParser(
        req.query.workStatus as string
      );
      let queryWorkType = this._customQueryParser(req.query.workType as string);
      let queryContactPersonId = this._customQueryParser(
        req.query.contactPersonId as string
      );
      let queryWorkId = this._customQueryParser(req.query.workId as string);

      let queryExcludeWorkId = this._customQueryParser(
        req.query.excludeWorkId as string
      );

      let queryWorkPhase = this._customQueryParser(
        req.query.workPhase as string
      );
      let queryOrganizationId = this._customQueryParser(
        req.query.organizationId as string
      );

      let currentMoment = moment();
      let startDate = moment(
        `${getFiscalYear(currentMoment)}-${
          process.env.FISCAL_YEAR_START ?? '07'
        }-01`
      ).startOf('month');
      let endDate = startDate.clone().add(1, 'year').subtract(1, 'day');

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
        workStatus: String;
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

        if (
          queryWorkPhase.length &&
          !queryWorkPhase.includes(work.phase ? 1 : 0)
        ) {
          continue;
        }

        if (queryWorkId.length && !queryWorkId.includes(work.id)) {
          continue;
        }

        if (queryExcludeWorkId.length && queryExcludeWorkId.includes(work.id)) {
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
            let bookingType = 3;

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

              if (
                queryBookingType.length &&
                !queryBookingType.includes(bookingType)
              ) {
                continue;
              }

              allocations.push({
                workType: workStatus ? 'Project' : 'Opportunity',
                title: work.title,
                workStatus: parseWorkStatus(work.phase),
                organization: work.organization.title,
                milestone: work.type == 1 ? milestone.title : '-',
                position: position.title ?? '-',
                skill: position.panelSkill.standardSkill.label,
                skillLevel:
                  position.panelSkillStandardLevel.standardLevel.label,
                name: '-',
                resourceType: '-',
                employmentType: '-',
                bookingType: parseBookingType(bookingType),
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

              bookingType = 0;
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

              if (
                queryBookingType.length &&
                !queryBookingType.includes(bookingType)
              ) {
                continue;
              }

              allocations.push({
                workType: workStatus ? 'Project' : 'Opportunity',
                title: work.title,
                workStatus: parseWorkStatus(work.phase),
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
      let queryBookingType = this._customQueryParser(
        req.query.bookingType as string
      );
      let queryWorkStatus = this._customQueryParser(
        req.query.workStatus as string
      );
      let queryWorkType = this._customQueryParser(req.query.workType as string);
      let queryContactPersonId = this._customQueryParser(
        req.query.contactPersonId as string
      );
      let queryWorkId = this._customQueryParser(req.query.workId as string);

      let queryExcludeWorkId = this._customQueryParser(
        req.query.excludeWorkId as string
      );

      let queryWorkPhase = this._customQueryParser(
        req.query.workPhase as string
      );

      let queryOrganizationId = this._customQueryParser(
        req.query.organizationId as string
      );

      let currentMoment = moment();
      let startDate = moment(
        `${getFiscalYear(currentMoment)}-${
          process.env.FISCAL_YEAR_START ?? '07'
        }-01`
      ).startOf('month');
      let endDate = startDate.clone().add(1, 'year').subtract(1, 'day');

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
        workStatus: string;
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
        let bookingType = 3;

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

          if (
            queryBookingType.length &&
            !queryBookingType.includes(bookingType)
          ) {
            continue;
          }

          //ignoring inner loop queries
          if (
            queryWorkId.length ||
            queryExcludeWorkId ||
            queryOrganizationId.length ||
            queryWorkStatus.length ||
            queryWorkType.length ||
            queryResourceType.length ||
            querySkillId.length ||
            queryLevelId.length ||
            queryWorkPhase
          ) {
            continue;
          }

          allocations.push({
            name: employee.getFullName,
            resourceType: parseResourceType(resourceType),
            employmentType: parseContractType(employmentType),
            bookingType: parseBookingType(bookingType),
            workType: '-',
            title: '-',
            workStatus: '-',
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
            queryExcludeWorkId.length &&
            queryExcludeWorkId.includes(work.id)
          ) {
            continue;
          }

          if (
            queryWorkPhase.length &&
            !queryWorkPhase.includes(work.phase ? 1 : 0)
          ) {
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

          bookingType = allocation.isMarkedAsSelected ? 2 : 0;

          if (
            queryBookingType.length &&
            !queryBookingType.includes(resourceType)
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
            workStatus: parseWorkStatus(work.phase),
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

  async projectRevnueAnalysis(req: Request, res: Response, next: NextFunction) {
    let fiscalYearStart = req.query.fiscalYearStart as string;
    let fiscalYearEnd = req.query.fiscalYearEnd as string;
    // let projectId = this._customQueryParser(req.query.projectId as string);
    let projectId = req.query.projectId as string;
    let excludeProjectId = req.query.excludeProjectId as string;
    // let organizationId = this._customQueryParser(req.query.organizationId as string);
    let organizationId = req.query.organizationId as string;
    let projectFilter = projectId
      ? `AND profit_view.project_id IN (${projectId})`
      : '';
    let excludeProjectFilter = excludeProjectId
      ? `AND profit_view.project_id NOT IN (${excludeProjectId})`
      : '';
    let organizationFilter = organizationId
      ? `AND project_organization_id IN (${organizationId})`
      : '';

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
    /*********
           * I don't know how this fiscal year project getting me correct data ... need to fix
           * solution
              ((start_date  BETWEEN STR_TO_DATE('2022-07-01' ,'%Y-%m-%d') AND STR_TO_DATE('2023-06-30' ,'%Y-%m-%d')) OR 
              (end_date  BETWEEN STR_TO_DATE('2022-07-01' ,'%Y-%m-%d') AND STR_TO_DATE('2023-06-30' ,'%Y-%m-%d')) OR 
              (start_date  <= STR_TO_DATE('2022-07-01' ,'%Y-%m-%d') AND end_date  >= STR_TO_DATE('2023-06-30' ,'%Y-%m-%d')))
           **************/

    let actualStatement: any = {};
    actual.forEach((el: any) => {
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
        //don't need buy rate for now... if it needed will uncoment this
        // [el.month]: {
        //   monthTotalBuy: el.month_total_buy,
        //   monthTotalSell: el.month_total_sell,
        // },
        [el.month]: el.month_total_sell,
        totalSell:
          (actualStatement?.[el.project_id]?.['totalSell'] ?? 0) +
          el.month_total_sell,
        totalBuy:
          (actualStatement?.[el.project_id]?.['totalBuy'] ?? 0) +
          el.month_total_buy,
        YTDTotalSell: moment(el.month, 'MMM YY').isBetween(
          fiscalYearStart,
          fiscalYearEnd,
          'month',
          '[]'
        )
          ? (actualStatement?.[el.project_id]?.['YTDTotalSell'] ?? 0) +
            el.month_total_sell
          : actualStatement?.[el.project_id]?.['YTDTotalSell'] ?? 0,
      };
    });

    res.status(200).json({
      success: true,
      message: 'Project Revenue Analysis',
      data: Object.values(actualStatement),
    });
  }

  async clientRevnueAnalysis(req: Request, res: Response, next: NextFunction) {
    let fiscalYearStart = req.query.fiscalYearStart as string;
    let fiscalYearEnd = req.query.fiscalYearEnd as string;

    let organizationId = req.query.organizationId as string;
    let excludeOrganizationId = req.query.excludeOrganizationId as string;

    let organizationFilter = organizationId
      ? `AND project_organization_id IN (${organizationId})`
      : '';
    let excludeOrganizationFilter = excludeOrganizationId
      ? `AND profit_view.project_organization_id NOT IN (${excludeOrganizationId})`
      : '';

    const actual = await getManager().query(`
      SELECT 
        project_type,
        project_amount,
        profit_view.project_id,
        project_organization_id,
        project_organization_name,
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
        ${organizationFilter} ${excludeOrganizationFilter} 

        GROUP BY project_organization_id, profit_view.project_id, month 
    `);
    let actualStatement: any = {};
    let projectsValues: any = {};

    actual.forEach((el: any) => {
      actualStatement[el.project_organization_id] = {
        ...(actualStatement?.[el.project_organization_id] ?? {
          organizationId: el.project_organization_id,
          organizationName: el.project_organization_name,
          projectType: el.project_type,
        }),
        //don't need buy rate for now... if it needed will uncoment this
        // [el.month]: {
        //   monthTotalBuy: (actualStatement?.[el.project_organization_id]?.[el.month]?.['monthTotalBuy'] ??0) + el.month_total_buy,
        //   monthTotalSell: (actualStatement?.[el.project_organization_id]?.[el.month]?.['monthTotalSell'] ??0) + el.month_total_sell,
        // },
        [el.month]:
          (actualStatement?.[el.project_organization_id]?.[el.month] ?? 0) +
          el.month_total_sell,

        totalSell:
          (actualStatement?.[el.project_organization_id]?.['totalSell'] ?? 0) +
          el.month_total_sell,
        totalBuy:
          (actualStatement?.[el.project_organization_id]?.['totalBuy'] ?? 0) +
          el.month_total_buy,

        projectsValue: projectsValues?.[el.project_organization_id]?.[
          el.project_id
        ]
          ? actualStatement?.[el.project_organization_id]?.['projectsValue'] ??
            0
          : (actualStatement?.[el.project_organization_id]?.['projectsValue'] ??
              0) + el.project_amount,

        YTDTotalSell: moment(el.month, 'MMM YY').isBetween(
          fiscalYearStart,
          fiscalYearEnd,
          'month',
          '[]'
        )
          ? (actualStatement?.[el.project_organization_id]?.['YTDTotalSell'] ??
              0) + el.month_total_sell
          : actualStatement?.[el.project_organization_id]?.['YTDTotalSell'] ??
            0,
      };
      //sum of all projectValues
      projectsValues = {
        ...projectsValues,
        [el.project_organization_id]: {
          ...(projectsValues[el.project_organization_id] ?? {}),
          [el.project_id]: true,
        },
      };
    });

    res.status(200).json({
      success: true,
      message: 'Project Revenue Analysis',
      data: Object.values(actualStatement),
    });
  }

  async timesheetSummary(req: Request, res: Response, next: NextFunction) {
    //STATUS IN MONTHS SUBMITTED APPROVED NOT SUBMITTED NOT APPLICABLE
    try {
      const manager = getManager();

      let queryStartDate = req.query.startDate as string;
      let queryEndDate = req.query.endDate as string;
      let queryCurrentDate = req.query.currentDate as string;

      let queryEmployeeId = this._customQueryParser(
        req.query.employeeId as string
      );
      let queryExcludeEmployeeId = this._customQueryParser(
        req.query.excludeEmployeeId as string
      );

      let queryProjectId = this._customQueryParser(
        req.query.projectId as string
      );
      let queryExcludeProjectId = this._customQueryParser(
        req.query.excludeProjectId as string
      );

      let queryOrgId = this._customQueryParser(
        req.query.organizationId as string
      );
      let queryExcludeOrgId = this._customQueryParser(
        req.query.excludeOrganizationId as string
      );

      let queryStatus = this._customQueryParser(req.query.status as string);

      let currentMoment = moment();

      if (queryCurrentDate) {
        if (moment(queryCurrentDate).isValid()) {
          currentMoment = moment(queryCurrentDate);
        }
      }

      let startDate = moment(
        `${getFiscalYear(currentMoment)}-${
          process.env.FISCAL_YEAR_START ?? '07'
        }-01`
      ).startOf('month');
      let endDate = startDate.clone().add(1, 'year').subtract(1, 'day');

      let currentStartOfMonth = currentMoment.startOf('month');
      let currentEndOfMonth = currentMoment.endOf('month');

      let employeeProjectIndexes: { [key: string]: number } = {};

      const employees = await manager.find(Employee, {
        relations: [
          'contactPersonOrganization',
          'contactPersonOrganization.contactPerson',
          'contactPersonOrganization.contactPerson.allocations',
          'contactPersonOrganization.contactPerson.allocations.opportunityResource',
          'contactPersonOrganization.contactPerson.allocations.opportunityResource.milestone',
          'contactPersonOrganization.contactPerson.allocations.opportunityResource.milestone.project',
          'contactPersonOrganization.contactPerson.allocations.opportunityResource.milestone.project.organization',
          'employmentContracts',
        ],
        where: { active: true },
      });

      const employeeTimesheets = await manager.find(Employee, {
        relations: [
          'timesheets',
          'timesheets.milestoneEntries',
          'timesheets.milestoneEntries.milestone',
          'timesheets.milestoneEntries.milestone.project',
          'timesheets.milestoneEntries.milestone.project.organization',
          'timesheets.milestoneEntries.entries',
        ],
        where: { active: true },
      });

      const purchaseOrders = await manager.find(PurchaseOrder, {
        where: [
          {
            issueDate: Between(
              currentStartOfMonth.toDate(),
              currentEndOfMonth.toDate()
            ),
          },
          {
            expiryDate: Between(
              currentStartOfMonth.toDate(),
              currentEndOfMonth.toDate()
            ),
          },
          {
            issueDate: LessThanOrEqual(currentStartOfMonth.toDate()),
            expiryDate: MoreThanOrEqual(currentEndOfMonth.toDate()),
          },
        ],
      });

      let projectPurchaseOrders: { [key: number]: PurchaseOrder } = {};

      for (let purchaseOrder of purchaseOrders) {
        projectPurchaseOrders[purchaseOrder.projectId] = purchaseOrder;
      }

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

      interface MonthInterface {
        [key: string]: {
          filteredHours: number;
          status: TimesheetSummaryStatus;
        };
      }

      let months: MonthInterface = {};

      let projectData: {
        [key: string]: {
          id: number;
          title: String;
          type: number;
          organization: string;
          organizationId: number;
        };
      } = {};

      let startDateClone = startDate.clone();

      while (
        endDate > startDateClone ||
        startDateClone.format('M') === endDate.format('M')
      ) {
        months[startDateClone.format('MMM YY')] = {
          filteredHours: 0,
          status: 0,
        };

        startDateClone.add(1, 'month');
      }

      let summary: {
        employeeName: string;
        employeeCode: number;
        projectName: String;
        projectCode: number;
        projectType: number;
        purchaseOrder: number | null;
        organizationName: string;
        months: MonthInterface;
        currentMonth: number;
        currentYear: number;
      }[] = [];

      let _index = 0;
      for (let employee of employees) {
        if (queryEmployeeId.length && !queryEmployeeId.includes(employee.id)) {
          _index++;
          continue;
        }

        if (
          queryExcludeEmployeeId.length &&
          queryExcludeEmployeeId.includes(employee.id)
        ) {
          _index++;
          continue;
        }

        let employeeAllocations: { [key: string]: { [key: string]: boolean } } =
          {};

        for (let allocation of employee.contactPersonOrganization.contactPerson
          .allocations) {
          let project = allocation.opportunityResource?.milestone?.project;

          if (!project) continue;

          if (!projectData['project.id'])
            projectData[project.id] = {
              id: project.id,
              title: project.title,
              type: project.type,
              organization: project.organization.name,
              organizationId: project.organization.id,
            };

          let { startDate: allocationStartDate, endDate: allocationEndDate } =
            allocation.opportunityResource;

          let mAllocationStartDate = moment(allocationStartDate);
          let mAllocationEndDate = moment(allocationEndDate);

          let mAllocationStartDateClone = mAllocationStartDate.clone();

          while (mAllocationEndDate > mAllocationStartDateClone) {
            if (
              !mAllocationStartDateClone.isBetween(
                startDate,
                endDate,
                'date',
                '[]'
              )
            ) {
              mAllocationStartDateClone.add(1, 'month');
              continue;
            }

            if (!employeeAllocations[project.id])
              employeeAllocations[project.id] = {};

            if (
              !employeeAllocations[project.id][
                mAllocationStartDateClone.format('MMM YY')
              ]
            ) {
              employeeAllocations[project.id][
                mAllocationStartDateClone.format('MMM YY')
              ] = true;
            }

            mAllocationStartDateClone.add(1, 'month');
          }
        }

        for (let timesheet of employeeTimesheets[_index].timesheets) {
          if (
            !moment(timesheet.startDate).isBetween(
              startDate,
              endDate,
              'date',
              '[]'
            ) ||
            !moment(timesheet.endDate).isBetween(
              startDate,
              endDate,
              'date',
              '[]'
            )
          )
            continue;

          let project: Opportunity | null = null;

          for (let milestoneEntry of timesheet.milestoneEntries) {
            let localMonths: MonthInterface = JSON.parse(
              JSON.stringify(months)
            );

            project = milestoneEntry.milestone.project;

            if (!project) continue;

            if (queryProjectId.length && !queryProjectId.includes(project.id))
              continue;

            if (
              queryExcludeProjectId.length &&
              queryExcludeProjectId.includes(project.id)
            )
              continue;

            if (
              queryOrgId.length &&
              !queryOrgId.includes(project.organization.id)
            )
              continue;

            if (
              queryExcludeOrgId.length &&
              queryExcludeOrgId.includes(project.organization.id)
            )
              continue;

            let sumOfHours = 0;

            if (
              employeeProjectIndexes[`${employee.id}_${project.id}`] !==
              undefined
            ) {
              for (let entry of milestoneEntry.entries) {
                // if (!entry.submittedAt) continue;

                const entryDate = moment(entry.date, 'DD-MM-YYYY').format(
                  'MMM YY'
                );

                //NOT APPLICABLE
                let summaryStatus = TimesheetSummaryStatus.NOT_APPLICABLE;

                if (!employeeAllocations[project.id]) continue;

                //NOT APPLICABLE, NOT SUBMITTED, SUBMITTED, APPROVED,
                if (employeeAllocations[project.id][entryDate]) {
                  //NOT SUBMITTED;
                  summaryStatus = TimesheetSummaryStatus.NOT_SUBMITTED;
                  employeeAllocations[project.id][entryDate] = false;
                }

                let entryHours = parseFloat(entry.hours.toFixed(2));
                let filteredHours = 0;

                if (queryStatus.length) {
                  if (
                    queryStatus.includes(
                      TimesheetSummaryStatus.NOT_SUBMITTED
                    ) &&
                    !entry.submittedAt &&
                    !entry.rejectedAt &&
                    !entry.approvedAt
                  ) {
                    filteredHours += entryHours;
                  }
                  if (
                    queryStatus.includes(TimesheetSummaryStatus.SUBMITTED) &&
                    entry.submittedAt &&
                    !entry.rejectedAt &&
                    !entry.approvedAt
                  ) {
                    filteredHours += entryHours;
                  }
                  if (
                    queryStatus.includes(TimesheetSummaryStatus.APPROVED) &&
                    entry.approvedAt
                  ) {
                    filteredHours += entryHours;
                  }
                  if (
                    queryStatus.includes(TimesheetSummaryStatus.REJECTED) &&
                    entry.rejectedAt
                  ) {
                    filteredHours += entryHours;
                  }
                } else {
                  if (
                    entry.submittedAt &&
                    !entry.rejectedAt &&
                    !entry.approvedAt
                  )
                    filteredHours += entryHours;
                }

                summary[
                  employeeProjectIndexes[`${employee.id}_${project.id}`]
                ].months[entryDate].filteredHours += filteredHours;
                sumOfHours += filteredHours;
                //SAVED
                if (
                  !entry.submittedAt &&
                  !entry.rejectedAt &&
                  !entry.approvedAt
                ) {
                  summaryStatus = TimesheetSummaryStatus.NOT_SUBMITTED;
                }

                //SUBMITTED
                if (
                  entry.submittedAt &&
                  !entry.rejectedAt &&
                  !entry.approvedAt
                ) {
                  summaryStatus = TimesheetSummaryStatus.SUBMITTED;
                }

                //APPROVED
                if (entry.approvedAt) {
                  summaryStatus = TimesheetSummaryStatus.APPROVED;
                }

                //REJECTED
                if (entry.rejectedAt) {
                  summaryStatus = TimesheetSummaryStatus.REJECTED;
                }

                summary[
                  employeeProjectIndexes[`${employee.id}_${project.id}`]
                ].months[entryDate].status = summaryStatus;
              }

              summary[
                employeeProjectIndexes[`${employee.id}_${project.id}`]
              ].currentMonth =
                summary[
                  employeeProjectIndexes[`${employee.id}_${project.id}`]
                ].months[moment(currentMoment).format('MMM YY')].filteredHours;

              summary[
                employeeProjectIndexes[`${employee.id}_${project.id}`]
              ].currentYear += sumOfHours;
            } else {
              for (let entry of milestoneEntry.entries) {
                const entryDate = moment(entry.date, 'DD-MM-YYYY').format(
                  'MMM YY'
                );

                //NOT APPLICABLE
                let summaryStatus = TimesheetSummaryStatus.NOT_APPLICABLE;

                //NOT APPLICABLE, NOT SUBMITTED, SUBMITTED, APPROVED,
                if (employeeAllocations[project.id][entryDate]) {
                  //NOT SUBMITTED;
                  summaryStatus = TimesheetSummaryStatus.SUBMITTED;
                  employeeAllocations[project.id][entryDate] = false;
                }

                let entryHours = parseFloat(entry.hours.toFixed(2));

                let filteredHours = 0;

                if (queryStatus.length) {
                  if (
                    queryStatus.includes(
                      TimesheetSummaryStatus.NOT_SUBMITTED
                    ) &&
                    !entry.submittedAt &&
                    !entry.rejectedAt &&
                    !entry.approvedAt
                  ) {
                    filteredHours += entryHours;
                  }
                  if (
                    queryStatus.includes(TimesheetSummaryStatus.SUBMITTED) &&
                    entry.submittedAt &&
                    !entry.rejectedAt &&
                    !entry.approvedAt
                  ) {
                    filteredHours += entryHours;
                  }
                  if (
                    queryStatus.includes(TimesheetSummaryStatus.APPROVED) &&
                    entry.approvedAt
                  ) {
                    filteredHours += entryHours;
                  }
                  if (
                    queryStatus.includes(TimesheetSummaryStatus.REJECTED) &&
                    entry.rejectedAt
                  ) {
                    filteredHours += entryHours;
                  }
                } else {
                  if (
                    entry.submittedAt &&
                    !entry.rejectedAt &&
                    !entry.approvedAt
                  )
                    filteredHours += entryHours;
                }

                sumOfHours += filteredHours;
                localMonths[entryDate].filteredHours += filteredHours;

                //NOT SUBMITTED
                if (
                  !entry.submittedAt &&
                  !entry.rejectedAt &&
                  !entry.approvedAt
                ) {
                  summaryStatus = TimesheetSummaryStatus.NOT_SUBMITTED;
                }

                //SUBMITTED
                if (
                  entry.submittedAt &&
                  !entry.rejectedAt &&
                  !entry.approvedAt
                ) {
                  summaryStatus = TimesheetSummaryStatus.SUBMITTED;
                }

                //APPROVED
                if (entry.approvedAt) {
                  summaryStatus = TimesheetSummaryStatus.APPROVED;
                }

                //REJECTED
                if (entry.approvedAt) {
                  summaryStatus = TimesheetSummaryStatus.REJECTED;
                }

                localMonths[entryDate].status = summaryStatus;
              }

              employeeProjectIndexes[`${employee.id}_${project.id}`] =
                summary.length;

              summary.push({
                employeeName: employee.getFullName,
                employeeCode: employee.id,
                projectName: project.title,
                projectCode: project.id,
                projectType: project.type,
                purchaseOrder: projectPurchaseOrders[project.id]?.id ?? null,
                organizationName: project.organization.name,
                months: localMonths,
                currentMonth:
                  localMonths[moment(currentMoment).format('MMM YY')]
                    .filteredHours ?? 0,
                currentYear: sumOfHours,
              });
            }
          }
        }

        for (let allocationProject in employeeAllocations) {
          let localMonths: MonthInterface = JSON.parse(JSON.stringify(months));

          let _partialTrue: Boolean = false;
          let _fullTrue: Boolean = true;
          let _partiallyTrueMonths: Array<string> = [];

          for (let allocationMonth in employeeAllocations[allocationProject]) {
            let status =
              employeeAllocations[allocationProject][allocationMonth];

            if (status) {
              _partiallyTrueMonths.push(allocationMonth);
              _partialTrue = true;
            }

            if (!status) _fullTrue = false;
          }

          if (_fullTrue) {
            let project = projectData[allocationProject];

            if (queryProjectId.length && !queryProjectId.includes(project.id))
              continue;

            if (
              queryExcludeProjectId.length &&
              queryExcludeProjectId.includes(project.id)
            )
              continue;

            if (
              queryOrgId.length &&
              !queryOrgId.includes(project.organizationId)
            )
              continue;
            if (
              queryExcludeOrgId.length &&
              queryExcludeOrgId.includes(project.organizationId)
            )
              continue;

            employeeProjectIndexes[`${employee.id}_${project.id}`] =
              summary.length;
            summary.push({
              employeeName: employee.getFullName,
              employeeCode: employee.id,
              projectName: project.title,
              projectCode: project.id,
              projectType: project.type,
              purchaseOrder: projectPurchaseOrders[project.id]?.id ?? null,
              organizationName: project.organization,
              months: localMonths,
              currentMonth: 0,
              currentYear: 0,
            });
          }

          if (_partialTrue) {
            for (let changeMonth of _partiallyTrueMonths) {
              summary[
                employeeProjectIndexes[
                  `${employee.id}_${projectData[allocationProject].id}`
                ]
              ].months[changeMonth].status =
                TimesheetSummaryStatus.NOT_SUBMITTED;
            }
          }
        }

        _index++;
      }

      let milestoneProjectSummary: any = [];
      let timeProjectSummary: any = [];
      let milestoneProjectTotalHours = 0;
      let timeProjectTotalHours = 0;

      summary.forEach((summ) => {
        if (summ.projectType === 1) {
          for (let month in summ.months) {
            if (queryStatus.length) {
              if (
                queryStatus.includes(summ.months[month].status) &&
                summ.months[month].status !==
                  TimesheetSummaryStatus.NOT_APPLICABLE
              ) {
                (summ.months[month] as any) = summ.months[month].filteredHours;
              } else if (
                summ.months[month].status ===
                TimesheetSummaryStatus.NOT_APPLICABLE
              ) {
                (summ.months[month] as any) = 'N/A';
              } else {
                (summ.months[month] as any) = '-';
              }
            } else {
              if (
                summ.months[month].status ===
                  TimesheetSummaryStatus.SUBMITTED &&
                summ.months[month].status !==
                  TimesheetSummaryStatus.NOT_APPLICABLE
              ) {
                (summ.months[month] as any) = summ.months[month].filteredHours;
              } else if (
                summ.months[month].status ===
                TimesheetSummaryStatus.NOT_APPLICABLE
              ) {
                (summ.months[month] as any) = 'N/A';
              } else {
                (summ.months[month] as any) = '-';
              }
            }
          }
          milestoneProjectTotalHours += summ.currentYear;
          milestoneProjectSummary.push(summ);
        } else if (summ.projectType === 2) {
          for (let month in summ.months) {
            if (queryStatus.length) {
              if (queryStatus.includes(summ.months[month].status)) {
                (summ.months[month] as any) = summ.months[month].filteredHours;
              } else {
                (summ.months[month] as any) = '-';
              }
            } else {
              if (
                summ.months[month].status === TimesheetSummaryStatus.SUBMITTED
              ) {
                (summ.months[month] as any) = summ.months[month].filteredHours;
              } else {
                (summ.months[month] as any) = '-';
              }
            }
          }
          timeProjectTotalHours += summ.currentYear;
          timeProjectSummary.push(summ);
        }
      });

      res.status(200).json({
        success: true,
        message: 'Timesheet Summary',
        data: {
          milestoneProjectSummary,
          timeProjectSummary,
          milestoneProjectTotalHours,
          timeProjectTotalHours,
        },
      });
    } catch (e) {
      next(e);
    }
  }

  async leaveRequestSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const manager = getManager();

      let queryStartDate = req.query.startDate as string;
      let queryEndDate = req.query.endDate as string;

      let queryEmployeeId = this._customQueryParser(
        req.query.employeeId as string
      );
      let queryProjectId = this._customQueryParser(
        req.query.projectId as string
      );
      let queryLeaveType = this._customQueryParser(
        req.query.leaveType as string
      );

      let employees = await manager.find(Employee, {
        relations: [
          'contactPersonOrganization',
          'contactPersonOrganization.contactPerson',
          'employmentContracts',
          'leaveRequests',
          'leaveRequests.entries',
          'leaveRequests.work',
          'leaveRequests.type',
        ],
        where: { active: true },
      });

      let startDate = moment().startOf('month');
      let endDate = moment().endOf('month');

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

      interface SummaryInterface {
        employeeName: string;
        employeeCode: number;

        hours: number;
        leaveRequests: {
          projectName: String;
          projectCode: number | null;
          leaveType: string;
          hours: number;
        }[];
      }

      let summary: SummaryInterface[] = [];

      for (let employee of employees) {
        if (queryEmployeeId.length && !queryEmployeeId.includes(employee.id))
          continue;

        let summaryObj: SummaryInterface = {
          employeeCode: employee.id,
          employeeName: employee.getFullName,
          hours: 0,
          leaveRequests: [],
        };

        for (let leaveRequest of employee.leaveRequests) {
          if (
            queryProjectId.length &&
            !queryProjectId.includes(leaveRequest.work?.id ?? 0)
          )
            continue;

          if (
            queryLeaveType.length &&
            !queryLeaveType.includes(leaveRequest.type?.id ?? 0)
          )
            continue;

          let leaveRequestTotalHours = parseFloat(
            leaveRequest.getEntriesDetails.totalHours.toFixed(2)
          );

          summaryObj.leaveRequests.push({
            projectCode: leaveRequest.workId,
            projectName: leaveRequest.work?.title ?? '-',
            leaveType: leaveRequest.type?.label ?? 'Unpaid',
            hours: leaveRequestTotalHours,
          });
          summaryObj.hours += leaveRequestTotalHours;
        }

        summary.push(summaryObj);
      }

      res.status(200).json({
        success: true,
        message: 'Leave Request Summary',
        data: summary,
      });
    } catch (e) {
      next(e);
    }
  }

  async leaveRequestSummaryView(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const manager = getManager();

      let queryStartDate = req.query.startDate as string;
      let queryEndDate = req.query.endDate as string;
      let queryProjectId = req.query.projectId as string;
      let queryLeaveTypeId = req.query.leaveTypeId as string;
      let queryContactPersonId = req.query.contactPersonId as string;
      let queryleaveStatus = req.query.leaveStatus as string;

      let startDate =
        queryStartDate ?? moment().startOf('month').format('YYYY-MM-DD');
      let endDate =
        queryEndDate ?? moment().endOf('month').format('YYYY-MM-DD');

      let projectFilter = queryProjectId
        ? `AND project_id IN (${queryProjectId})`
        : '';

      let leaveTypeFilter = queryLeaveTypeId
        ? `AND leave_type_id IN (${queryLeaveTypeId})`
        : '';

      let contactPersonFilter = queryContactPersonId
        ? `AND contact_person_id IN (${queryContactPersonId})`
        : '';

      let leaveStatusFilter = queryleaveStatus
        ? `AND leave_status_index IN (${queryleaveStatus})`
        : '';

      const leave_requests = await manager.query(`
      SELECT 
        leave_request_id,
        leave_status,
        leave_status_index,
        leave_type_id,
        leave_type_name,
        contact_person_id,
        employee_id,
        employee_name,
        project_id,
        project_title,
        CAST(sum(leave_entry_hours) AS DECIMAL(32,4)) total_request_hours,
        MIN(leave_entry_date) start_leave_date,
        MAX(leave_entry_date) end_leave_date
      
        FROM leaves_view 
        WHERE leave_entry_date >= STR_TO_DATE('${startDate}' ,'%Y-%m-%d')
          AND leave_entry_date <= STR_TO_DATE('${endDate}' ,'%Y-%m-%d')
          ${projectFilter} ${leaveTypeFilter} ${contactPersonFilter} ${leaveStatusFilter}
      GROUP BY employee_id, leave_request_id
      `);

      interface SummaryInterface {
        employeeName: string;
        employeeCode: number;
        totalHours: number;

        leaveRequests: {
          projectCode: number | null;
          hours: number;
          leaveRequestId: number;
          leaveStatus: string;
          leaveTypeId: number;
          leaveType: string;
          projectId: number;
          startDate: Moment;
          endDate: Moment;
          projectTitle: string;
        }[];
      }

      // let summary: SummaryInterface[] = [];
      let summary: { [key: string]: SummaryInterface } = {};
      leave_requests.forEach((request: any) => {
        summary[request.employee_id] = {
          employeeName: request.employee_name,
          employeeCode: request.employee_id,
          totalHours:
            (summary?.[request.employee_id]?.['totalHours'] ?? 0) +
            parseFloat(request.total_request_hours),
          leaveRequests: [
            ...(summary?.[request.employee_id]?.['leaveRequests'] || []),
            {
              projectTitle: request.project_title,
              projectCode: request.project_id,
              leaveTypeId: request.leave_type_id,
              leaveType: request.leave_type_name,
              hours: request.total_request_hours,
              leaveRequestId: request.leave_request_id,
              leaveStatus: request.leave_status,
              projectId: request.project_id,
              startDate: moment(request.start_leave_date),
              endDate: moment(request.end_leave_date),
            },
          ],
        };
      });

      res.status(200).json({
        success: true,
        message: 'Leave Request Summary',
        data: Object.values(summary),
      });
    } catch (e) {
      next(e);
    }
  }

  async WorkInHandForecast(req: Request, res: Response, next: NextFunction) {
    let fiscalYearStart = req.query.fiscalYearStart as string;
    let fiscalYearEnd = req.query.fiscalYearEnd as string;
    let currentMonthStart = moment().date(1).format('YYYY-MM-DD');
    let acutalMonthEnd = moment()
      .subtract(1, 'months')
      .endOf('month')
      .format('YYYY-MM-DD');
    console.log({ currentMonthStart, acutalMonthEnd });

    const actual_revenue = await getManager().query(`
      SELECT 
        project_type,
        project_amount,
        
        (CASE WHEN project_type = 2 
          THEN 
            SUM( resource_selling_rate * actual_hours ) 
          ELSE 
            project_schedule_segments.amount 
          END )
        month_total_sell, 
        
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
        GROUP BY project_type, month

    `);

    const forecast_revenue = await getManager().query(`
      SELECT 
        month_total_buy,
        time_base.project_type,
        month,
        (CASE WHEN project_type = 2 
          THEN 
              time_base.month_total_sell
          ELSE 
            SUM(project_schedule_segments.amount)
          END ) month_total_sell
      FROM (SELECT 
        SUM(cost_rate)  month_total_buy, 
        SUM(revenue_rate) month_total_sell, 
        project_type, 
        calendar_date,
        DATE_FORMAT(STR_TO_DATE(calendar_view_filtered.calendar_date,'%Y-%m-%d'), '%b %y') month
    
        From (
            SELECT * FROM calendar_view
                WHERE (calendar_view.calendar_date BETWEEN '${fiscalYearStart}' AND '${fiscalYearEnd}')
                AND is_holidays = 0 AND is_weekday = 1 
            ) as calendar_view_filtered

            LEFT JOIN revenue_cost_view
            ON (
                (calendar_view_filtered.calendar_date BETWEEN 
                DATE_FORMAT(resource_start,'%Y-%m-%d') AND 
                DATE_FORMAT(resource_end,'%Y-%m-%d')
                ) AND
                (calendar_view_filtered.calendar_date BETWEEN 
                DATE_FORMAT(resource_contract_start,'%Y-%m-%d') AND 
                DATE_FORMAT(IFNULL(resource_contract_end, '2049-06-30'),'%Y-%m-%d')
                )
            )
            WHERE NOT EXISTS (
                SELECT start_date, end_date
                FROM project_shutdown_periods
                WHERE CAST(start_date AS DATE) <= calendar_date
                    AND (CAST(end_date AS DATE) >= calendar_date OR end_date IS NULL)
                    AND project_id = revenue_cost_view.project_id
            )
        GROUP BY project_type, month ) as time_base
    
      LEFT JOIN opportunities
        ON opportunities.type = project_type
      LEFT JOIN  project_schedules 
        ON project_schedules.project_id = opportunities.id 
        LEFT JOIN project_schedule_segments
        ON project_schedule_segments.schedule_id = project_schedules.id
        AND (time_base.calendar_date BETWEEN DATE_FORMAT(project_schedule_segments.start_date,'%Y-%m-%d') AND 
        DATE_FORMAT(project_schedule_segments.end_date,'%Y-%m-%d'))
      WHERE project_schedule_segments.deleted_at IS NULL AND project_schedules.deleted_at IS NULL
    GROUP BY project_type, month  
    `);

    const causal_salaries_actual = await getManager().query(`
    SELECT 
      SUM(salary * actual_hours) casual_salaries,
      SUM(salary * (
        SELECT
            SUM(global_variable_values.value/100) 
            FROM global_variable_labels
            JOIN global_variable_values ON global_variable_labels.id = global_variable_values.global_variable_id
        WHERE
            global_variable_labels.name = 'Superannuation'
            AND timers.entry_date BETWEEN global_variable_values.start_date
            AND global_variable_values.end_date)  * actual_hours) casual_superannuation,
      DATE_FORMAT(entry_date, '%b %y') month
    FROM 
      (SELECT
          resource_employee_id,
          resource_contract_start,
          resource_contract_end,
          salary
      FROM
          revenue_cost_view 
      WHERE
          employment_type = 1
          AND (
              project_status = 'P'
              OR project_status = 'C'
          )
      )as revenue_cost_views
    LEFT JOIN (
      SELECT 
          resource_employee_id,
          actual_hours,
          STR_TO_DATE(entry_date,'%e-%m-%Y') entry_date
      FROM profit_view
      WHERE STR_TO_DATE(entry_date,'%e-%m-%Y') BETWEEN '${fiscalYearStart}' AND  '${acutalMonthEnd}' -- need to remove from here
    ) as timers ON (
        revenue_cost_views.resource_employee_id = timers.resource_employee_id AND
        (timers.entry_date BETWEEN  
            DATE_FORMAT(revenue_cost_views.resource_contract_start,'%Y-%m-%d') AND  
            DATE_FORMAT(IFNULL(revenue_cost_views.resource_contract_end, '2049-06-30'),'%Y-%m-%d')
        )
      )
    GROUP BY month;
    `);

    const causal_salaries_forecast = await getManager().query(`
    SELECT SUM(casual_salaries) casual_salaries, SUM(casual_superannuation) casual_superannuation, month
        FROM (SELECT 
          SUM (salary * (resource_contract_hours/resource_contract_days_per_week)) casual_salaries,
          SUM (salary * (resource_contract_hours / resource_contract_days_per_week) * (
            SELECT
                SUM(global_variable_values.value/100) 
            FROM global_variable_labels
                JOIN global_variable_values ON global_variable_labels.id = global_variable_values.global_variable_id
            WHERE
              global_variable_labels.name = 'Superannuation'
              AND calendar_view_filtered.calendar_date BETWEEN global_variable_values.start_date
              AND global_variable_values.end_date
            )
          ) casual_superannuation,
          DATE_FORMAT(STR_TO_DATE(calendar_view_filtered.calendar_date,'%Y-%m-%d'), '%b %y') month 
      From (
        SELECT * FROM calendar_view          -- 'start of this month' '2023-06-30'
        WHERE (calendar_view.calendar_date BETWEEN '${currentMonthStart}' AND '${fiscalYearEnd}')  -- remove SUM from subQuery will qive you 4211.68
        ) as calendar_view_filtered
        LEFT JOIN (
            SELECT * FROM revenue_cost_view 
            WHERE employment_type = 1
        ) as casual_employee
        ON ((calendar_view_filtered.calendar_date BETWEEN  
            DATE_FORMAT(resource_contract_start,'%Y-%m-%d') AND  
            DATE_FORMAT(IFNULL(resource_contract_end, '2049-06-30'),'%Y-%m-%d')
        ))
      WHERE is_holidays = 0 AND is_weekday = 1 
      GROUP BY
          resource_contract_start,
          resource_contract_end,
          resource_employee_id,
          month
      ) as costing
    GROUP BY month;
    `);

    const permanent_salaries = await getManager().query(`
    SELECT month, SUM(salary) permanent_salaries, SUM(superannuation) permanent_superannuation
    FROM (SELECT
      (salary / 12) * (ABS(boh_percent - 100) / 100) salary,
      -- to seperate boh percent for salaries
      (salary / 12) * (ABS(boh_percent - 100) / 100) * (
          SELECT
          SUM(global_variable_values.value / 100)
          FROM
          global_variable_labels
          JOIN global_variable_values ON global_variable_labels.id = global_variable_values.global_variable_id
          WHERE
          global_variable_labels.name = 'Superannuation'
          AND calendar_view_filtered.calendar_date BETWEEN global_variable_values.start_date
          AND global_variable_values.end_date
      ) superannuation,
      DATE_FORMAT( STR_TO_DATE(calendar_view_filtered.calendar_date, '%Y-%m-%d'), '%b %y' ) month -- month wise salary checking contracts end 
      From (SELECT calendar_date
        FROM calendar_view
        WHERE( calendar_view.calendar_date BETWEEN '${fiscalYearStart}' -- '2022-07-01' 
          AND '${fiscalYearEnd}' -- '2023-06-30'  
        ) -- checking for only one fiscal year 
        GROUP BY calendar_view.month -- group by to get only a date for month
        ) as calendar_view_filtered
      LEFT JOIN ( SELECT *
          FROM revenue_cost_view
          WHERE employment_type != 1
      ) as casual_employee -- group by to get only ONE date for month  to check contracts running dates on every month
      ON ( (
        calendar_view_filtered.calendar_date BETWEEN DATE_FORMAT(resource_contract_start, '%Y-%m-%d')
        AND -- JOIN ONLY ON CONTRACT TO AVOID REPEATED ALLOCATIONs
        DATE_FORMAT( IFNULL(resource_contract_end, '2049-06-30'), '%Y-%m-%d' ) 
      ))
    GROUP BY
      resource_contract_start,
      resource_contract_end,
      resource_employee_id,
      month
  ) as costing
  GROUP BY month;
    `);

    const doh_salaries = await getManager().query(`
    SELECT month, SUM(salary) doh_salaries, SUM(superannuation) doh_superannuation
      FROM
        (SELECT 
          salary/12 * (boh_percent)/100 salary ,-- to seperate boh percent for salaries
          (salary/12 * (boh_percent)/100 * (SELECT
            SUM(global_variable_values.value/100) 
              FROM global_variable_labels
              JOIN global_variable_values ON global_variable_labels.id = global_variable_values.global_variable_id
            WHERE
              global_variable_labels.name = 'Superannuation'
              AND calendar_view_filtered.calendar_date BETWEEN global_variable_values.start_date
              AND global_variable_values.end_date
        )) superannuation,
        DATE_FORMAT(STR_TO_DATE(calendar_view_filtered.calendar_date,'%Y-%m-%d'), '%b %y') month -- month wise salary checking contracts end 
          From ( 
            SELECT calendar_date FROM calendar_view       -- '2022-07-01'  '2023-06-31'
              WHERE (calendar_view.calendar_date BETWEEN  '${fiscalYearStart}' AND '${fiscalYearEnd}') -- checking for only one fiscal year 
              GROUP BY calendar_view.month -- group by to get only a date for month
            ) as calendar_view_filtered
    
            LEFT JOIN (
              SELECT * FROM revenue_cost_view 
              WHERE employment_type != 1
            ) as casual_employee -- group by to get only ONE date for month  to check contracts running dates on every month
            ON ((calendar_view_filtered.calendar_date BETWEEN 
                DATE_FORMAT(resource_contract_start,'%Y-%m-%d') AND -- JOIN ONLY ON CONTRACT TO AVOID REPEATED ALLOCATIONs
                DATE_FORMAT(IFNULL(resource_contract_end, '2049-06-30'),'%Y-%m-%d')
              ))
        GROUP BY
          resource_contract_start,
          resource_contract_end,
          resource_employee_id,
          month
        ) as costing
      GROUP BY month;
    `);

    const income_tax = await getManager().query(`
    SELECT 
      income_tax.value/100 income_tax_rate,
      DATE_FORMAT( STR_TO_DATE(calendar_view_filtered.calendar_date, '%Y-%m-%d'), '%b %y' ) month
    FROM 
      (SELECT *  
      FROM calendar_view 
      WHERE( calendar_view.calendar_date BETWEEN '${fiscalYearStart}' -- '2022-07-01' 
                  AND '${fiscalYearEnd}'  -- '2023-06-30'  
          ) -- checking for only one fiscal year )
      ) as calendar_view_filtered
      LEFT JOIN (
          SELECT gvv.start_date, gvv.end_date, gvv.value from global_variable_labels gvl
              JOIN global_variable_values gvv on gvv.global_variable_id = gvl.id
          WHERE gvl.name = "income_tax"        
      ) as income_tax
      ON  (
        calendar_view_filtered.calendar_date BETWEEN 
            DATE_FORMAT(income_tax.start_date, '%Y-%m-%d')
                AND 
            DATE_FORMAT( IFNULL(income_tax.end_date, '2049-06-30'), '%Y-%m-%d' )
      )
    GROUP BY month
    `);

    let length_of_loop = Math.max(
      ...[actual_revenue.length, forecast_revenue.length]
    );

    let data: any = {
      MILESTONE_BASE: { total: 0 },
      TIME_BASE: { total: 0 },
      CASUAL_SALARIES: { total: 0 },
      PERMANENT_SALARIES: { total: 0 },
      DOH_SALARIES: { total: 0 },
      PERMANENT_SUPER: { total: 0 },
      CASUAL_SUPER: { total: 0 },
      DOH_SUPER: { total: 0 },
      TOTAL_REVENUE: { total: 0 },
      TOTAL_COST: { total: 0 },
      TOTAL_DOH: { total: 0 },
      INCOME_TAX_RATES: {},
    };

    for (let i = 0; i < length_of_loop; i++) {
      if (actual_revenue[i]) {
        let { project_type, month, month_total_sell = 0 } = actual_revenue[i];
        if (
          moment(month, 'MMM YY').isBefore(moment(), 'month') &&
          project_type
        ) {
          data[ProjectType[project_type]][month] = parseFloat(month_total_sell);
        }
      }

      if (forecast_revenue[i]) {
        let { project_type, month, month_total_sell = 0 } = forecast_revenue[i];
        if (
          moment(month, 'MMM YY').isSameOrAfter(moment(), 'month') &&
          project_type
        ) {
          data[ProjectType[project_type]][month] = parseFloat(month_total_sell);
        }
      }

      if (causal_salaries_forecast[i]) {
        let {
          month,
          casual_salaries: salary = 0,
          casual_superannuation = 0,
        } = causal_salaries_forecast[i];
        salary ||= 0;
        casual_superannuation ||= 0;
        data['CASUAL_SALARIES'][month] = parseFloat(salary);
        data['CASUAL_SUPER'][month] = parseFloat(casual_superannuation);
      }

      if (causal_salaries_actual[i]) {
        let {
          month,
          casual_salaries: salary = 0,
          casual_superannuation = 0,
        } = causal_salaries_actual[i];
        salary ||= 0;
        casual_superannuation ||= 0;
        data['CASUAL_SALARIES'][month] = parseFloat(salary);
        data['CASUAL_SUPER'][month] = parseFloat(casual_superannuation);
      }

      if (permanent_salaries[i]) {
        let {
          month,
          permanent_salaries: salary = 0,
          permanent_superannuation = 0,
        } = permanent_salaries[i];
        salary ||= 0;
        permanent_superannuation ||= 0;
        data['PERMANENT_SALARIES'][month] = parseFloat(salary);
        data['PERMANENT_SUPER'][month] = parseFloat(permanent_superannuation);
      }

      if (doh_salaries[i]) {
        let {
          month,
          doh_salaries: salary = 0,
          doh_superannuation = 0,
        } = doh_salaries[i];
        data['DOH_SALARIES'][month] = parseFloat(salary);
        data['DOH_SUPER'][month] = parseFloat(doh_superannuation);
      }
      if (income_tax[i]) {
        let { month, income_tax_rate = 0 } = income_tax[i];
        data['INCOME_TAX_RATES'][month] = parseFloat(income_tax_rate);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Work In Hand Forecasting',
      data: data,
    });
  }

  async download(req: Request, res: Response, next: NextFunction) {
    try {
      let name = req.params.name;
      // let response: string = await repository.show(name);
      res.sendFile(path.join(__dirname, `../../public/reports/${name}`));
      // if no timesheet found
      // return res.status(200).json({
      //   success: true,
      //   // message: `Win Opportunity ${req.params.id}`,
      //   message: 'Files Uploaded Succesfully',
      //   data: response,
      // });
    } catch (e) {
      next(e);
    }
  }
}
