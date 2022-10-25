import Joi from 'joi';
import { BaseRule } from './baseRules';

let expenseSheetRules = {
  validateCreate: Joi.object({
    label: Joi.string().required(),
    projectId: Joi.number().optional().allow(null),
    expenseSheetExpenses: Joi.array().required(),
  }).unknown(false),

  validateUpdate: Joi.object({}),
  validateExpenseAdd: Joi.object({}),
};

export default expenseSheetRules = expenseSheetRules;
