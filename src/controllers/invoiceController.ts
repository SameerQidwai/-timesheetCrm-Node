import { Request, Response, NextFunction } from 'express';
import { getCustomRepository, getRepository } from 'typeorm';
import { InvoiceRepsitory } from '../repositories/invoiceRepsitory';
import moment, { Moment } from 'moment';

export class invoiceController {
  async invoiceData(req: Request, res: Response, next: NextFunction) {
    try {
      let proId = parseInt(req.params.proId)
      let startDate: Moment|string = req.params.startDate
      let endDate: Moment|string = req.params.endDate
      let repository = getCustomRepository(InvoiceRepsitory)
      if (!proId){
        throw new Error ('Milestone Is Not Defined')
      }
      if (!startDate|| !endDate){
        throw new Error ('Date Range Not Defined')
      }
      // startDate = moment(startDate)
      // endDate = moment(endDate)
      let records = await repository.getInvoiceData(proId, startDate, endDate)

      return res.status(200).json({
        success: true,
        message: records.length? 'Entries Found': 'No Entry Found Against This Project',
        data: records,
      });
    } catch (e) {
      next(e);
    }
  }

  // async invoiceOrganization(req: Request, res: Response, next: NextFunction) {
  //   try {
  //     let repository = getCustomRepository(InvoiceRepsitory)
  //     let records = await repository.getOrganization()
  //     return res.status(200).json({
  //       success: true,
  //       message: records.length? 'Entries Found': 'No Entry Found Against This Project',
  //       data: records,
  //     });
  //   }catch (e){
  //     next(e)
  //   }
  // }

}
