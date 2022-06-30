import Joi from 'joi';
import { BaseRule } from './baseRules';

let opportunityXLSXRules: BaseRule = {
  validateCreate: Joi.object({
    'Panel ID': Joi.number().required(),
    'Organization ID': Joi.number().required(),
    Name: Joi.string().required(),
    'Type ID': Joi.number().required(),
    'Expected Start Date': Joi.date().required(),
    'Expected End Date': Joi.date().required(),
    'Work Hours Per Day': Joi.number().required(),
  }).unknown(true),

  validateUpdate: Joi.object({}),
};

export default opportunityXLSXRules = opportunityXLSXRules;
