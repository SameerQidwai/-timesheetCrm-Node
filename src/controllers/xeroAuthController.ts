import { Request, Response, NextFunction } from 'express';
// import xero  from '../../xero-config'
import {XeroClient, Invoice }  from 'xero-node'
import dotenv from 'dotenv';
import moment from 'moment';

// const app: express.Application = express();

dotenv.config();

if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET ) {
  console.log(process.env.CLIENT_ID)
  console.log(process.env.CLIENT_SECRET )
  throw Error('Environment Variables not all set - please check your .env file in the project root or create one!')
}

 const xero = new XeroClient({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUris: [`http://localhost:3301/api/v1/xero/callback`],
    scopes: 'openid profile email accounting.transactions offline_access'.split(" "),
    httpTimeout: 3000, // ms (optional)
    clockTolerance: 10 // seconds (optional)
  /* other configuration options */
});

const invoices = {
    invoices: [
      {
        type: Invoice.TypeEnum.ACCREC,
        contact: {
          contactID: '3e776c4b-ea9e-4bb1-96be-6b0c7a71a37f'
        },
        lineItems: [
          {
            description: "Xero integration from here",
            quantity: 2.0,
            unitAmount: 20.0,
            accountCode: "200",
            taxType: "NONE",
            lineAmount: 40.0
          }
        ],
        date: moment().format('YYYY-MM-DD'),
        dueDate:  moment().add(7, 'days').format('YYYY-MM-DD'),
        reference: "XERO-Nodes",
        status: Invoice.StatusEnum.AUTHORISED
      }
    ]
};
export class XeroAuthController {
  async auth(req: Request, res: Response, next: NextFunction) {
    try {
      
    const consentUrl = await xero.buildConsentUrl();
    res.redirect(consentUrl)
    } catch (e) {
      next(e);
    }
  }

  async createInvoice(req: Request, res: Response, next: NextFunction) {
    try {
        const consentUrl = await xero.buildConsentUrl();
        // console.log(consentUrl, 'here we are here we are')
        return res.status(200).json({
            success: false,
            message: 'User Not Found',
            data: consentUrl,
          });
    } catch (e) {
      next(e);
    }
  }

  async callback(req: Request, res: Response, next: NextFunction) {
    try {
        const tokenSet = await xero.apiCallback(req.url);
        console.log(tokenSet)
        await xero.setTokenSet(tokenSet)
        await xero.updateTenants(false)
        const activeTenant = xero.tenants[0]
        const invoicesRequest = await xero.accountingApi.createInvoices(activeTenant.tenantId, invoices)
        // const invoicesRequest = await xero.accountingApi.getInvoices(activeTenant.tenantId)
        // console.log(invoicesRequest); // Store the token set in the session
        // res.send('<script>window.close();</script>');
        res.send(`<script> window.opener.postMessage('close', 'http://localhost:3000/invoice')</script>`);
    } catch (e) {
        next(e);
    }
  }

}
