import { Between, EntityRepository, Repository } from 'typeorm';
// import xero  from '../../xero-config'
import { Invoice, TokenSet, XeroClient } from 'xero-node';
import moment, { Moment } from 'moment';
import { IntegrationAuth } from '../entities/integrationAuth';
import { Opportunity } from '../entities/opportunity';


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
  async getInvoices(): Promise<any> {
    try {
      // let xero = new XeroClient()
      let integration = await this.findOne({ where: { toolName: 'xero' } });
      if (!integration) {
        throw new Error('No Integration Found');
      }
      let {xero, tenantId} = await integration.getXeroToken();
      if (!xero) {
        throw new Error('No Integration Found');
      }
      let invoiceRes = await xero.accountingApi.getInvoices(tenantId)

      let xeroInvoices = invoiceRes.body.invoices??[]
      
      return xeroInvoices;
    } catch (e) {
      console.log(e)
      return [];
    }
  }

  async getInvoiceData(
    projectId: number,
    startDate: string,
    endDate: string
  ): Promise<any> {
    console.log(projectId,startDate, endDate, 'hitting  it');
    try {
      let project = await this.manager.findOne(Opportunity, projectId);

      if (!project) {
        throw new Error('Project Not Found');
      }
      console.log(project)
      if (project.type === 2) {
        console.log(project.type, 'hit it');
        if (startDate === 'undefined' || endDate === 'undefined'){
          throw new Error('Dates are not Defined')
        }

        try {
          const resources = await this.query(`
            SELECT  
              SUM(actual_hours) quantity,
              resource_selling_rate unit_amount,
              resource_name description,
              resource_id value
              FROM 
                profit_view 
              WHERE project_id=${projectId}  AND 
              STR_TO_DATE(entry_date,'%e-%m-%Y') BETWEEN '${startDate}' AND  '${endDate}'
            GROUP BY resource_id
          `);
          console.log(resources, 'I came till here')
          return resources
        } catch (e) {
          console.error(e);
        }
      } else {
        try {
          const schedule = await this.query(`
            SELECT  
            CONCAT(DATE_FORMAT(project_schedules.start_date, '%b'), '-', DATE_FORMAT(project_schedules.end_date, '%b'))  label,
            CONCAT(DATE_FORMAT(project_schedules.start_date, '%b'), '-', DATE_FORMAT(project_schedules.end_date, '%b'))  description,
            project_schedules.amount unit_amount,
            project_schedules.id value,
              1 AS quantity
              FROM 
                opportunities 
                  LEFT JOIN project_schedules ON
                  opportunities.id = project_schedules.project_id

              WHERE opportunities.id=${projectId}
              AND project_schedules.deleted_at IS NULL 
          `);
          
          return schedule
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
     let projects = await this.manager.find(Opportunity, {organizationId: orgId })
     let response =  projects.map(pro => {
      return {
        value: pro.id,
        type: pro.type,
        label: pro.title 
      }
     });
     return response
    } catch (e) {
      console.log(e)
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