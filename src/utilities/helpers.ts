import { SystemVariableValueType } from '../constants/constants';
import { SystemVariable } from '../entities/systemVariable';

export function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}

export function parseSystemVariable(variable: SystemVariable) {
  let returnValue;
  switch (variable.type) {
    case SystemVariableValueType.BOOLEAN:
      returnValue = parseInt(variable.value) === 1 ? true : false;
      break;
    case SystemVariableValueType.NUMBER:
      returnValue = parseInt(variable.value);
      break;
    default:
      returnValue = false;
  }

  return returnValue;
}
