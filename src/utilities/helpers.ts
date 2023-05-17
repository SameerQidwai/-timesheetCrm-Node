import { GlobalSetting } from '../entities/globalSetting';
import { GlobalSettingValueType } from '../constants/constants';
import { SystemVariable } from '../entities/systemVariable';

export function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}

export function parseGlobalSetting(variable: GlobalSetting) {
  let returnValue;
  switch (variable.dataType) {
    case GlobalSettingValueType.BOOLEAN:
      returnValue = parseInt(variable.keyValue) === 1 ? true : false;
      break;
    case GlobalSettingValueType.NUMBER:
      returnValue = parseInt(variable.keyValue);
      break;
    default:
      returnValue = false;
  }

  return returnValue;
}
