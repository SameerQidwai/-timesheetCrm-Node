import { EntityRepository, Repository } from 'typeorm';
// import xero  from '../../xero-config'
import { XeroClient, Invoice } from 'xero-node';
import dotenv from 'dotenv';
import moment from 'moment';
import jwt from 'jsonwebtoken';
import { IntegrationAuth } from '../entities/integrationAuth';
import { Organization } from '../entities/organization';

// const app: express.Application = express();

dotenv.config();

if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
  throw Error(
    'Environment Variables not all set - please check your .env file in the project root or create one!'
  );
}

const xero = new XeroClient({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUris: [`http://localhost:3301/api/v1/integration/zero/callback`],
  scopes: 'openid profile email accounting.transactions offline_access'.split(
    ' '
  ),
  httpTimeout: 3000, // ms (optional)
  clockTolerance: 10, // seconds (optional)
  /* other configuration options */
});

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
export class IntegrationAuthRepsitory extends Repository<IntegrationAuth> {
  async xeroAuthLogin(): Promise<string> {
    try {
      const consentUrl = await xero.buildConsentUrl();
      return consentUrl;
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

  async xeroAuthCallback(authId: number, url: string): Promise<boolean> {
    try {
      let tokenSet = await xero.apiCallback(url);
      await xero.setTokenSet(tokenSet);
      let xeroAuth: IntegrationAuth[] = await this.find({
        where: {
          userId: authId,
          toolName: 'xero',
        },
      });
      delete tokenSet['scope'];
      let dbToken = {
        userId: authId,
        // refreshToken: tokenSet.refresh_token,
        // expiresIn: tokenSet.expires_in,
        // accessToken: tokenSet.access_token,
        // idToken: tokenSet.id_token,
        tokenSet: JSON.stringify(tokenSet),
        toolName: 'xero',
      };

      if (xeroAuth.length) {
        await this.update(xeroAuth[0].id, dbToken);
      } else {
        await this.save(dbToken);
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  async getAllToolsLogin(): Promise<any> {
    try {
      return await this.find();
    } catch (e) {
      console.log(e);
    }
  }

  async getToolLogin(toolName: string): Promise<any> {
    let respsonse:
      | {
          id: number;
          toolName: string;
          loginName: string;
          loginEmail: string;
        }
      | {} = {};

    try {
      let result = await this.find({
        where: { toolName },
      });
      if (result.length) {
        let toolLogin: IntegrationAuth = result[0];
        let tokenSet = JSON.parse(toolLogin.tokenSet ?? '');
        let decodedToken = jwt.decode(tokenSet.id_token);
        if (typeof decodedToken === 'object' && decodedToken !== null) {
          respsonse = {
            id: toolLogin.id,
            toolName: toolLogin.toolName,
            loginName: decodedToken.name,
            loginEmail: decodedToken.email,
          };
        }
      }
      return respsonse;
    } catch (e) {
      console.log(e);
    }
  }

  async logoutTool(toolName: string): Promise<boolean> {
    try {
      await this.delete({ toolName: toolName });
      return true;
    } catch {
      return false;
    }
  }

  async xeroOrganization(): Promise<any>{
    try {
      let integration = await this.findOne({
        where: { toolName: 'xero' },
      });

      if (!integration){
        throw new Error ('No Integration Found')
      }
      

      let tokenSet = JSON.parse(integration.tokenSet ?? '');
      await xero.setTokenSet(tokenSet)
      await xero.refreshToken()
      await xero.updateTenants()
      const activeTenant = xero.tenants[0]
      const xeroContacts = await xero.accountingApi.getContacts(activeTenant.tenantId)

      let organizarions= await this.manager.find(Organization)

      for(let org in organizarions){

        // if (org.)

      }

    }catch {
      return false
    }
  }
}
