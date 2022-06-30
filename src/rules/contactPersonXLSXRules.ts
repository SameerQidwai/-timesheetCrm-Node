import Joi from 'joi';
import { BaseRule } from './baseRules';

let contactPersonXLSXRules: BaseRule = {
  validateCreate: Joi.object({
    'First Name': Joi.string().required(),
    'Last Name': Joi.string().required(),
    Gender: Joi.string().required(),
    'State ID': Joi.number().required(),
  }).unknown(true),

  validateUpdate: Joi.object({}),
};

export default contactPersonXLSXRules = contactPersonXLSXRules;
