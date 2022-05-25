import { GlobalVariableLabelValueDTO, GlobalVariableValueDTO } from '../dto';
import { EntityRepository, Repository } from 'typeorm';
import { GlobalVariableValue } from '../entities/globalVariableValue';
import { GlobalVariableLabel } from '../entities/globalVariableLabel';

@EntityRepository(GlobalVariableValue)
export class GlobalVariableValueRepository extends Repository<GlobalVariableValue> {
  async addOrUpdate(
    globalVariableLabelValueDTO: GlobalVariableLabelValueDTO
  ): Promise<any> {
    let entity = await this.manager.transaction(
      async (transactionalEntityManager) => {
        let globalVariable: GlobalVariableLabel | undefined;
        let globalVariableValue: GlobalVariableValue;

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

        return {
          name: globalVariable.name,
          ...globalVariableValue,
        };
      }
    );

    return entity;
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
