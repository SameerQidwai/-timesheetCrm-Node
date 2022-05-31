import { Router } from 'express';
import { SampleRepository } from './../repositories/sampleRepository';
import { SampleController } from './../controllers/sampleController';

const router = Router();
let sampleContr = new SampleController(SampleRepository);
router
  .route('/')
  .get(sampleContr.index.bind(sampleContr))
  .post(sampleContr.create.bind(sampleContr));

router
  .route('/:id')
  .get(sampleContr.get.bind(sampleContr))
  .put(sampleContr.update.bind(sampleContr))
  .delete(sampleContr.delete.bind(sampleContr));

export default router;
