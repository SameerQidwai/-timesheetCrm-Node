import {
  GlobalVariableLabelValueArrayDTO,
  GlobalVariableLabelValueDTO,
  GlobalVariableValueDTO,
} from '../dto';
import { EntityRepository, Repository } from 'typeorm';
import { GlobalVariableValue } from '../entities/globalVariableValue';
import { GlobalVariableLabel } from '../entities/globalVariableLabel';

@EntityRepository(GlobalVariableValue)
export class GlobalVariableValueRepository extends Repository<GlobalVariableValue> {
  async getAllActive(): Promise<any[]> {
    let result = await this.find({
      relations: ['variable'],
    });

    return result;
  }

  async addOrUpdate(
    globalVariableLabelValueArrayDTO: GlobalVariableLabelValueArrayDTO
  ): Promise<any> {
    let entity = await this.manager.transaction(
      async (transactionalEntityManager) => {
        let globalVariable: GlobalVariableLabel | undefined;
        let globalVariableValue: GlobalVariableValue;

        for (let globalVariableLabelValueDTO of globalVariableLabelValueArrayDTO.variables) {
          globalVariable = await this.manager.findOne(
            GlobalVariableLabel,
            {
              name: globalVariableLabelValueDTO.name,
            },
            { relations: ['values'] }
          );

          if (!globalVariable) {
            globalVariable = new GlobalVariableLabel();
            globalVariable.name = globalVariableLabelValueDTO.name;
            await transactionalEntityManager.save(globalVariable);

            globalVariableValue = new GlobalVariableValue();
          } else {
            globalVariableValue = globalVariable.values[0];
          }

          globalVariableValue.globalVariableId = globalVariable.id;
          globalVariableValue.value = globalVariableLabelValueDTO.value;
          globalVariableValue.startDate = new Date(
            globalVariableLabelValueDTO.startDate
          );
          globalVariableValue.endDate = new Date(
            globalVariableLabelValueDTO.endDate
          );

          await transactionalEntityManager.save(globalVariableValue);
        }

        return true;
      }
    );

    return this.manager.find(GlobalVariableLabel, { relations: ['values'] });
  }

  async addValueRow(
    globalVariableValue: GlobalVariableValueDTO
  ): Promise<GlobalVariableValue | any> {
    let obj = new GlobalVariableValue();
    obj.globalVariableId = globalVariableValue.globalVariableId;
    obj.value = globalVariableValue.value;
    obj.startDate = globalVariableValue.startDate;
    obj.endDate = globalVariableValue.endDate;

    let response = await this.save(obj);
    return response;
  }
}
