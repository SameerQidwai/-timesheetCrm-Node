import { Request, Response, NextFunction } from 'express';
import { getCustomRepository, getRepository } from 'typeorm';
import { InvoiceRepsitory } from '../repositories/invoiceRepsitory';
import moment, { Moment } from 'moment';

export class invoiceController {
  async invoices(req: Request, res: Response, next: NextFunction) {
    try {
      let repository = getCustomRepository(InvoiceRepsitory);
      let records = await repository.getInvoices();
      return res.status(200).json({
        success: true,
        message: records.length
          ? 'Entries Found'
          : 'No Entry Found Against This Project',
        data: records,
      });
    } catch (e) {
      console.log(e);
    }
  }

  async invoiceData(req: Request, res: Response, next: NextFunction) {
    try {
      let projectId = parseInt(req.params.projectId);
      let startDate: Moment | string = req.params.startDate;
      let endDate: Moment | string = req.params.endDate;
      let repository = getCustomRepository(InvoiceRepsitory);

      if (!projectId) {
        throw new Error('Project Is Not Defined');
      }

      let records = await repository.getInvoiceData(
        projectId,
        startDate,
        endDate
      );

      return res.status(200).json({
        success: true,
        message: records.length
          ? 'Entries Found'
          : 'No Entry Found Against This Project',
        data: records,
      });
    } catch (e) {
      next(e);
    }
  }

  async saveInvoices(req: Request, res: Response, next: NextFunction) {
    try {
      let repository = getCustomRepository(InvoiceRepsitory);
      let records = await repository.createInvoice(req.body);
      return res.status(200).json({
        success: true,
        message:  'No Entry Found Against This Project',
        // data: records,
      });
    } catch (e) {
      console.log(e);
    }
  }
  async clientProjects(req: Request, res: Response, next: NextFunction) {
    try {
      let orgId = parseInt(req.params.orgId);
      let repository = getCustomRepository(InvoiceRepsitory);
      if (!orgId) {
        throw new Error('Organization Is Not Defined');
      }
      // startDate = moment(startDate)
      // endDate = moment(endDate)
      let records = await repository.getClientProjects(orgId);

      return res.status(200).json({
        success: records.length ? true : false,
        message: records.length
          ? 'Entries Found'
          : 'No Entry Found Against This Project',
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
