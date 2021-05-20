import { Request, Response } from 'express';
import { CommentRepository } from './../repositories/commentRepository';
import { getCustomRepository } from 'typeorm';
import { EntityType } from '../constants/constants';

export class CommentController {
  async create(req: Request, res: Response) {
    const repository = getCustomRepository(CommentRepository);

    let response: string = await repository.createAndSave(req.body);

    // if no timesheet found
    return res.status(200).json({
      success: true,
      // message: `Win Opportunity ${req.params.id}`,
      message: 'Comment Save Successfully',
      data: response,
    });
  }

  async show(req: Request, res: Response) {
    const repository = getCustomRepository(CommentRepository);

    let type: EntityType = req.params.type as EntityType;
    let response: string = await repository.getTargetComments(
      type,
      parseInt(req.params.id)
    );

    // if no timesheet found
    return res.status(200).json({
      success: true,
      // message: `Win Opportunity ${req.params.id}`,
      message: 'Get target attachments',
      data: response,
    });
  }
}
