import { InvoicesInterface } from '../utilities/interfaces';
import { Invoice } from '../entities/invoice';
import { LineAmountTypes, LineItem, LineItemItem, Invoice as XeroInvoce } from 'xero-node';
import { AttachmentsResponse } from './attachmentResponses';
import dotenv from 'dotenv';
dotenv.config();
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
        purchaseOrder: {
          id: tempCrmInvoice.purchaseOrder.id,
          orderNo: tempCrmInvoice.purchaseOrder.orderNo,
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
    purchaseOrderId: number;
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
    purchaseOrder: {
        id: number;
        orderNo: String;
    };
    organization: {
        id: number;
        name: string;
        xeroId?: string;
    };
    lineItems?: LineItem[];
    attachments: any;
    
    constructor(xeroInvoice: XeroInvoce, crmInvoice: any=[], attachments: any = []) {
        this.id = crmInvoice.id;
        this.invoiceId =  crmInvoice.invoiceId;
        this.reference = crmInvoice.reference;
        this.projectId= crmInvoice.projectId;
        this.scheduleId= crmInvoice.scheduleId;
        this.purchaseOrderId= crmInvoice.purchaseOrderId;
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
            id: crmInvoice.projectId,
            name: crmInvoice.projectTitle,
            type: crmInvoice.projectType,
        };
        this.purchaseOrder= {
            id: crmInvoice.purchaseOrderId,
            orderNo: crmInvoice.orderNo,
        };
        this.organization = {
            id: crmInvoice.organizationId,
            name: crmInvoice.organizationName,
            xeroId: xeroInvoice.contact?.contactID,
        };
        this.lineItems = (xeroInvoice.lineItems ?? []).map((invoice: any, index:number) => ({
          ...invoice,
          hours: invoice.quantity,
          quantity: crmInvoice.projectType == 1 ? '-' : invoice.quantity,
          id: crmInvoice.scheduleId||index,
        }));
        this.attachments = (attachments).map((file: any) => ({
          type: file.mimeType,
          name: file.fileName,
          uniqueName: file.uniqueName ?? file.fileName,
          fileId: file.fileId,
          xeroFileId: file.attachmentID,
          attachXero: !!file.attachXero,
          includeOnline: !!file.includeOnline,
          url: file.url|| file.uniqueName? `${process.env.SERVER_API}/api/v1/files/${file.uniqueName}` : null,
          thumbUrl: `${process.env.ENV_URL}${thumbUrlGenerator(file.mimeType)}`
        }))
    }
}

//Helper function
function thumbUrlGenerator(type: string) {
  if (type === 'pdf') {
    return '/icons/pdf.png';
  } else if (type === 'doc' || type === 'docx') {
    return '/icons/doc.png';
  } else if (type === 'xls' || type === 'xlsx') {
    return '/icons/xls.png';
  } else if (type === 'ppt' || type === 'pptx') {
    return '/icons/ppt.png';
  } else if (type === 'csv') {
    return '/icons/csv.png';
  } else if (/(webp|svg|png|gif|jpg|jpeg|jfif|bmp|dpg|ico)$/i.test(type)) {
    return '/icons/img.png';
  } else {
    return '/icons/default.png';
  }
}

