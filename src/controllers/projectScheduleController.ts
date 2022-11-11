import { ProjectScheduleDTO } from './../dto';
import { BaseController } from './baseController';
import { Request, Response, NextFunction } from 'express';
import { OpportunityRepository } from './../repositories/opportunityRepository';
import { getCustomRepository } from 'typeorm';
import { ProjectScheduleRepository } from 'src/repositories/projectScheduleRepository';

export class OpportunityController extends BaseController<
  ProjectScheduleDTO,
  ProjectScheduleRepository
> {}
