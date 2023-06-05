import { Between, EntityRepository, Repository } from 'typeorm';
// import xero  from '../../xero-config'
import { Invoice as XeroInvoice, TokenSet, XeroClient } from 'xero-node';
import moment, { Moment } from 'moment';
import { IntegrationAuth } from '../entities/integrationAuth';
import { Opportunity } from '../entities/opportunity';
import { Invoice } from '../entities/invoice';
import { InvoiceResponse, InvoiceResponses } from '../responses/invoiceResponses';
import { InvoicesInterface } from '../utilities/interfaces';
import fs from 'fs';
import path from 'path';

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

      // console.log(xeroInvoices)

      return new InvoiceResponses(xeroInvoices, invoiceObj).invoices;
      // return xeroInvoices;
    } catch (e) {
      console.log(e);
      return [];
    }
  }

  async createAndSave(data: any): Promise<any> {
    try {
      if (!data.lineItems?.length) {
        throw new Error('XeroInvoice is empty');
      }

      let [project, integration] = await Promise.all([
        this.manager.findOne(Opportunity,data.projectId  ,{
          relations: ['organization'],
        }),
        this.manager.findOne(IntegrationAuth, {
          where: { toolName: 'xero' },
        })
      ]);


      if (!integration) {
        throw new Error('No Integration Found');
      }
      let { xero, tenantId } = await integration.getXeroToken();
      if (!xero) {
        throw new Error('xero is not fonud');
      }

      if (!project?.organization?.abn){
        throw new Error('Organization Do not have ABN in Timewize');
      }

      const custRes = await xero.accountingApi.getContacts(tenantId, undefined, `taxNumber == "${project.organization.abn}"`);

      const contact = custRes?.body?.contacts?.[0];

      if (!contact){
        throw new Error("Xero Does Not Have Any Customer With Provided ABN");
      }


      const xeroInvoices = {
        invoices: [
          {
            type: XeroInvoice.TypeEnum.ACCREC,
            contact: {
              contactID: contact.contactID, 
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

      let createdInvoicesResponse = await xero.accountingApi.createInvoices(
        tenantId,
        xeroInvoices
      );

       const invoiceId = createdInvoicesResponse.body?.invoices?.[0]?.invoiceID; //getting Invoice Id

       let attachemts_9 = (data.attachments??[]).slice(0,9) // below Api only allows only 10 Attachments

       let attachPromise = [] //creating promise loop
       for (let index in attachemts_9){
         attachPromise.push(()=>xero.accountingApi.createInvoiceAttachmentByFileName(
          tenantId, //Xero identifier for Tenant
          invoiceId, //Invoice Id to attach files
          `attachment_${index}`, //fileName which is showing in xero
          fs.createReadStream(path.join(__dirname, `../../public/uploads/${attachemts_9[index].uniqueName}`)), //file
          attachemts_9[index].includeOnline //Allows an attachment to be seen by the end customer within their online invoice
        )) // this api only create only 10 attachments 
       }

       let attachments_rest =(data.attachments??[]).slice(9); //rest of the attachment will be uploaded from this api with in xero
       for (let index in attachments_rest) {  // 
         attachPromise.push(() =>(
           xero.filesApi.uploadFile(
             tenantId, //Xero identifier for Tenant
             fs.createReadStream( path.join( __dirname, `../../public/uploads/${attachments_rest[index].uniqueName}` )), //file
             attachments_rest[index].uniqueName, //exact file name which is being uploaded 
             `attachment_${9+index}`, // file name which will showing in xero
             attachments_rest[index].type //mimetype
           ))
         );
       }


       let attachPromiseRes: any = await Promise.all(attachPromise.map((apiCall: any) => apiCall())); //resolve all api's

       let associationPromise = []

       let attachMessage = 'All files are Attached Successfully'
      for (let index in  attachPromiseRes){
        let res = attachPromiseRes[index]
        if (!res?.boady?.FileObject){
          attachMessage = 'Some of files are not Uploaded and need to upload manually'
        }else if (parseInt(index) >9){ // need to associate rest of the attachments uploaded as file with invoices
          associationPromise.push(() => (
          xero.filesApi.createFileAssociation(
            tenantId, //Xero identifier for Tenant
            res.id, // file Id 
            {
              fileId: res.id, // file Id 
              objectId: invoiceId, //invoice Id
              objectType: XeroInvoice.TypeEnum.ACCREC,
              objectGroup: 'Invoice'
            }
          ))
          )
        }
      }

      let associationPromiseRes: any = await Promise.all(associationPromise.map((apiCall: any) => apiCall())); //resolve all api's

      for (let index in associationPromiseRes){ //Allows an attachment to be seen by the end customer within their online invoice
        let res = associationPromiseRes[index] //calling this api again to change the ^^^^^^
        if (res?.body?.Association){ 
          xero.accountingApi.createInvoiceAttachmentByFileName(  
            tenantId, //Xero identifier for Tenant
            invoiceId, //Invoice Id to attach files
            `attachment_${9+index}`, //fileName which is showing in xero
            fs.createReadStream(path.join(__dirname, `../../public/uploads/${attachments_rest[index].uniqueName}`)), //file
            attachemts_9[index].includeOnline //Allows an attachment to be seen by the end customer within their online invoice
          ) // this api only create only 10 attachments
        }
      }

      const crmInvoice = {
        organizationId: project.organization.id,
        projectId: data.projectId,
        invoiceId: invoiceId,
        reference: data.reference,
        scheduleId: data.scheduleId,
        startDate: data.startDate,
        endDate: data.endDate
      };
      this.save(crmInvoice);
      return {
        success: true,
        attachMessage,
        message: 'Invoice Created Successfully'
      };
    } catch (e) {
      return {
        success: true,
        message: 'Invoice Not Created'
      };
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

      let email_send = await xero.accountingApi.emailInvoice( tenantId, id, );
      console.log(email_send)
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
            HasAttachments: true, 
            lineItems: data?.lineItems.map((record: any) => ({
              accountCode: record.accountCode,
              description: record.description,
              quantity: record.quantity,
              taxType: record.taxType,
              taxAmount: record.taxAmount,
              unitAmount: record.unitAmount,
            })),
            attachments: [
              {
                fileName: '1680609422809217459.pdf',
                mimeType: 'application/pdf',
                content: fs.readFileSync(path.join(__dirname, `../../public/uploads/1680609422809217459.pdf`)),
              }
            ]
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
        // -- are the comments inside the sql query 
        try {
          let resources = await this.query(`
            SELECT  
              SUM(actual_hours) quantity,
              resource_selling_rate unitAmount,
              resource_name description,
              CONCAT( -- 1 Concatenates the string square brackets open
                '[',
                GROUP_CONCAT( -- Aggregates the concatenated JSON objects
                  DISTINCT CONCAT( -- Only allow Unique Concatenates the JSON object
                    '{
                      "type": "', files.type, '",
                      "originalName": "', files.original_name, '",
                      "uniqueName": "', files.unique_name, '",
                      "fileId": ', files.id, 
                    '}' 
                  )
                  SEPARATOR ','  -- Separator for each JSON object
                ),
                ']' --  1 Concatenates the string square brackets close
              ) attachments,
              resource_id id
              FROM 
                profit_view
                    LEFT JOIN attachments -- join on attachment and files by milestone_entry_id
                    ON (
                      attachments.target_id = profit_view.milestone_entry_id
                      AND attachments.target_type = "PEN"
                    )
                    LEFT JOIN files
                      ON (attachments.file_id = files.id)
              WHERE project_id=${projectId}  AND 
              STR_TO_DATE(entry_date,'%e-%m-%Y') BETWEEN '${startDate}' AND  '${endDate}'
            GROUP BY resource_id
          `);
          
          let attachments: any[] =[]
          let fileNames: string[] = []
          resources = resources.map((resource:any)=>{ //checking the file should be unique for all resouces
            for (let attach of (resource?.attachments??[])) {
              if (!fileNames.includes(attach.uniqueName)){ //check if fileName is created unique
                attachments.push(attach) 
                fileNames.push(attach.uniqueName) //adding to this array to check later 
              }
            }
            // delete resource.attachments // delete attachment from all resouce to added array seperatly 
            return resource // return updated element to map 
          }) 
          return {resources, attachments};
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

          return {schedule};
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
