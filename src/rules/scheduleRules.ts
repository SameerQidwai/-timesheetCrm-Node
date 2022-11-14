import Joi from 'joi';

const segment = Joi.object().keys({
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
  amount: Joi.number().required(),
});

let scheduleRules = {
  validateCreate: Joi.object({
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
    notes: Joi.string().required().allow(null).allow(''),
    amount: Joi.number().required(),
    segments: Joi.array().items(segment),
  }).unknown(false),

  validateUpdate: Joi.object({
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
    notes: Joi.string().required().allow(null).allow(''),
    amount: Joi.number().required(),
    segments: Joi.array().items(segment),
  }),
};

export default scheduleRules = scheduleRules;
