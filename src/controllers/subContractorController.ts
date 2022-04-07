import { SubContractorDTO } from './../dto';
import { BaseController } from './baseController';
import { Request, Response, NextFunction } from 'express';
import { getCustomRepository } from 'typeorm';
import { SubContractorRepository } from './../repositories/subContractorRepository';

export class SubContractorController extends BaseController<
  SubContractorDTO,
  SubContractorRepository
> {
  async contactPersons(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(SubContractorRepository);
      let organizationId = req.query.organizationId?.toString();
      if (!organizationId) {
        throw new Error('organizationId is required');
      }
      let records = await repository.getAllContactPersons(
        parseInt(organizationId)
      );
      console.log('records: ', records);
      res.status(200).json({
        success: true,
        message: 'Get ALL',
        data: records,
      });
    } catch (e) {
      next(e);
    }
  }
}
