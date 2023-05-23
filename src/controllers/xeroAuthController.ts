import { Request, Response, NextFunction } from 'express';
import xero from '../../xero-config'

export class XeroAuthController {
  async auth(req: Request, res: Response, next: NextFunction) {
    try {
      
    const consentUrl = await xero.buildConsentUrl();
    res.redirect(consentUrl)
    } catch (e) {
      next(e);
    }
  }

  async callback(req: Request, res: Response, next: NextFunction) {
    try {
        const tokenSet = await xero.apiCallback(req.url);
        await xero.updateTenants(false)
        const activeTenant = xero.tenants[0]
        const invoicesRequest = await xero.accountingApi.getInvoices(activeTenant.tenantId)
        console.log(invoicesRequest); // Store the token set in the session
    return res.status(200).json({
      success: true,
      message: 'Mail sent',
      data: [],
    });
    } catch (e) {
        next(e);
    }
  }

}
