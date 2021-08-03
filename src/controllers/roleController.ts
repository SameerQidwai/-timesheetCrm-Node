import { Request, Response, NextFunction } from 'express';
import { Role } from './../entities/role';
import { RoleRepository } from './../repositories/roleRepository';
import { getCustomRepository } from 'typeorm';
import { BaseController } from './baseController';

export class RoleController extends BaseController<Role, RoleRepository> {
  async updatePermissions(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(RoleRepository);
      let id = req.params.id;
      let role = await repository.updatePermissions(parseInt(id), req.body);
      res.status(200).json({
        success: true,
        message: 'Created Successfully',
        data: role,
      });
    } catch (e) {
      next(e);
    }
  }
}
