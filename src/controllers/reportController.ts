import { Request, Response, NextFunction, query } from 'express';
import { Employee } from '../entities/employee';
import { Between, getManager, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import moment, { Moment } from 'moment';
import {
  buyRateByEmployee,
  getFiscalYear,
  parseBookingType,
  parseContractType,
  parseResourceType,
  parseTimesheetSummaryStatus,
  parseWorkStatus,
} from '../utilities/helperFunctions';
import { StandardSkillStandardLevel } from '../entities/standardSkillStandardLevel';
import { Opportunity } from '../entities/opportunity';
import { PurchaseOrder } from '../entities/purchaseOrder';

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
        YTDTotalSell: (moment(el.month, 'MMM YY').isBetween(
          fiscalYearStart,
          fiscalYearEnd,
          'month',
          '[]'
        )
          ? ((actualStatement?.[el.project_id]?.['YTDTotalSell'] ??
              0) + el.month_total_sell)
          : (actualStatement?.[el.project_id]?.['YTDTotalSell'] ??
            0)),
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
        [el.month]: (actualStatement?.[el.project_organization_id]?.[el.month]?? 0) + el.month_total_sell,

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
      let queryProjectId = this._customQueryParser(
        req.query.projectId as string
      );
      let queryOrgId = this._customQueryParser(
        req.query.organizationId as string
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
          'employmentContracts',
          'timesheets',
          'timesheets.milestoneEntries',
          'timesheets.milestoneEntries.entries',
          'timesheets.milestoneEntries.milestone',
          'timesheets.milestoneEntries.milestone.project',
          'timesheets.milestoneEntries.milestone.project.organization',
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
          startDate: Moment;
          endDate: Moment;
          totalDaysInMonth: number;
          totalHours: number;
          savedHours: number;
          submittedHours: number;
          approvedHours: number;
          rejectedHours: number;
          filteredHours: number;
          status: string;
        };
      }

      let months: MonthInterface = {};

      let startDateClone = startDate.clone();

      while (
        endDate > startDateClone ||
        startDateClone.format('M') === endDate.format('M')
      ) {
        months[startDateClone.format('MMM YY')] = {
          startDate: startDateClone.clone().startOf('month'),
          endDate: startDateClone.clone().endOf('month'),

          totalDaysInMonth: startDateClone.daysInMonth(),
          totalHours: 0,
          savedHours: 0,
          submittedHours: 0,
          approvedHours: 0,
          rejectedHours: 0,
          filteredHours: 0,
          status: 'Not Applicable',
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

      for (let employee of employees) {
        if (queryEmployeeId.length && !queryEmployeeId.includes(employee.id))
          continue;

        let employeeAllocations: { [key: string]: { [key: string]: boolean } } =
          {};

        for (let allocation of employee.contactPersonOrganization.contactPerson
          .allocations) {
          let project = allocation.opportunityResource?.milestone?.project;
          if (!project) continue;

          let { startDate: allocationStartDate, endDate: allocationEndDate } =
            allocation.opportunityResource;

          let mAllocationStartDate = moment(allocationStartDate);
          let mAllocationEndDate = moment(allocationEndDate);

          let mAllocationStartDateClone = mAllocationStartDate.clone();

          while (mAllocationEndDate > mAllocationStartDateClone) {
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

        for (let timesheet of employee.timesheets) {
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
              queryOrgId.length &&
              !queryOrgId.includes(project.organization.id)
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
                let summaryStatus = 0;

                //NOT APPLICABLE, NOT SUBMITTED, SUBMITTED, APPROVED,
                if (employeeAllocations[project.id][entryDate]) {
                  //NOT SUBMITTED;
                  summaryStatus = 1;
                }

                let entryHours = parseFloat(entry.hours.toFixed(2));
                let filteredHours = 0;

                if (queryStatus.length) {
                  if (
                    queryStatus.includes(1) &&
                    !entry.submittedAt &&
                    !entry.rejectedAt &&
                    !entry.approvedAt
                  ) {
                    filteredHours += entryHours;
                  } else if (
                    queryStatus.includes(2) &&
                    entry.submittedAt &&
                    !entry.rejectedAt &&
                    !entry.approvedAt
                  ) {
                    filteredHours += entryHours;
                  } else if (queryStatus.includes(3) && entry.approvedAt) {
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

                summary[
                  employeeProjectIndexes[`${employee.id}_${project.id}`]
                ].months[entryDate].totalHours += entryHours;

                //SAVED
                if (
                  !entry.submittedAt &&
                  !entry.rejectedAt &&
                  !entry.approvedAt
                ) {
                  summary[
                    employeeProjectIndexes[`${employee.id}_${project.id}`]
                  ].months[entryDate].savedHours += entryHours;
                  summaryStatus = 1;
                }

                //SUBMITTED
                if (
                  entry.submittedAt &&
                  !entry.rejectedAt &&
                  !entry.approvedAt
                ) {
                  summary[
                    employeeProjectIndexes[`${employee.id}_${project.id}`]
                  ].months[entryDate].submittedHours += entryHours;
                  summaryStatus = 2;
                }

                //APPROVED
                if (entry.approvedAt) {
                  summary[
                    employeeProjectIndexes[`${employee.id}_${project.id}`]
                  ].months[entryDate].approvedHours += entryHours;
                  summaryStatus = 3;
                }

                //REJECTED
                if (entry.rejectedAt) {
                  summary[
                    employeeProjectIndexes[`${employee.id}_${project.id}`]
                  ].months[entryDate].rejectedHours += entryHours;
                  summaryStatus = 1;
                }

                summary[
                  employeeProjectIndexes[`${employee.id}_${project.id}`]
                ].months[entryDate].status =
                  parseTimesheetSummaryStatus(summaryStatus);
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
                let summaryStatus = 0;

                //NOT APPLICABLE, NOT SUBMITTED, SUBMITTED, APPROVED,
                if (employeeAllocations[project.id][entryDate]) {
                  //NOT SUBMITTED;
                  summaryStatus = 1;
                }

                let entryHours = parseFloat(entry.hours.toFixed(2));

                localMonths[entryDate].totalHours += entryHours;

                let filteredHours = 0;

                if (queryStatus.length) {
                  if (
                    queryStatus.includes(1) &&
                    !entry.submittedAt &&
                    !entry.rejectedAt &&
                    !entry.approvedAt
                  ) {
                    filteredHours += entryHours;
                  } else if (
                    queryStatus.includes(2) &&
                    entry.submittedAt &&
                    !entry.rejectedAt &&
                    !entry.approvedAt
                  ) {
                    filteredHours += entryHours;
                  } else if (queryStatus.includes(3) && entry.approvedAt) {
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

                //SAVED HOURS
                if (
                  !entry.submittedAt &&
                  !entry.rejectedAt &&
                  !entry.approvedAt
                ) {
                  localMonths[entryDate].savedHours += entryHours;
                  //NOT SUBMITTED
                  summaryStatus = 1;
                }

                //SUBMITTED HOURS
                if (
                  entry.submittedAt &&
                  !entry.rejectedAt &&
                  !entry.approvedAt
                ) {
                  localMonths[entryDate].submittedHours += entryHours;
                  //SUBMITTED
                  summaryStatus = 2;
                }

                //APPROVED HOURS
                if (entry.approvedAt) {
                  localMonths[entryDate].approvedHours += entryHours;
                  //APPROVED
                  summaryStatus = 3;
                }

                //NOT SUBMITTED HOURS
                if (entry.rejectedAt) {
                  localMonths[entryDate].rejectedHours += entryHours;
                  //NOT SUBMITTED;
                  summaryStatus = 1;
                }

                localMonths[entryDate].status =
                  parseTimesheetSummaryStatus(summaryStatus);
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
      }

      let milestoneProjectSummary: any = [];
      let timeProjectSummary: any = [];
      let milestoneProjectTotalHours = 0;
      let timeProjectTotalHours = 0;

      summary.forEach((summ) => {
        if (summ.projectType === 1) {
          milestoneProjectTotalHours += summ.currentYear;
          milestoneProjectSummary.push(summ);
        } else if (summ.projectType === 2) {
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
          'leaveRequests.type.leaveRequestType',
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
            !queryLeaveType.includes(
              leaveRequest.type?.leaveRequestType.id ?? 0
            )
          )
            continue;

          let leaveRequestTotalHours = parseFloat(
            leaveRequest.getEntriesDetails.totalHours.toFixed(2)
          );

          summaryObj.leaveRequests.push({
            projectCode: leaveRequest.workId,
            projectName: leaveRequest.work?.title ?? '-',
            leaveType: leaveRequest.type?.leaveRequestType.label ?? 'Unpaid',
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

  async leaveRequestSummaryView(req: Request, res: Response, next: NextFunction) {
    try {
      const manager = getManager();

      let queryStartDate = req.query.startDate as string;
      let queryEndDate = req.query.endDate as string;
      let queryProjectId = req.query.projectId as string;
      let queryLeaveTypeId = req.query.leaveTypeId as string;
      let queryContactPersonId = req.query.contactPersonId as string;
      let queryleaveStatus = req.query.leaveStatus as string;

      let startDate = queryStartDate ?? moment().startOf('month').format('YYYY-MM-DD')
      let endDate = queryEndDate ?? moment().endOf('month').format('YYYY-MM-DD')

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
        SUM(leave_entry_hours) total_request_hours,
        MIN(leave_entry_date) start_leave_date,
        MAX(leave_entry_date) end_leave_date
      
        FROM leaves_view 
        WHERE leave_entry_date >= STR_TO_DATE('${startDate}' ,'%Y-%m-%d')
          AND leave_entry_date <= STR_TO_DATE('${endDate}' ,'%Y-%m-%d')
          ${projectFilter} ${leaveTypeFilter} ${contactPersonFilter} ${leaveStatusFilter}
      GROUP BY employee_id, leave_request_id
      `)

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
          startDate: Moment,
          endDate: Moment,
          projectTitle: string;
        }[];
      }

      // let summary: SummaryInterface[] = [];
      let summary:  {[key: string]: SummaryInterface} ={}
      leave_requests.forEach((request: any) =>{
        summary[request.employee_id] = {
          employeeName: request.employee_name,
          employeeCode: request.employee_id,
          totalHours:
            (summary?.[request.employee_id]?.['totalHours'] ?? 0) +
            request.total_request_hours,
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
              endDate: moment(request.end_leave_date)
            },
          ],
        };
      })
  

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
    const actual = await getManager().query(`
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

      const forecast = await getManager().query(`
        SELECT 
          project_type,
          resource_start,
          resource_end,
          resource_contract_start,
          resource_contract_end,
          SUM(forcaste_buy_rate) forcaste_buy_rates,
          SUM(forcaste_sell_rate) forcaste_sell_rates

      FROM forecaste_view
      WHERE ( project_status = 'P' OR project_status = 'C' )
            AND resource_contract_start <= STR_TO_DATE('2023-30-06' ,'%Y-%m-%d') 
            AND (resource_contract_end IS NULL OR  resource_contract_end >= CURRENT_DATE())
            AND (resource_start BETWEEN  STR_TO_DATE('2023-30-06' ,'%Y-%m-%d')  AND STR_TO_DATE('2023-30-06' ,'%Y-%m-%d')  )
        GROUP BY project_id

      `);

      interface CalendarInterface {
        date: string;
        holiday_type_id: number;
      }

      let calendar: CalendarInterface[] = await getManager().query(`
      SELECT DATE_FORMAT(date, '%Y-%m-%d') date, holiday_type_id FROM  calendar_holidays 
      WHERE  date <= STR_TO_DATE('${fiscalYearEnd}' ,'%Y-%m-%d') 
        AND date >= STR_TO_DATE('${fiscalYearStart}' ,'%Y-%m-%d')`);

      interface HolidayInterface {
        [date: string]: number
      }

      let holidays: HolidayInterface = calendar.reduce(
        (a, { date, holiday_type_id }) => ({ ...a, [date]: holiday_type_id }),
        {}
      ); 

      

    res.status(200).json({
      success: true,
      message: 'Work In Hand Forecasting',
      data: actual,
    });
  }
}
