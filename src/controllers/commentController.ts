import { Request, Response, NextFunction } from 'express';
import { CommentRepository } from './../repositories/commentRepository';
import { getCustomRepository } from 'typeorm';
import { EntityType } from '../constants/constants';

export class CommentController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(CommentRepository);
      let userId = res.locals.jwtPayload.id;
      console.log(userId);
      let content: string = req.body.content;
      let type: EntityType = req.params.type as EntityType;
      let id: number = parseInt(req.params.id);
      let response = await repository.createAndSave(
        {
          targetType: type,
          target: id,
          content: content,
          attachments: req.body.attachments,
        },
        userId
      );

      response = {
        ...response,
        authorId: res.locals.user.id,
        author:
          res.locals.user.contactPersonOrganization.contactPerson.firstName,
      };

      return res.status(200).json({
        success: true,
        // message: `Win Opportunity ${req.params.id}`,
        message: 'Comment Saved Successfully',
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }

  async show(req: Request, res: Response, next: NextFunction) {
    try {
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
    } catch (e) {
      next(e);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
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
    } catch (e) {
      next(e);
    }
  }
}
