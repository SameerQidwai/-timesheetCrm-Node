import Joi from 'joi';
import { BaseRule } from './baseRules';

let employeeXLSXRules: BaseRule = {
  validateCreate: Joi.object({
    Email: Joi.string().email().required(),
    Password: Joi.string().required(),
    'Role ID': Joi.number().required(),
    'Contact Person ID': Joi.number().required(),
  }).unknown(true),

  validateUpdate: Joi.object({}),
};

export default employeeXLSXRules = employeeXLSXRules;
