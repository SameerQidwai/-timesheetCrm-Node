import Joi from 'joi';
import { BaseRule } from './baseRules';

let organizationXLSXRules: BaseRule = {
  validateCreate: Joi.object({
    Name: Joi.string().required(),
    'Business Type': Joi.number().required(),
  }).unknown(true),

  validateUpdate: Joi.object({}),
};

export default organizationXLSXRules = organizationXLSXRules;
