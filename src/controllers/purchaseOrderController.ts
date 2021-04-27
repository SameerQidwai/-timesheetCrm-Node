import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';
import { ProjectRepository } from '../repositories/projectRepository';

export class PurchaseOrderController {
  // async index(req: Request, res: Response) {
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

  async index(req: Request, res: Response) {
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
  }

  async create(req: Request, res: Response) {
    const repository = getCustomRepository(ProjectRepository);
    let projectId = req.params.projectId;
    let record = await repository.addPurchaseOrder(
      parseInt(projectId),
      req.body
    );
    console.log('record: ', record);
    res.status(200).json({
      success: true,
      message: 'Create',
      data: record,
    });
  }

  async update(req: Request, res: Response) {
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
      message: `Update ${req.params.id}`,
      data: record,
    });
  }

  async get(req: Request, res: Response) {
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
      message: `Get ${req.params.id}`,
      data: record,
    });
  }

  async delete(req: Request, res: Response) {
    const repository = getCustomRepository(ProjectRepository);
    let id = req.params.id;
    let projectId = req.params.projectId;
    let record = await repository.deletePurchaseOrder(
      parseInt(projectId),
      parseInt(id)
    );
    res.status(200).json({
      success: true,
      message: `Delete ${req.params.id}`,
      data: record,
    });
  }
}
