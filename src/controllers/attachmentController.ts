import { Request, Response } from 'express';
import { AttachmentRepository } from './../repositories/attachmentRepository';
import { getCustomRepository } from 'typeorm';
import { EntityType } from '../constants/constants';

export class AttachmentController {
  async create(req: Request, res: Response) {
    const repository = getCustomRepository(AttachmentRepository);

    let type: EntityType = req.params.type as EntityType;
    let response: string = await repository.createAndSave({
      files: req.body.files,
      type: type,
      target: parseInt(req.params.id),
    });

    // if no timesheet found
    return res.status(200).json({
      success: true,
      // message: `Win Opportunity ${req.params.id}`,
      message: 'Attachment Save Successfully',
      data: response,
    });
  }

  async show(req: Request, res: Response) {
    const repository = getCustomRepository(AttachmentRepository);

    let type: EntityType = req.params.type as EntityType;
    let response: string = await repository.getTargetAttachments(
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
    const repository = getCustomRepository(AttachmentRepository);

    let response: string = await repository.deleteAttachment(
      parseInt(req.params.id)
    );

    // if no timesheet found
    return res.status(200).json({
      success: true,
      // message: `Win Opportunity ${req.params.id}`,
      message: 'Delete target attachment',
      data: response,
    });
  }
}
