import Joi from 'joi';
import { LeaveRequestDTO } from 'src/dto';
import { leaveRequestBaseRule } from './baseRules';

let leaveRequestValidation: leaveRequestBaseRule = {
  createRules: Joi.object({
    description: Joi.required(),
    typeId: Joi.required(),
    workId: Joi.required(),
    entries: Joi.required(),
    attachments: Joi.required(),
  }),

  validateUpdate: Joi.object({}),
};

export default leaveRequestValidation = leaveRequestValidation;
