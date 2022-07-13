import { ObjectSchema } from 'joi';

export interface BaseRule {
  validateCreate: ObjectSchema<any>;
  validateUpdate: ObjectSchema<any>;
}
