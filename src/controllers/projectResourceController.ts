import { Request, Response, NextFunction } from 'express';
import { getCustomRepository } from 'typeorm';
import { ProjectRepository } from './../repositories/projectRepository';

export class ProjectResourceController {
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
  //     });
  // }

  async index(req: Request, res: Response, next: NextFunction) {
    try {
      console.log('controller - index: ', this);
      const repository = getCustomRepository(ProjectRepository);
      let projectId = req.params.projectId;
      let milestoneId = req.params.milestoneId;
      let records = await repository.getSelectedResources(
        parseInt(projectId),
        parseInt(milestoneId)
      );
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
      let milestoneId = req.params.milestoneId;
      let record = await repository.addResource(
        parseInt(projectId),
        parseInt(milestoneId),
        req.body
      );
      console.log('record: ', record);
      res.status(200).json({
        success: true,
        message: 'Created Resource Successfully',
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
      let milestoneId = req.params.milestoneId;
      let record = await repository.updateResource(
        parseInt(projectId),
        parseInt(milestoneId),
        parseInt(id),
        req.body
      );
      res.status(200).json({
        success: true,
        message: `Updated Resource Successfully`,
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
      let milestoneId = req.params.milestoneId;
      let record = await repository.findOneCustomResource(
        parseInt(projectId),
        parseInt(milestoneId),
        parseInt(id)
      );
      if (!record) throw new Error('not found');
      res.status(200).json({
        success: true,
        message: `Get Successfully`,
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
      let milestoneId = req.params.milestoneId;
      let record = await repository.deleteCustomResource(
        parseInt(projectId),
        parseInt(milestoneId),
        parseInt(id)
      );
      res.status(200).json({
        success: true,
        message: `Deleted Resource Successfully`,
        data: record,
      });
    } catch (e) {
      next(e);
    }
  }
}
