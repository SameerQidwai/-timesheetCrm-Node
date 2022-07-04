import {
  GlobalVariableLabelValueArrayDTO,
  GlobalVariableLabelValueDTO,
  GlobalVariableValueDTO,
} from '../dto';
import { EntityRepository, Repository } from 'typeorm';
import { GlobalVariableValue } from '../entities/globalVariableValue';
import { GlobalVariableLabel } from '../entities/globalVariableLabel';
import moment from 'moment';

@EntityRepository(GlobalVariableValue)
export class GlobalVariableValueRepository extends Repository<GlobalVariableValue> {
  async getAllActive(): Promise<any[]> {

    let result = await this.createQueryBuilder("values")
    .innerJoinAndSelect("values.variable", "variable")
    .andWhere('start_Date <= :startDate', {startDate: moment().startOf('day').toDate()})
    .andWhere('end_date >= :endDate', {endDate: moment().endOf('day').toDate()})
    .getMany()
    
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
          // globalVariable = await this.manager.getRepository(GlobalVariableLabel).createQueryBuilder("variable")
          // .innerJoinAndSelect("variable.values", "values")
          // .where("name = :name", { name:  globalVariableLabelValueDTO.name})
          // .andWhere('values.start_date <= :startDate', {startDate: moment().startOf('day').toDate()})
          // .andWhere('values.end_date >= :endDate', {endDate: moment().endOf('day').toDate()})
          // .getOne()

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
            globalVariableValue = globalVariable.values.filter(el=> 
              moment(el.startDate).isSameOrBefore(moment(), 'date') &&
              moment(el.endDate).isSameOrAfter(moment(), 'date')
            )[0]
            if (!globalVariableValue){
              globalVariableValue = new GlobalVariableValue();
            }
            // globalVariableValue = globalVariable.values[0];
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

    // return this.manager.find(GlobalVariableLabel, { relations: ['values'] });
    return await this.manager.getRepository(GlobalVariableLabel)
    .createQueryBuilder("variable")
    .innerJoinAndSelect("variable.values", "values")
    .andWhere('values.start_date <= :startDate', {startDate: moment().startOf('day').toDate()})
    .andWhere('values.end_date >= :endDate', {endDate: moment().endOf('day').toDate()})
    .getMany()
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
