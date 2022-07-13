import Joi from 'joi';
import { BaseRule } from './baseRules';

let leaveRequestRules: BaseRule = {
  validateCreate: Joi.object({
    description: Joi.required(),
    typeId: Joi.required(),
    workId: Joi.required(),
    entries: Joi.required(),
    attachments: Joi.required(),
  }).unknown(true),

  validateUpdate: Joi.object({}),
};

export default leaveRequestRules = leaveRequestRules;
