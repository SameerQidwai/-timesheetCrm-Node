import { Between, EntityRepository, Repository, getManager } from 'typeorm';
// import xero  from '../../xero-config'
import { Invoice } from 'xero-node';
import moment, { Moment } from 'moment';
import jwt from 'jsonwebtoken';
import { IntegrationAuth } from '../entities/integrationAuth';
import { Milestone } from '../entities/milestone';
import { ProfitView } from '../entities/views';

const invoices = {
  invoices: [
    {
      type: Invoice.TypeEnum.ACCREC,
      contact: {
        contactID: '3e776c4b-ea9e-4bb1-96be-6b0c7a71a37f',
      },
      lineItems: [
        {
          description: 'Xero integration from here',
          quantity: 2.0,
          unitAmount: 20.0,
          accountCode: '200',
          taxType: 'NONE',
          lineAmount: 40.0,
        },
      ],
      date: moment().format('YYYY-MM-DD'),
      dueDate: moment().add(7, 'days').format('YYYY-MM-DD'),
      reference: 'XERO-Nodes',
      status: Invoice.StatusEnum.AUTHORISED,
    },
  ],
};
@EntityRepository(IntegrationAuth)
export class InvoiceRepsitory extends Repository<IntegrationAuth> {
  // async create(): Promise<string> {
  //   try {
  //     return '';
  //   } catch (e) {
  //     return '';
  //   }
  // }

  async getInvoiceData(
    milestoneId: number,
    startDate: string,
    endDate: string
  ): Promise<any> {
    console.log(milestoneId,startDate, endDate, 'hit it');
    try {
      let milestone = await this.manager.findOne(Milestone, milestoneId, {
        relations: ['project'],
      });

      console.log(milestone?.project.id, 'hit it');
      if (!milestone) {
        throw new Error('Milestone Not Found');
      }

      if (milestone.project.type === 2) {
        console.log(milestone?.project.type, 'hit it');

        try {
          const resources = await this.query(`
            SELECT  
              SUM(actual_hours) quantity,
              resource_selling_rate unitAmount,
              resource_name description
              FROM 
                profit_view 
              WHERE milestone_id=${milestoneId}  AND 
              STR_TO_DATE(entry_date,'%e-%m-%Y') BETWEEN '${startDate}' AND  '${endDate}'
            GROUP BY resource_id
          `);
          return resources
        } catch (e) {
          console.error(e);
        }
      } else {
        try {
          const resources = await this.query(`
            SELECT  
              project_schedule_segments.amount unitAmount,
              DATE_FORMAT(project_schedule_segments.start_date, '%b %y') description,
              1 AS quantity
              FROM 
                project 
                  LEFT JOIN project_schedules ON
                  profit_view.project_id = project_schedules.project_id
                  LEFT JOIN project_schedule_segments  ON 
                  project_schedules.id = project_schedule_segments.schedule_id 

              WHERE id=${milestone?.project.id}
              AND MONTH(STR_TO_DATE(entry_date, '%e-%m-%Y')) >= MONTH('${startDate}')
              AND MONTH(STR_TO_DATE(entry_date, '%e-%m-%Y')) <= MONTH('${endDate}')
              AND project_schedules.deleted_at IS NULL 
              AND project_schedule_segments.deleted_at IS NULL 
            GROUP BY description
          `);
          return resources
        } catch (e) {
          console.error(e);
        }
      }

      return [];
    } catch (e) {
      return '';
    }
  }

  // async createInvoice(req: Request, res: Response, next: NextFunction) {
  //   try {
  //       const consentUrl = await xero.buildConsentUrl();
  // const invoicesRequest = await xero.accountingApi.createInvoices(activeTenant.tenantId, invoices)
  //       return res.status(200).json({
  //           success: false,
  //           message: 'User Not Found',
  //           data: consentUrl,
  //         });
  //   } catch (e) {
  //     next(e);
  //   }
  // }
}
