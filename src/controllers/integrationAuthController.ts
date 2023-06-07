import { Request, Response, NextFunction } from 'express';
import { IntegrationAuthRepsitory } from '../repositories/integrationAuthRepsitory';
import { getCustomRepository } from 'typeorm';
import { IntegrationAuth } from '../entities/integrationAuth';

export class integrationAuthController {
  async integrationAuthLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const tool = req.params.toolName;
      // let authId = res?.locals?.jwtPayload?.id
      const repository = getCustomRepository(IntegrationAuthRepsitory);
      if (tool === 'xero') {
        let xeroUrl = await repository.xeroAuthLogin();
        // res.redirect(xeroUrl)
        return res.status(200).json({
          success: true,
          message: 'redirecting to auth',
          data: xeroUrl,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Something Occured While Connecting',
        });
      }
    } catch (e) {
      next(e);
    }
  }

  async integrationAuthCallback(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = 1;
      const tool = req.params.toolName;
      const callbackUrl = req.url ?? '';
      const repository = getCustomRepository(IntegrationAuthRepsitory);
      let connected = await repository.xeroAuthCallback(userId, callbackUrl);
      res.send(
        `<script> window.opener.postMessage('close', 'http://localhost:3000/invoice')</script>`
      );
    } catch (e) {
      next(e);
    }
  }

  async integrationTools(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(IntegrationAuthRepsitory);
      const tool = req.params.toolName;
      let records = [];
      if (tool === 'all') {
        records = await repository.getAllToolsLogin();
      } else {
        records = await repository.getToolLogin(tool);
      }
      return res.status(200).json({
        success: true,
        message: 'redirecting to auth',
        data: records,
      });
    } catch (e) {
      next(e);
    }
  }

  async integrationLogoutTool(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(IntegrationAuthRepsitory);
      const tool = req.params.toolName;

      await repository.logoutTool(tool);

      return res.status(200).json({
        success: true,
        message: `${tool} LogOut`,
      });
    } catch (e) {
      next(e);
    }
  }

  async toolOrganizations(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(IntegrationAuthRepsitory);
      const tool = req.params.toolName;
      let records = []
      if (tool === 'xero') {
        console.log("I got here")
         records = await repository.xeroOrganization();
      }
      return res.status(200).json({
        success: true,
        message: `${tool} true`,
        data: records
      });
    } catch (e) {
      next(e);
    }
  }
  async toolAssets(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(IntegrationAuthRepsitory);
      const tool = req.params.toolName;

      let records = {}
      if (tool === 'xero') {
         records = await repository.xeroToolAssets(req.body);
      }
      console.log(records)
      return res.status(200).json({
        success: true,
        message: `${tool} true`,
        data: records
      });
    } catch (e) {
      next(e);
    }
  }
}
