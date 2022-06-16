import { Request, Response, NextFunction } from 'express';
import { Organization } from '../entities/organization';
import { getManager } from 'typeorm';
export class ExportController {
  async export(req: Request, res: Response, next: NextFunction) {
    let type = req.params.type;
    let ENTITY;
    try {
      switch (type) {
        case 'ORG':
          ENTITY = Organization;
        default:
          ENTITY = Organization;
      }
      let manager = getManager();
      let organizations = await manager.find(ENTITY);

      return res.status(200).json({
        success: true,
        message: 'Here here',
        data: organizations,
      });
    } catch (e) {
      next(e);
    }
  }
}
