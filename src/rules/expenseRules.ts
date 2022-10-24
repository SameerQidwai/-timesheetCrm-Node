import Joi from 'joi';
import { BaseRule } from './baseRules';

let expenseRules: BaseRule = {
  validateCreate: Joi.object({
    amount: Joi.number().required(),
    date: Joi.date().required(),
    isReimbursed: Joi.boolean().required(),
    isBillable: Joi.boolean().required(),
    notes: Joi.string().required().allow(null),
    expenseTypeId: Joi.number().required(),
    projectId: Joi.number().optional().allow(null),
  }).unknown(false),

  validateUpdate: Joi.object({}),
};

export default expenseRules = expenseRules;
