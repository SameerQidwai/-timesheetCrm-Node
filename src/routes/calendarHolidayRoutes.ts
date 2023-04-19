import { Router } from 'express';
import { can } from './../middlewares/can';
import { Action, Resource } from './../constants/authorization';
import { isLoggedIn } from './../middlewares/loggedIn';
import { CalendarHolidayController } from '../controllers/calendarHolidayController';
import { CalendarHolidayRepository } from '../repositories/calendarHolidayRepository';

const router = Router();
const contr = new CalendarHolidayController(CalendarHolidayRepository);

router
  .route('/')
  .get(contr.index.bind(contr))
  .post(
    [isLoggedIn, can(Action.ADD, Resource.ADMIN_OPTIONS)],
    contr.create.bind(contr)
  );

router.route('/keyValueFormat').get(contr.indexAlternate.bind(contr));

router
  .route('/:id')
  .get(
    [isLoggedIn, can(Action.READ, Resource.ADMIN_OPTIONS)],
    contr.get.bind(contr)
  )
  .put(
    [isLoggedIn, can(Action.UPDATE, Resource.ADMIN_OPTIONS)],
    contr.update.bind(contr)
  )
  .delete(
    [isLoggedIn, can(Action.UPDATE, Resource.ADMIN_OPTIONS)],
    contr.delete.bind(contr)
  );

export default router;
