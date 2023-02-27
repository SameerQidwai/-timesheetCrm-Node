import {
  GlobalVariableLabelValueArrayDTO,
  GlobalVariableLabelValueDTO,
  GlobalVariableValueDTO,
} from '../dto';
import { EntityRepository, Repository } from 'typeorm';
import { GlobalVariableValue } from '../entities/globalVariableValue';
import { GlobalVariableLabel } from '../entities/globalVariableLabel';
import moment from 'moment';
import { LeaveRequestType } from '../entities/leaveRequestType';
import { State } from '../entities/state';

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

  async costCalculatorVariable (reportType: number){
    let variables: any = [];

    if (reportType === 1) {
      variables= ['Superannuation', 'WorkCover', 'Public Holidays',]

      let leaveTypes =  await this.manager.find(LeaveRequestType)
      leaveTypes.forEach((el) => {
        variables.push(el.label);
      });
    }else if (reportType === 2){
      variables= ['Superannuation', 'WorkCover']
    }else if (reportType === 3){
      variables = []
    }

    let setGolobalVariables: any = [];
    if (variables.length){
      let golobalVariables: any = await this.manager
      .getRepository(GlobalVariableLabel)
      .createQueryBuilder('variable')
      .innerJoinAndSelect('variable.values', 'values')
      .where('name IN (:...name)', { name: variables })
      .andWhere('values.start_date <= :startDate', {
        startDate: moment().startOf('day').toDate(),
      })
      .andWhere('values.end_date >= :endDate', {
        endDate: moment().endOf('day').toDate(),
      })
      .getMany();


    let sortIndex: any = {
      Superannuation: 0,
      WorkCover: 1,
      'Public Holidays': golobalVariables.length - 1,
    };

    
    /**Sorting Data As our Need */
      golobalVariables.forEach((variable: any, index: number) => {
        let value: any = variable.values?.[0];
        let manipulateVariable: any = {
          name: variable.name,
          variableId: variable.id,
          valueId: value.id,
          value: value.value,
          apply: 'Yes'
        };

        /** Checking if element is from a sort variables */
        if (sortIndex[variable.name] >= 0) {
          /** if index and sortIndex has same index means this is where sort element belong */
          if (index === sortIndex[variable.name]) {
            setGolobalVariables.push(manipulateVariable);
          } else {
            /**checking if index has pass sort variable index means the element is already been manipulated */
            if (index > sortIndex[variable.name]) {
              /** Saving element to be sawp as temp variable */
              let swapElement = setGolobalVariables[sortIndex[variable.name]];
              /** change index with sorted element */

              setGolobalVariables[sortIndex[variable.name]] =
                manipulateVariable;
              /** returning the already manipulated element to this index */
              if (swapElement) {
                if (index === sortIndex['Public Holidays']) {
                  setGolobalVariables[index - 1] = swapElement;
                } else {
                  setGolobalVariables.push(swapElement);
                }
              }
              /**checking if index has not yet passed sort variable index means the element will later get sort and just swap it */
            } else if (index < sortIndex[variable.name]) {
              /** returning the not manipulated element to sort variable index */

              setGolobalVariables[sortIndex[variable.name]] =
                manipulateVariable;
              /** returning the manipulated element to this index */
            }
          }
        } else {
          setGolobalVariables.push(manipulateVariable);
        }
     });
    }


    // let stateVariables: any= ['GST']

    let states =  await this.manager.find(State)
      // states.forEach((el) => {
      //   stateVariables.push(el.label);
      // });

    let stateTax: any = await this.manager.query(`
      Select gvv.value tax, gvl.id value, gvl.name label from global_variable_labels gvl
        JOIN global_variable_values gvv on gvv.global_variable_id = gvl.id
        WHERE gvl.name IN ('GST', ${states.map(({label})=> `'${label}'`)})
        AND gvv.start_date <= '${moment().startOf('day').format('YYYY-MM-DD HH:mm:ss')}'
        AND gvv.end_date >= '${moment().endOf('day').format('YYYY-MM-DD HH:mm:ss')}';`
        )
        //startDate and dateDate quert look into income_tax workInHand api
        // AND gvv.start_date BETWEEN '${fiscalYearStart}' AND '${fiscalYearEnd}'
        // AND gvv.start_date >= '${fiscalYearStart}' AND gvv.end_date <= '${fiscalYearEnd}'`
    let gst: number = 0
    stateTax = stateTax.filter((states: any)=>{
      if (states.label === 'GST'){
        gst = states.value
        // return false
      }else{
        return true
      }
    })

    return {
      gst,
      stateTax,
      golobalVariables: setGolobalVariables,
    };
  }
}
