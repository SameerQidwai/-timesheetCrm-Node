import { Between, EntityRepository, Repository } from 'typeorm';
// import xero  from '../../xero-config'
import { Invoice as XeroInvoice, TokenSet, XeroClient } from 'xero-node';
import moment, { Moment } from 'moment';
import { IntegrationAuth } from '../entities/integrationAuth';
import { Opportunity } from '../entities/opportunity';
import { Invoice } from '../entities/invoice';
import { InvoiceResponse, InvoiceResponses } from '../responses/invoiceResponses';
import { InvoicesInterface } from '../utilities/interfaces';

// const invoices = {
//   invoices: [
//     {
//       type: XeroInvoice.TypeEnum.ACCREC,
//       contact: {
//         contactID: '3e776c4b-ea9e-4bb1-96be-6b0c7a71a37f',
//       },
//       lineItems: [
//         {
//           description: 'Xero integration from here',
//           quantity: 2.0,
//           unitAmount: 20.0,
//           accountCode: '200',
//           taxType: 'NONE',
//           lineAmount: 40.0,
//         },
//       ],
//       date: moment().format('YYYY-MM-DD'),
//       dueDate: moment().add(7, 'days').format('YYYY-MM-DD'),
//       reference: 'XERO-Nodes',
//       status: XeroInvoice.StatusEnum.AUTHORISED,
//     },
//   ],
// };
@EntityRepository(Invoice)
export class InvoiceRepsitory extends Repository<Invoice> {
  async getAllActive(): Promise<InvoicesInterface[]> {
    try {
      // let xero = new XeroClient()
      let [crmInvoice, integration] = await Promise.all([
        this.find({
          relations: ['project', 'organization'],
        }),
        this.manager.findOne(IntegrationAuth, { where: { toolName: 'xero' } }),
      ]);

      if (!integration) {
        throw new Error('No Integration Found');
      }
      let { xero, tenantId } = await integration.getXeroToken();
      if (!xero) {
        throw new Error('No Xero Token Found');
      }
      if (!crmInvoice.length) {
        return [];
      }

      let invoiceObj: any = {};
      crmInvoice.forEach((invoice: any) => {
        invoiceObj[invoice.invoiceId] = invoice;
      });
      let invoiceIds = Object.keys(invoiceObj);

      let invoiceRes = await xero.accountingApi.getInvoices(
        tenantId,
        undefined,
        undefined,
        undefined,
        invoiceIds
      );
      if (!invoiceRes.body.invoices.length) {
        return [];
      }



      let xeroInvoices = invoiceRes.body.invoices ?? [];

      return new InvoiceResponses(xeroInvoices, invoiceObj).invoices;
      // return xeroInvoices;
    } catch (e) {
      console.log(e);
      return [];
    }
  }

  async createAndSave(data: any): Promise<boolean> {
    try {
      if (!data.lineItems?.length) {
        throw new Error('XeroInvoice is empty');
      }
      const xeroInvoices = {
        invoices: [
          {
            type: XeroInvoice.TypeEnum.ACCREC,
            contact: {
              contactID: data.organization.xeroId, 
            },
            // status: XeroInvoice.StatusEnum.DRAFT,
            date: moment(data.issueDate).format('YYYY-MM-DD'),
            dueDate: moment(data.dueDate).format('YYYY-MM-DD'),
            reference: data.reference,
            lineAmountTypes: data.lineAmountTypes,
            lineItems: data?.lineItems.map((record: any) => ({
              accountCode: record.accountCode,
              description: record.description,
              quantity: record.quantity,
              taxType: record.taxType,
              taxAmount: record.taxAmount,
              unitAmount: record.unitAmount,
            })),
          },
        ],
      };

      let integration = await this.manager.findOne(IntegrationAuth, {
        where: { toolName: 'xero' },
      });
      if (!integration) {
        throw new Error('No Integration Found');
      }
      let { xero, tenantId } = await integration.getXeroToken();
      if (!xero) {
        throw new Error('xero is not fonud');
      }

      let createdInvoicesResponse = await xero.accountingApi.createInvoices(
        tenantId,
        xeroInvoices
      );
      const invoiceId = createdInvoicesResponse.body?.invoices?.[0]?.invoiceID;

      const crmInvoice = {
        organizationId: data.organization.id,
        projectId: data.projectId,
        invoiceId: invoiceId,
        reference: data.reference,
        scheduleId: data.schedule,
        startDate: data.startDate,
        endDate: data.endDate
      };
      this.save(crmInvoice);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async findOneCustom(id: string): Promise<any>{
    try{
      let integration = await this.manager.findOne(IntegrationAuth, { where: { toolName: 'xero' } })
      if (!integration) {
        throw new Error('No Integration Found');
      }
      let { xero, tenantId } = await integration.getXeroToken();
      if (!xero) {
        throw new Error('No Xero Token Found');
      }

      let [crmInvoice, xeroRes] = await Promise.all([
        this.findOne({
          where: {invoiceId: id},
          relations: ['project', 'organization'],
        }),
        xero.accountingApi.getInvoice( tenantId, id )
      ]);

      let xeroInvoice = xeroRes.body.invoices?.[0]

      if (!crmInvoice || !xeroInvoice){
        throw new Error ('Invoice Not Found')
      }
      
      return new InvoiceResponse(xeroInvoice, crmInvoice)
    }catch (e){
      console.log(e)
      return {}
    }
  }

  async updateAndReturn(id: string, data: any): Promise<boolean> {
    try {
      if (!data.lineItems?.length) {
        throw new Error('XeroInvoice is empty');
      }
      const xeroInvoices = {
        invoices: [
          {
            type: XeroInvoice.TypeEnum.ACCREC,
            // status: XeroInvoice.StatusEnum.DELETED,
            contact: {
              contactID: data.organization.xeroId,
            },
            date: moment(data.issueDate).format('YYYY-MM-DD'),
            dueDate: moment(data.dueDate).format('YYYY-MM-DD'),
            reference: data.reference,
            lineAmountTypes: data.lineAmountTypes,
            lineItems: data?.lineItems.map((record: any) => ({
              accountCode: record.accountCode,
              description: record.description,
              quantity: record.quantity,
              taxType: record.taxType,
              taxAmount: record.taxAmount,
              unitAmount: record.unitAmount,
            })),
          },
        ],
      };

      let integration = await this.manager.findOne(IntegrationAuth, {
        where: { toolName: 'xero' },
      });
      if (!integration) {
        throw new Error('No Integration Found');
      }
      let { xero, tenantId } = await integration.getXeroToken();
      if (!xero) {
        throw new Error('xero is not fonud');
      }

      let createdInvoicesResponse = await xero.accountingApi.updateInvoice(
        tenantId,
        id,
        xeroInvoices
      );
      const invoiceId = createdInvoicesResponse.body?.invoices?.[0]?.invoiceID;

      const crmInvoice = {
        organizationId: data.organization.id,
        projectId: data.projectId,
        invoiceId: invoiceId,
        reference: data.reference,
        scheduleId: data.schedule,
        startDate: data.startDate,
        endDate: data.endDate
      };
      this.update({invoiceId},crmInvoice);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async getInvoiceData(
    projectId: number,
    startDate: string,
    endDate: string
  ): Promise<any> {
    try {
      let project = await this.manager.findOne(Opportunity, projectId);

      if (!project) {
        throw new Error('Project Not Found');
      }
      if (project.type === 2) {
        if (startDate === 'undefined' || endDate === 'undefined') {
          throw new Error('Dates are not Defined');
        }

        try {
          const resources = await this.query(`
            SELECT  
              SUM(actual_hours) quantity,
              resource_selling_rate unitAmount,
              resource_name description,
              resource_id id
              FROM 
                profit_view 
              WHERE project_id=${projectId}  AND 
              STR_TO_DATE(entry_date,'%e-%m-%Y') BETWEEN '${startDate}' AND  '${endDate}'
            GROUP BY resource_id
          `);
          return resources;
        } catch (e) {
          console.error(e);
        }
      } else {
        try {
          const schedule = await this.query(`
            SELECT  
            CONCAT(DATE_FORMAT(project_schedules.start_date, '%b'), '-', DATE_FORMAT(project_schedules.end_date, '%b'))  description,
            project_schedules.amount unitAmount,
            project_schedules.id id,
              1 AS quantity
              FROM 
                opportunities 
                  LEFT JOIN project_schedules ON
                  opportunities.id = project_schedules.project_id

              WHERE opportunities.id=${projectId}
              AND project_schedules.deleted_at IS NULL 
          `);

          return schedule;
        } catch (e) {
          console.error(e);
        }
      }

      return [];
    } catch (e) {
      return '';
    }
  }

  async getClientProjects(orgId: number): Promise<any> {
    try {
      // let xero = new XeroClient()
      let projects = await this.manager.find(Opportunity, {
        organizationId: orgId,
      });
      let response = projects.map((pro) => {
        return {
          id: pro.id,
          type: pro.type,
          name: pro.title,
        };
      });
      return response;
    } catch (e) {
      console.log(e);
      return [];
    }
  }

  // async getOrganization():Promise<any>{
  //   let token = this.manager.
  // }

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
