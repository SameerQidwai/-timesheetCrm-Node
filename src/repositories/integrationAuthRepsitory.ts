import { EntityRepository, Repository, } from 'typeorm';
// import xero  from '../../xero-config'
import {XeroClient, Invoice }  from 'xero-node'
import dotenv from 'dotenv';
import moment from 'moment';
import { IntegrationAuth } from '../entities/integrationAuth';

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
    redirectUris: [`http://localhost:3301/api/v1/integration/callback?tool=zero`],
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
@EntityRepository(IntegrationAuth)
export class IntegrationAuthRepsitory extends Repository<IntegrationAuth> {
  async xeroAuthLogin(): Promise<string> {
    try {
      console.log('I reached to login repo')
    const consentUrl = await xero.buildConsentUrl();
    return consentUrl
    } catch (e) {
      return ''
    }
  }

  // async createInvoice(req: Request, res: Response, next: NextFunction) {
  //   try {
  //       const consentUrl = await xero.buildConsentUrl();
  //       // console.log(consentUrl, 'here we are here we are')
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

  async xeroAuthCallback(authId: number, url: string): Promise<boolean> {
    console.log('I came back to callback repo', url)
    try {
        let tokenSet = await xero.apiCallback(url);
        console.log(tokenSet)
        await xero.setTokenSet(tokenSet)
        let xeroAuth: IntegrationAuth[] = await this.find({
          where: {
            userId: authId,
            toolName: 'xero',
          }
        })

        let dbToken ={
          userId: authId,
          refreshToken: tokenSet.refresh_token,
          expiresIn: tokenSet.expires_in,
          accessToken: tokenSet.access_token,
          idToken: tokenSet.id_token,
          tokenSet: JSON.stringify(tokenSet),
          toolName: 'xero'
        }
        
        if (xeroAuth ){
          await this.update(xeroAuth[0].id, dbToken)
        }else{
          await this.save(dbToken)
        }
        // await xero.updateTenants(false)
        // const activeTenant = xero.tenants[0]
        // const invoicesRequest = await xero.accountingApi.getInvoices(activeTenant.tenantId)
        // console.log(invoicesRequest); // Store the token set in the session
        // res.send('<script>window.close();</script>');
        return true
    } catch (e) {
      console.log(e)
      return false
    }
  }

}
