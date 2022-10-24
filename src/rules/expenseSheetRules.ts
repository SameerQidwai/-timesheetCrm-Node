import Joi from 'joi';
import { BaseRule } from './baseRules';

let expenseSheetRules: BaseRule = {
  validateCreate: Joi.object({
    label: Joi.string().required(),
    projectId: Joi.number().optional().allow(null),
  }).unknown(false),

  validateUpdate: Joi.object({}),
};

export default expenseSheetRules = expenseSheetRules;
