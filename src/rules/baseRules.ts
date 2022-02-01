import { ObjectSchema } from 'joi';

export interface leaveRequestBaseRule {
  createRules: ObjectSchema<any>;
  validateUpdate: ObjectSchema<any>;
}
