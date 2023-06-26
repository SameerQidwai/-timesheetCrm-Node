import { Request, Response, NextFunction } from 'express';
import { getCustomRepository, getRepository } from 'typeorm';
import { InvoiceRepsitory } from '../repositories/invoiceRepsitory';
import moment from 'moment-timezone';
import { Moment } from 'moment';

export class invoiceController {
  async index(req: Request, res: Response, next: NextFunction) {
    try {
      let repository = getCustomRepository(InvoiceRepsitory);
      let records = await repository.getAllActive();
      return res.status(200).json({
        success: !!records.length,
        message: records.length ? 'Invoices Found' : 'No Inovice Found',
        data: records,
      });
    } catch (e) {
      next(e);
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

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      let repository = getCustomRepository(InvoiceRepsitory);
      let records = await repository.createAndSave(req.body);
      return res.status(200).json(records);
    } catch (e) {
      next(e);
    }
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      let repository = getCustomRepository(InvoiceRepsitory);
      let invoiceId = req.params.invoiceId;
      let record = await repository.findOneCustom(invoiceId);
      if (!record) throw new Error('not found');
      res.status(200).json({
        success: true,
        message: `Get`,
        data: record,
      });
    } catch (e) {
      next(e);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      let repository = getCustomRepository(InvoiceRepsitory);
      let invoiceId = req.params.invoiceId;
      let record = await repository.updateAndReturn(invoiceId, req.body);
      res.status(200).json(record);
    } catch (e) {
      next(e);
    }
  }

  async actions(req: Request, res: Response, next: NextFunction) {
    try {
      let repository = getCustomRepository(InvoiceRepsitory);
      let invoiceId = req.params.invoiceId;
      let action = req.params.action
      let message = await repository.actionInvoice(invoiceId, action);
      res.status(200).json({
        success: true,
        message,
      });
    } catch (e) {
      next(e);
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
