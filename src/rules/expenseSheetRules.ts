import Joi from 'joi';
import { BaseRule } from './baseRules';

let expenseSheetRules = {
  validateCreate: Joi.object({
    label: Joi.string().required(),
    projectId: Joi.number().required().allow(null),
    attachments: Joi.array().required().min(0),
    expenseSheetExpenses: Joi.array().required(),
  }).unknown(false),

  validateUpdate: Joi.object({
    label: Joi.string().required(),
    projectId: Joi.number().required().allow(null),
    attachments: Joi.array().required().min(0),
    expenseSheetExpenses: Joi.array().required(),
  }),
  validateExpenseAdd: Joi.object({}),
};

export default expenseSheetRules = expenseSheetRules;
