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
  parseTimesheetSummaryStatus,
  parseWorkStatus,
} from '../utilities/helperFunctions';
import { StandardSkillStandardLevel } from '../entities/standardSkillStandardLevel';
import { Opportunity } from '../entities/opportunity';
import { PurchaseOrder } from '../entities/purchaseOrder';
import xlsx from 'xlsx';
import fs, { stat } from 'fs';
import path from 'path';
import { TimesheetSummaryStatus } from '../constants/constants';

export class ReportExportController {
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
        Name: string;
        'Resource Type': string;
        'Employment Type': string;
        'Buy Rate': number | string;
        Skill: string;
        Level: string;
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
          resources.push({
            Name: employee.getFullName,
            'Resource Type': parseResourceType(resourceType),
            'Employment Type': parseContractType(employmentType),
            'Buy Rate': await buyRateByEmployee(employee),
            Level: '',
            Skill: '',
          });

          employee.contactPersonOrganization.contactPerson.standardSkillStandardLevels.forEach(
            (skill) => {
              resources.push({
                Name: '',
                'Resource Type': '',
                'Employment Type': '',
                'Buy Rate': '',
                Level: skill.standardLevel.label,
                Skill: skill.standardSkill.label,
              });
            }
          );
        }
      }

      let name = await this.exportReport('any', resources);

      res.status(200).json({
        success: true,
        message: 'Benched Resources',
        data: `reports/download/${name}`,
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
        Skill: string;
        'Skill Level': string;
        Name: string;
        'Resource Type': string;
        'Employment Type': string;
        'Buy Rate': number;
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
              Skill: standardSkillLevel.standardSkill.label,
              'Skill Level': standardSkillLevel.standardLevel.label,
              Name: contactPerson.getFullName,
              'Resource Type': parseResourceType(resourceType),
              'Employment Type': parseContractType(employmentType),
              'Buy Rate': await buyRateByEmployee(employee),
            });
        }
      }

      let name = await this.exportReport('any', worforce);

      res.status(200).json({
        success: true,
        message: 'Workforce skills',
        data: `reports/download/${name}`,
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
        'Work Type': string;
        Title: String;
        'Work Status': String;
        Organization: string;
        Milestone: string;
        Position: string;
        Skill: string;
        'Skill Level': string;
        Name: string;
        'Employment Type': string;
        'Resource Type': string;
        'Booking Type': string;
        'Buy Rate': number;
        'Sell Rate': number;
        'CM Percent': number;
        'Start Date': Date;
        'End Date': Date;
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
                'Work Type': workStatus ? 'Project' : 'Opportunity',
                Title: work.title,
                'Work Status': parseWorkStatus(work.phase),
                Organization: work.organization.title,
                Milestone: work.type == 1 ? milestone.title : '-',
                Position: position.title ?? '-',
                Skill: position.panelSkill.standardSkill.label,
                'Skill Level':
                  position.panelSkillStandardLevel.standardLevel.label,
                Name: '-',
                'Resource Type': '-',
                'Employment Type': '-',
                'Booking Type': parseBookingType(bookingType),
                'Buy Rate': 0,
                'Sell Rate': 0,
                'CM Percent': 0,
                'Start Date': position.startDate,
                'End Date': position.endDate,
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
                'Work Type': workStatus ? 'Project' : 'Opportunity',
                Title: work.title,
                'Work Status': parseWorkStatus(work.phase),
                Organization: work.organization.title,
                Milestone: work.type == 1 ? milestone.title : '-',
                Position: position.title ?? '-',
                Skill: position.panelSkill.standardSkill.label,
                'Skill Level':
                  position.panelSkillStandardLevel.standardLevel.label,
                Name: allocation.contactPerson.getFullName,
                'Resource Type': parseResourceType(resourceType),
                'Employment Type': parseContractType(employmentType),
                'Booking Type': parseBookingType(bookingType),
                'Buy Rate': allocation.buyingRate,
                'Sell Rate': allocation.sellingRate,
                'CM Percent':
                  allocation.sellingRate > 0
                    ? parseFloat(
                        (
                          ((allocation.sellingRate - allocation.buyingRate) /
                            allocation.sellingRate) *
                          100
                        ).toFixed(2)
                      )
                    : 0,
                'Start Date': position.startDate,
                'End Date': position.endDate,
              });
            }
          }
        }
      }

      let name = await this.exportReport('any', allocations);

      res.status(200).json({
        success: true,
        message: 'Allocations',
        data: `reports/download/${name}`,
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
        Name: string;
        'Resource Type': string;
        'Employment Type': string;
        'Booking Type': string;
        'Work Type': string;
        Title: String;
        'Work Status': string;
        Organization: string;
        Milestone: string;
        Position: string;
        Skill: string;
        'Skill Level': string;
        'Buy Rate': number;
        'Sell Rate': number;
        'Start Date': Date | null;
        'End Date': Date | null;
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
            Name: employee.getFullName,
            'Resource Type': parseResourceType(resourceType),
            'Employment Type': parseContractType(employmentType),
            'Booking Type': parseBookingType(bookingType),
            'Work Type': '-',
            Title: '-',
            'Work Status': '-',
            Organization: '-',
            Milestone: '-',
            Position: '-',
            Skill: '-',
            'Skill Level': '-',
            'Buy Rate': 0,
            'Sell Rate': 0,
            'Start Date': null,
            'End Date': null,
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
            Name: employee.getFullName,
            'Resource Type': parseResourceType(resourceType),
            'Employment Type': parseContractType(employmentType),
            'Booking Type': parseBookingType(bookingType),
            'Work Type': workStatus ? 'Project' : 'Opportunity',
            Title: work.title,
            'Work Status': parseWorkStatus(work.phase),
            Organization: work.organization.title,
            Milestone: work.type == 1 ? milestone.title : '-',
            Position: position.title ?? '-',
            Skill: position.panelSkill.standardSkill.label,
            'Skill Level': position.panelSkillStandardLevel.standardLevel.label,
            'Buy Rate': allocation.buyingRate,
            'Sell Rate': allocation.sellingRate,
            'Start Date': position.startDate,
            'End Date': position.endDate,
          });
        }
      }

      let name = await this.exportReport('any', allocations);

      res.status(200).json({
        success: true,
        message: 'Allocations',
        data: `reports/download/${name}`,
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
          'Project Value': el.project_amount,
          'Project ID': el.project_id,
          'Organization Id': el.project_organization_id,
          'Organization Name': el.project_organization_name,
          'Project Title': el.project_title,
          'Project Manager ID': el.project_manager_id,
          'Project Manager Name': el.project_manager_name,
          'Project Type': el.project_type,
        }),
        //don't need buy rate for now... if it needed will uncoment this
        // [el.month]: {
        //   monthTotalBuy: el.month_total_buy,
        //   monthTotalSell: el.month_total_sell,
        // },
        [el.month]: el.month_total_sell,
        'Total Sell':
          (actualStatement?.[el.project_id]?.['Total Sell'] ?? 0) +
          el.month_total_sell,
        'Total Buy':
          (actualStatement?.[el.project_id]?.['Total Buy'] ?? 0) +
          el.month_total_buy,
        'YTD Total Sell': moment(el.month, 'MMM YY').isBetween(
          fiscalYearStart,
          fiscalYearEnd,
          'month',
          '[]'
        )
          ? (actualStatement?.[el.project_id]?.['YTD Total Sell'] ?? 0) +
            el.month_total_sell
          : actualStatement?.[el.project_id]?.['YTD Total Sell'] ?? 0,
      };
    });

    let name = await this.exportReport('any', Object.values(actualStatement));

    res.status(200).json({
      success: true,
      message: 'Project Revenue Analysis',
      data: `reports/download/${name}`,
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
          'Organization ID': el.project_organization_id,
          'Organization Name': el.project_organization_name,
          'Project Type': el.project_type,
        }),
        //don't need buy rate for now... if it needed will uncoment this
        // [el.month]: {
        //   monthTotalBuy: (actualStatement?.[el.project_organization_id]?.[el.month]?.['monthTotalBuy'] ??0) + el.month_total_buy,
        //   monthTotalSell: (actualStatement?.[el.project_organization_id]?.[el.month]?.['monthTotalSell'] ??0) + el.month_total_sell,
        // },
        [el.month]:
          (actualStatement?.[el.project_organization_id]?.[el.month] ?? 0) +
          el.month_total_sell,

        'Total Sell':
          (actualStatement?.[el.project_organization_id]?.['Total Sell'] ?? 0) +
          el.month_total_sell,
        'Total Buy':
          (actualStatement?.[el.project_organization_id]?.['Total Buy'] ?? 0) +
          el.month_total_buy,

        'Projects Value': projectsValues?.[el.project_organization_id]?.[
          el.project_id
        ]
          ? actualStatement?.[el.project_organization_id]?.['Projects Value'] ??
            0
          : (actualStatement?.[el.project_organization_id]?.[
              'Projects Value'
            ] ?? 0) + el.project_amount,

        'YTD Total Sell': moment(el.month, 'MMM YY').isBetween(
          fiscalYearStart,
          fiscalYearEnd,
          'month',
          '[]'
        )
          ? (actualStatement?.[el.project_organization_id]?.[
              'YTD Total Sell'
            ] ?? 0) + el.month_total_sell
          : actualStatement?.[el.project_organization_id]?.['YTD Total Sell'] ??
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

    let name = await this.exportReport('any', Object.values(actualStatement));

    res.status(200).json({
      success: true,
      message: 'Client Revenue Analysis',
      data: `reports/download/${name}`,
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
        'Employee Name': string;
        'Employee Code': number;
        'Project Name': String;
        'Project Code': number;
        'Project Type': number;
        'Purchase Order': number | null;
        'Organization Name': string;
        Months: MonthInterface;
        'Current Month': number;
        'Current Year': number;
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
                ].Months[entryDate].filteredHours += filteredHours;
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
                ].Months[entryDate].status = summaryStatus;
              }

              summary[employeeProjectIndexes[`${employee.id}_${project.id}`]][
                'Current Month'
              ] =
                summary[
                  employeeProjectIndexes[`${employee.id}_${project.id}`]
                ].Months[moment(currentMoment).format('MMM YY')].filteredHours;

              summary[employeeProjectIndexes[`${employee.id}_${project.id}`]][
                'Current Year'
              ] += sumOfHours;
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
                'Employee Name': employee.getFullName,
                'Employee Code': employee.id,
                'Project Name': project.title,
                'Project Code': project.id,
                'Project Type': project.type,
                'Purchase Order': projectPurchaseOrders[project.id]?.id ?? null,
                'Organization Name': project.organization.name,
                Months: localMonths,
                'Current Month':
                  localMonths[moment(currentMoment).format('MMM YY')]
                    .filteredHours ?? 0,
                'Current Year': sumOfHours,
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
              'Employee Name': employee.getFullName,
              'Employee Code': employee.id,
              'Project Name': project.title,
              'Project Code': project.id,
              'Project Type': project.type,
              'Purchase Order': projectPurchaseOrders[project.id]?.id ?? null,
              'Organization Name': project.organization,
              Months: localMonths,
              'Current Month': 0,
              'Current Year': 0,
            });
          }
          if (_partialTrue) {
            for (let changeMonth of _partiallyTrueMonths) {
              summary[
                employeeProjectIndexes[
                  `${employee.id}_${projectData[allocationProject].id}`
                ]
              ].Months[changeMonth].status =
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
        if (summ['Project Type'] === 1) {
          for (let month in summ.Months) {
            if (queryStatus.length) {
              if (
                queryStatus.includes(summ.Months[month].status) &&
                summ.Months[month].status !==
                  TimesheetSummaryStatus.NOT_APPLICABLE
              ) {
                (summ as any)[month] = summ.Months[month].filteredHours;
              } else if (
                summ.Months[month].status ===
                TimesheetSummaryStatus.NOT_APPLICABLE
              ) {
                (summ as any)[month] = 'N/A';
              } else {
                (summ as any)[month] = '-';
              }
            } else {
              if (
                summ.Months[month].status ===
                  TimesheetSummaryStatus.SUBMITTED &&
                summ.Months[month].status !==
                  TimesheetSummaryStatus.NOT_APPLICABLE
              ) {
                (summ as any)[month] = summ.Months[month].filteredHours;
              } else if (
                summ.Months[month].status ===
                TimesheetSummaryStatus.NOT_APPLICABLE
              ) {
                (summ as any)[month] = 'N/A';
              } else {
                (summ as any)[month] = '-';
              }
            }
          }
          milestoneProjectTotalHours += summ['Current Year'];
          delete (summ as any).Months;
          milestoneProjectSummary.push(summ);
        } else if (summ['Project Type'] === 2) {
          for (let month in summ.Months) {
            if (queryStatus.length) {
              if (queryStatus.includes(summ.Months[month].status)) {
                (summ as any)[month] = summ.Months[month].filteredHours;
              } else {
                (summ as any)[month] = '-';
              }
            } else {
              if (
                summ.Months[month].status === TimesheetSummaryStatus.SUBMITTED
              ) {
                (summ as any)[month] = summ.Months[month].filteredHours;
              } else {
                (summ as any)[month] = '-';
              }
            }
          }
          timeProjectTotalHours += summ['Current Year'];
          delete (summ as any).Months;
          timeProjectSummary.push(summ);
        }
      });

      let name = await this.exportReport('any', [
        // ...['', '', '', 'TIMEBASED PROJECT SUMMARY'],
        ...timeProjectSummary,
        // ...[''],
        // ...['', '', '', 'MILESTONE PROJECT SUMMARY'],
        ...milestoneProjectSummary,
      ]);

      res.status(200).json({
        success: true,
        message: 'Timesheet Summary',
        // data: {
        //   milestoneProjectSummary,
        //   timeProjectSummary,
        //   milestoneProjectTotalHours,
        //   timeProjectTotalHours,
        // },
        data: `reports/download/${name}`,
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
        'Employee Name': string;
        'Employee Code': number;
        'Total Hours': number;
        'Project Title': string;
        'Project Code': string | null;
        Hours: string;
        'Leave Request ID': string;
        'Leave Status': string;
        'Leave Type ID': string;
        'Leave Type': string;
        'Project ID': string;
        'Start Date': string;
        'End Date': string;

        leaveRequests: {
          'Project Title': string;
          'Project Code': number | null;
          Hours: number;
          'Leave Request ID': number;
          'Leave Status': string;
          'Leave Type ID': number;
          'Leave Type': string;
          'Project ID': number;
          'Start Date': Date;
          'End Date': Date;
        }[];
      }

      // let summary: SummaryInterface[] = [];
      let summary: { [key: string]: SummaryInterface } = {};
      leave_requests.forEach((request: any) => {
        summary[request.employee_id] = {
          'Employee Name': request.employee_name,
          'Employee Code': request.employee_id,
          'Total Hours':
            (summary?.[request.employee_id]?.['Total Hours'] ?? 0) +
            parseFloat(request.total_request_hours),
          'Project Title': '',
          'Project Code': '',
          Hours: '',
          'Leave Request ID': '',
          'Leave Status': '',
          'Leave Type ID': '',
          'Leave Type': '',
          'Project ID': '',
          'Start Date': '',
          'End Date': '',
          leaveRequests: [
            ...(summary?.[request.employee_id]?.['leaveRequests'] || []),
            {
              'Project Title': request.project_title,
              'Project Code': request.project_id,
              Hours: request.total_request_hours,
              'Leave Type ID': request.leave_type_id,
              'Leave Type': request.leave_type_name,
              'Leave Request ID': request.leave_request_id,
              'Leave Status': request.leave_status,
              'Project ID': request.project_id,
              'Start Date': moment(request.start_leave_date).toDate(),
              'End Date': moment(request.end_leave_date).toDate(),
            },
          ],
        };
      });

      let exportData = [];

      for (let employee of Object.values(summary)) {
        exportData.push(employee);
        employee.leaveRequests.forEach((request) => {
          exportData.push(request);
        });
        delete (employee as any).leaveRequests;
      }

      let name = await this.exportReport('any', exportData);

      res.status(200).json({
        success: true,
        message: 'Leave Request Summary',
        data: `reports/download/${name}`,
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
      [date: string]: number;
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

  async exportReport(reportType: string, data: any): Promise<string> {
    let SMALLEST = 9999999;
    let BIGGEST = 1;

    let files = fs.readdirSync(path.join(__dirname, `../../public/reports/`));

    files.forEach((file) => {
      let reportNumber = parseInt(file.split('report')[1].split('.')[0]);
      if (reportNumber < SMALLEST) {
        SMALLEST = reportNumber;
      }
      if (reportNumber > BIGGEST) {
        BIGGEST = reportNumber;
      }
    });

    if (files.length === 10) {
      fs.unlinkSync(
        path.join(__dirname, `../../public/reports/report${SMALLEST}.xlsx`)
      );
    }

    var workbook = xlsx.utils.book_new();

    const ws = xlsx.utils.json_to_sheet(data);

    xlsx.utils.book_append_sheet(workbook, ws, 'main');

    // Writing to our file
    xlsx.writeFile(workbook, `./public/reports/report${BIGGEST + 1}.xlsx`);

    return `report${BIGGEST + 1}.xlsx`;
  }

  _generateReportUrl(name: string): string {
    return `reports/download/${name}`;
  }
}
