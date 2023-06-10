import { InvoicesInterface } from '../utilities/interfaces';
import { Invoice } from '../entities/invoice';
import { LineAmountTypes, LineItem, LineItemItem, Invoice as XeroInvoce } from 'xero-node';
import { AttachmentsResponse } from './attachmentResponses';

export class InvoiceResponses {
  invoices: InvoicesInterface[] = [];

  constructor(
    xeroInvoices: XeroInvoce[],
    crmInvoice: { [key: string]: Invoice }
  ) {
    xeroInvoices.forEach((invoice: any) => {
      let tempCrmInvoice = crmInvoice[invoice.invoiceID];
      this.invoices.push({
        id: tempCrmInvoice.id,
        invoiceId: tempCrmInvoice.invoiceId,
        type: invoice.type,
        status: invoice.status,
        organization: {
            xeroId: invoice.contact.contactID,
            name: tempCrmInvoice.organization.name,
            id: tempCrmInvoice.organizationId,
        },
        project: {
            id: tempCrmInvoice.project.id,
            name: tempCrmInvoice.project.title,
        },
        issueDate: invoice.date,
        dueDate: invoice.dueDate,
        invoiceNumber: invoice.invoiceNumber,
        reference: tempCrmInvoice.reference,
      });
    });
  }
}

export class InvoiceResponse {
    id: number;
    invoiceId: string;
    reference: string;
    invoiceNumber?: string;
    projectId: number;
    scheduleId: number;
    organizationId: number;
    type?: XeroInvoce.TypeEnum;
    issueDate?: string| null;
    dueDate?: string | null;
    startDate?: Date| null;
    endDate?: Date | null;
    lineAmountTypes?: LineAmountTypes;
    status?: XeroInvoce.StatusEnum;
    totalAmounts: {
        subTotal?: number;
        totalTax?: number;
        total?: number;
    }
    accountCode?: string;
    taxType?: string;
    project: {
        id: number;
        name: String;
        type: number;
    };
    organization: {
        id: number;
        name: string;
        xeroId?: string;
    };
    lineItems?: LineItem[];
    attachments: any;
    
    constructor(xeroInvoice: XeroInvoce, crmInvoice: Invoice, attachments: any = []) {
        this.id = crmInvoice.id;
        this.invoiceId =  crmInvoice.invoiceId;
        this.reference = crmInvoice.reference;
        this.projectId= crmInvoice.projectId;
        this.scheduleId= crmInvoice.scheduleId;
        this.startDate= crmInvoice.startDate;
        this.endDate= crmInvoice.endDate;
        this.organizationId= crmInvoice.organizationId;
        this.invoiceNumber= xeroInvoice.invoiceNumber;
        this.type= xeroInvoice.type;
        this.issueDate= xeroInvoice.date;
        this.dueDate= xeroInvoice.dueDate;
        this.lineAmountTypes= xeroInvoice.lineAmountTypes;
        this.status= xeroInvoice.status;
        this.totalAmounts ={
            subTotal: (xeroInvoice.subTotal??0) + (xeroInvoice.totalTax??0),
            totalTax: xeroInvoice.totalTax,
            total: xeroInvoice.total
        }
        this.accountCode = xeroInvoice?.lineItems?.[0]?.accountCode
        this.taxType = xeroInvoice?.lineItems?.[0]?.taxType
        this.project= {
            id: crmInvoice.project.id,
            name: crmInvoice.project.title,
            type: crmInvoice.project.type,
        };
        this.organization = {
            id: crmInvoice.organization.id,
            name: crmInvoice.organization.name,
            xeroId: xeroInvoice.contact?.contactID,
        };
        this.lineItems = (xeroInvoice.lineItems ?? []).map((invoice: any) => ({
          ...invoice,
          id: crmInvoice.scheduleId,
        }));
        this.attachments = (attachments).map((file: any) => ({
          type: file.mimeType,
          name: file.fileName,
          uniqueName: file.fileName,
          fileId: file.attachmentID,
          url: file.url
        }))
    }
}