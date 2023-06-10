import { EntityRepository, Repository } from 'typeorm';
// import xero  from '../../xero-config'
import { XeroClient, TokenSet } from 'xero-node';
import dotenv from 'dotenv';
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
  redirectUris: [`${process.env.SERVER_API}/api/v1/integration/xero/callback`],
  scopes: 'openid profile email accounting.transactions accounting.contacts accounting.contacts.read accounting.attachments offline_access files files.read'.split(
    ' '
  ),
  httpTimeout: 3000, // ms (optional)
  clockTolerance: 10, // seconds (optional)
  /* other configuration options */
});

// const invoices = {
//   invoices: [
//     {
//       type: Invoice.TypeEnum.ACCREC,
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
//       status: Invoice.StatusEnum.AUTHORISED,
//     },
//   ],
// };
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
      // delete tokenSet['scope'];
      let dbToken = {
        userId: authId,
        // refreshToken: tokenSet.refresh_token,
        // expiresIn: tokenSet.expires_in,
        // accessToken: tokenSet.access_token,
        // idToken: tokenSet.id_token,
        tokenSet: tokenSet,
        toolName: 'xero',
      };

      if (xeroAuth.length) {
        await this.update(xeroAuth[0].id, dbToken);
      } else {
        await this.save(dbToken);
      }
      return true;
    } catch (e) {
      console.log(e);
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
        let tokenSet = toolLogin.tokenSet as TokenSet;
        if (!tokenSet?.id_token) {
          throw new Error('not interated with xero');
        }
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

  async xeroOrganization(): Promise<any> {
    try {
      let integration = await this.findOne({ where: { toolName: 'xero' } });
      if (!integration) {
        throw new Error('No Integration Found');
      }
      let {xero , tenantId} = await integration.getXeroToken();
      if (!xero) {
        throw new Error('No Integration Found');
      }
      // const xeroContacts = await
      let [xeroRes, organizarions] = await Promise.all([
        xero.accountingApi.getContacts(tenantId),
        this.manager.find(Organization),
      ]);
      let xeroOrganizarions = xeroRes.body.contacts ?? [];

      const filteredOrgs = [];
      for (const org of organizarions) {
        if (org.abn) {
          for (const xOrg of xeroOrganizarions) {
            if (
              xOrg.taxNumber &&
              org.abn === xOrg.taxNumber.replace(/ /g, '')
            ) {
              filteredOrgs.push({
                name: org.name,
                id: org.id,
                xeroId: xOrg.contactID,
              });
              break;
            }
          }
        }
      }
      return filteredOrgs;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
  async xeroToolAssets(queries:{[key: string]: string}): Promise<any> {
    try {
      let integration = await this.findOne({ where: { toolName: 'xero' } });
      if (!integration) {
        throw new Error('No Integration Found');
      }
      let {xero , tenantId} = await integration.getXeroToken();
      if (!xero || !tenantId) {
        throw new Error('No Integration Found');
      }

      let promises: any = []

      if (queries.account){
        promises.push(()=>xero.accountingApi.getAccounts(tenantId, undefined, queries.account))
      }

      if (queries.taxType){
        promises.push(()=>xero.accountingApi.getTaxRates(tenantId, queries.taxType))
      }

      // const xeroContacts = await
      let promiseRes: any = await Promise.all(promises.map((apiCall: any) => apiCall()));

      let response:{[key: string]:object}= {}
      for (let item of promiseRes) {
        for (let key in item['body']) {
          response[key] = item['body'][key];
        }
      }
      return response
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}

// //Helper function 
// async function xeroAccounts (xero: any, tenantId?: string|null, where?: string){
//   let promise = xero.accountingApi.getAccounts(tenantId, undefined)
//   return promise
// }
// async function xeroTaxRates (xero: any, tenantId?: string|null, where?: string){
//   let promise = xero.accountingApi.getTaxRates(tenantId)
//   return promise
// }