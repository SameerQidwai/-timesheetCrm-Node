import Joi from 'joi';
import { BaseRule } from './baseRules';

let projectXLSXRules: BaseRule = {
  validateCreate: Joi.object({
    'Panel ID': Joi.number().required(),
    'Organization ID': Joi.number().required(),
    Name: Joi.string().required(),
    'Type ID': Joi.number().required(),
    'Start Date': Joi.required(),
    'End Date': Joi.required(),
    'Work Hours Per Day': Joi.number().required(),
  }).unknown(true),

  validateUpdate: Joi.object({}),
};

export default projectXLSXRules = projectXLSXRules;
