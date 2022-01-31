import { Router } from 'express';
import { LeaveRequestTypeRepository } from './../repositories/leaveRequestTypeRepository';
import { LeaveRequestTypeController } from './../controllers/leaveRequestTypeController';

const router = Router();
let leaveRequestTypeContr = new LeaveRequestTypeController(
  LeaveRequestTypeRepository
);
router
  .route('/')
  .get(leaveRequestTypeContr.index.bind(leaveRequestTypeContr))
  .post(leaveRequestTypeContr.create.bind(leaveRequestTypeContr));

router
  .route('/:id')
  .get(leaveRequestTypeContr.get.bind(leaveRequestTypeContr))
  .put(leaveRequestTypeContr.update.bind(leaveRequestTypeContr))
  .delete(leaveRequestTypeContr.delete.bind(leaveRequestTypeContr));

export default router;
