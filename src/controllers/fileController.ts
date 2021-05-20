import { Request, Response } from 'express';
import { FileRepository } from './../repositories/fileRepository';
import { getCustomRepository } from 'typeorm';

export class FileController {
  async create(req: Request, res: Response) {
    const repository = getCustomRepository(FileRepository);
    let response: string = await repository.createAndSave(req.files);

    // if no timesheet found
    return res.status(200).json({
      success: true,
      // message: `Win Opportunity ${req.params.id}`,
      message: 'Files Uploaded Succesfully',
      data: response,
    });
  }
}
