import { Request, Response, NextFunction } from 'express';
import { getCustomRepository } from 'typeorm';
import { ProjectRepository } from '../repositories/projectRepository';

export class PurchaseOrderController {
  // async index(req: Request, res: Response, next: NextFunction) { try{}catch(e){next(e)}
  //     console.log("controller - index: ", this);
  //     const repository = getCustomRepository(ProjectRepository);
  //     let projectId = req.params.projectId;
  //     let records = await repository.getAllActiveResources(parseInt(projectId));
  //     console.log("records: ", records);
  //     res.status(200).json({
  //         success: true,
  //         message: "Get ALL",
  //         data: records
  // }d

  async index(req: Request, res: Response, next: NextFunction) {
    try {
      console.log('controller - index: ', this);
      const repository = getCustomRepository(ProjectRepository);
      let projectId = req.params.projectId;
      let records = await repository.getAllPurchaseOrders(parseInt(projectId));
      console.log('records: ', records);
      res.status(200).json({
        success: true,
        message: 'Get ALL Selected',
        data: records,
      });
    } catch (e) {
      next(e);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(ProjectRepository);
      let projectId = req.params.projectId;
      let record = await repository.addPurchaseOrder(
        parseInt(projectId),
        req.body
      );
      console.log('record: ', record);
      res.status(200).json({
        success: true,
        message: 'Created Purchase Order Successfully',
        data: record,
      });
    } catch (e) {
      next(e);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(ProjectRepository);
      let id = req.params.id;
      let projectId = req.params.projectId;
      let record = await repository.updatePurchaseOrder(
        parseInt(projectId),
        parseInt(id),
        req.body
      );
      res.status(200).json({
        success: true,
        message: `Updated Purchase Order Successfully`,
        data: record,
      });
    } catch (e) {
      next(e);
    }
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(ProjectRepository);
      let id = req.params.id;
      let projectId = req.params.projectId;
      let record = await repository.findOneCustomPurchaseOrder(
        parseInt(projectId),
        parseInt(id)
      );
      if (!record) throw new Error('not found');
      res.status(200).json({
        success: true,
        message: `Get`,
        data: record,
      });
    } catch (e) {
      next(e);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(ProjectRepository);
      let id = req.params.id;
      let projectId = req.params.projectId;
      let record = await repository.deletePurchaseOrder(
        parseInt(projectId),
        parseInt(id)
      );
      res.status(200).json({
        success: true,
        message: `Deleted Purchase Order Successfully`,
        data: record,
      });
    } catch (e) {
      next(e);
    }
  }
}
