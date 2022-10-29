import Joi from 'joi';
import { BaseRule } from './baseRules';

let expenseSheetRules = {
  validateCreate: Joi.object({
    label: Joi.string().required(),
    projectId: Joi.number().required().allow(null),
    attachments: Joi.array().required().min(0).allow(null),
    expenseSheetExpenses: Joi.array().required().min(1),
  }).unknown(false),

  validateUpdate: Joi.object({
    label: Joi.string().required(),
    projectId: Joi.number().required().allow(null),
    attachments: Joi.array().required().min(0).allow(null),
    expenseSheetExpenses: Joi.array().required().min(1),
  }).unknown(false),

  validateSheetAction: Joi.object({
    sheets: Joi.array().required().min(1),
    // isBillable: Joi.boolean().required().allow(null),
    // notes: Joi.string().required().allow(null),
  }).unknown(false),
};

export default expenseSheetRules = expenseSheetRules;
