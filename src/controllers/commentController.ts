import { Request, Response } from 'express';
import { CommentRepository } from './../repositories/commentRepository';
import { getCustomRepository } from 'typeorm';
import { EntityType } from '../constants/constants';

export class CommentController {
  async create(req: Request, res: Response) {
    const repository = getCustomRepository(CommentRepository);

    let content: string = req.body.content;
    let type: EntityType = req.params.type as EntityType;
    let id: number = parseInt(req.params.id);
    let response = await repository.createAndSave({
      type: type,
      target: id,
      content: content,
      attachments: req.body.attachments,
    });

    return res.status(200).json({
      success: true,
      // message: `Win Opportunity ${req.params.id}`,
      message: 'Comment Saved Successfully',
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

  async delete(req: Request, res: Response) {
    const repository = getCustomRepository(CommentRepository);

    let response: string = await repository.deleteComment(
      parseInt(req.params.id)
    );

    // if no timesheet found
    return res.status(200).json({
      success: true,
      // message: `Win Opportunity ${req.params.id}`,
      message: 'Delete target comment',
      data: response,
    });
  }
}
