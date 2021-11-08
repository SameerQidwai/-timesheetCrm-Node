import { Request, Response, NextFunction } from 'express';
import { FileRepository } from './../repositories/fileRepository';
import { getCustomRepository } from 'typeorm';
import path from 'path';

export class FileController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(FileRepository);
      let userId = res.locals.jwtPayload.id;
      let response: string = await repository.createAndSave(req.files, userId);

      // if no timesheet found
      return res.status(200).json({
        success: true,
        // message: `Win Opportunity ${req.params.id}`,
        message: 'Files Uploaded Succesfully',
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }

  async show(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(FileRepository);
      let name = req.params.name;
      // let response: string = await repository.show(name);
      res.sendFile(path.join(__dirname, '../../public/uploads/' + name));
      // if no timesheet found
      // return res.status(200).json({
      //   success: true,
      //   // message: `Win Opportunity ${req.params.id}`,
      //   message: 'Files Uploaded Succesfully',
      //   data: response,
      // });
    } catch (e) {
      next(e);
    }
  }
}
