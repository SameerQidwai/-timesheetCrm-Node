import { Request, Response, NextFunction } from 'express';
import { IntegrationAuthRepsitory } from '../repositories/integrationAuthRepsitory';
import { getCustomRepository } from 'typeorm';


export class integrationAuthController {
  async integrationAuthLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const tool = req.query?.tool
      console.log('I reached to login controller', tool)
      const repository = getCustomRepository(IntegrationAuthRepsitory);
      if (tool === 'xero'){
        let xeroUrl = await repository.xeroAuthLogin()
        console.log('I came back to login controller', xeroUrl)
        res.redirect(xeroUrl)
      }else{
        res.status(400).json({
          success: false,
          message: 'Something Occured While Connecting',
        });
      }
    } catch (e) {
      next(e);
    }
  }

  async integrationAuthCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = res.locals.jwtPayload.id;
      const tool = req.query?.tool
      console.log('I print from line 30 inside callback', tool, '  ', userId)
      const callbackUrl = req.url ?? ''
      const repository = getCustomRepository(IntegrationAuthRepsitory);
      let connected = await repository.xeroAuthCallback(userId, callbackUrl)
      res.send(`<script> window.opener.postMessage('close', 'http://localhost:3000/invoice')</script>`);
    } catch (e) {
        next(e);
    }
  }

}
