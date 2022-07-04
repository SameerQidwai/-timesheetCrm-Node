import Joi from 'joi';
import { BaseRule } from './baseRules';

let subContractorXLSXRules: BaseRule = {
  validateCreate: Joi.object({
    Email: Joi.string().email().required(),
    Password: Joi.string().required(),
    'Role ID': Joi.number().required(),
    'Contact Person ID': Joi.number().required(),
    'Organization ID': Joi.number().required(),
  }).unknown(true),

  validateUpdate: Joi.object({}),
};

export default subContractorXLSXRules = subContractorXLSXRules;
