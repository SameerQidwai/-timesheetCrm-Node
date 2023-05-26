import { Request, Response, NextFunction } from 'express';
import { getCustomRepository, getRepository } from 'typeorm';
import { InvoiceRepsitory } from '../repositories/invoiceRepsitory';
import moment, { Moment } from 'moment';

export class invoiceController {
  async invoiceData(req: Request, res: Response, next: NextFunction) {
    try {
      let mileId = parseInt(req.params.mileId)
      let startDate: Moment|string = req.params.startDate
      let endDate: Moment|string = req.params.endDate
      let repository = getCustomRepository(InvoiceRepsitory)
      if (!mileId){
        throw new Error ('Milestone Is Not Defined')
      }
      if (!startDate|| !endDate){
        throw new Error ('Date Range Not Defined')
      }
      console.log(mileId, startDate, endDate, 'hit it')
      // startDate = moment(startDate)
      // endDate = moment(endDate)
      let records = await repository.getInvoiceData(mileId, startDate, endDate)
      return res.status(200).json({
        success: true,
        message: 'redirecting to auth',
        data: records,
      });
    } catch (e) {
      next(e);
    }
  }

}
