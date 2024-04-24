import {
  GlobalVariableLabelValueArrayDTO,
  GlobalVariableLabelValueDTO,
  GlobalVariableValueDTO,
} from '../dto';
import { EntityRepository, Repository } from 'typeorm';
import { GlobalVariableValue } from '../entities/globalVariableValue';
import { GlobalVariableLabel } from '../entities/globalVariableLabel';
import moment from 'moment-timezone';
import { LeaveRequestType } from '../entities/leaveRequestType';
import { State } from '../entities/state';

@EntityRepository(GlobalVariableValue)
export class GlobalVariableValueRepository extends Repository<GlobalVariableValue> {
  async getAllActive(): Promise<any[]> {
    let result = await this.createQueryBuilder('values')
      .innerJoinAndSelect('values.variable', 'variable')
      .andWhere('start_Date <= :startDate', {
        startDate: moment().startOf('day').toDate(),
      })
      .andWhere('end_date >= :endDate', {
        endDate: moment().endOf('day').toDate(),
      })
      .getMany();

    return result;
  }

  async findOneCustom(name: string): Promise<any> {
    let globalVariable = await this.manager.findOne(
      GlobalVariableLabel,
      { name },
      {
        relations: ['values'],
      }
    );

    if (!globalVariable) {
      throw new Error('Global Variable not found');
    }

    return globalVariable;
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
            globalVariableValue = globalVariable.values.filter(
              (el) =>
                moment(el.startDate).isSameOrBefore(moment(), 'date') &&
                moment(el.endDate).isSameOrAfter(moment(), 'date')
            )[0];
            if (!globalVariableValue) {
              globalVariableValue = new GlobalVariableValue();
            }
            // globalVariableValue = globalVariable.values[0];
          }

          globalVariableValue.globalVariableId = globalVariable.id;
          globalVariableValue.value = globalVariableLabelValueDTO.value;
          globalVariableValue.startDate = moment(
            globalVariableLabelValueDTO.startDate
          )
            .startOf('day')
            .toDate();
          globalVariableValue.endDate = moment(
            globalVariableLabelValueDTO.endDate
          )
            .endOf('day')
            .toDate();

          await transactionalEntityManager.save(globalVariableValue);
        }

        return true;
      }
    );

    // return this.manager.find(GlobalVariableLabel, { relations: ['values'] });
    return await this.manager
      .getRepository(GlobalVariableLabel)
      .createQueryBuilder('variable')
      .innerJoinAndSelect('variable.values', 'values')
      .andWhere('values.start_date <= :startDate', {
        startDate: moment().startOf('day').toDate(),
      })
      .andWhere('values.end_date >= :endDate', {
        endDate: moment().endOf('day').toDate(),
      })
      .getMany();
  }

  async addValueRow(
    globalVariableValue: GlobalVariableValueDTO
  ): Promise<GlobalVariableValue | any> {
    let obj = new GlobalVariableValue();
    obj.globalVariableId = globalVariableValue.globalVariableId;
    obj.value = globalVariableValue.value;
    obj.startDate = moment(globalVariableValue.startDate)
      .startOf('day')
      .toDate();
    obj.endDate = moment(globalVariableValue.endDate).endOf('day').toDate();

    let response = await this.save(obj);
    return response;
  }

  async updateValueRow(
    id: number,
    globalVariableValue: GlobalVariableLabelValueDTO
  ): Promise<GlobalVariableValue | any> {
    let variableValue = await this.findOne(id);

    if (!variableValue) {
      throw new Error('Variable Value not found');
    }
    variableValue.value = globalVariableValue.value;
    variableValue.startDate = moment(globalVariableValue.startDate)
      .startOf('day')
      .toDate();
    variableValue.endDate = moment(globalVariableValue.endDate)
      .endOf('day')
      .toDate();

    let response = await this.save(variableValue);

    return response;
  }

  async costCalculatorVariable(reportType: number) {
    let variables: any = [];

    if (reportType === 1) {
      variables = ['Superannuation', 'WorkCover'];

      let leaveTypes = await this.manager.find(LeaveRequestType);
      leaveTypes.forEach((el) => {
        variables.push(el.label);
      });
      variables.push('Public Holidays');
    } else if (reportType === 2) {
      variables = ['Superannuation', 'WorkCover'];
    } else if (reportType === 3) {
      variables = [];
    }

    if (variables.length) {
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
        .orderBy( `FIELD(variable.name, ${'"' + variables.join('", "') + '"'})` 
        )
        .getMany();

        // To check what variable are not returned from database
        let variableIndex: {[key: string]: any}= {}; 

        golobalVariables.forEach((variable: any, index: number)=>{
          let value: any = variable.values?.[0];
          variableIndex[variable.name] = {
            name: variable.name,
            variableId: variable.id,
            valueId: value.id,
            value: value.value,
            apply: 'Yes',
          }
        })
      
      // let setGolobalVariables: any = [];
      /**Sorting Data As our Need */
      variables = variables.map((variable: any, index: number) => {
        if (variableIndex[variable]){ 
          // if data was returned from database return database value
          //database value
          return variableIndex[variable];
        }else{
          // if data was Not from database return database value return this
          return {
            name: variable,
            variableId: variable + 'id',
            valueId: variable + 'valueId',
            value: 0,
            apply: 'No',
          };

        };

        /** Below is How I was sorting data before and now I am using orderBy in query so all the data will be sorted
         *  Hence No need for below code but keeping it just for safe case. 
         */
          // let value: any = variable.values?.[0];
          // console.log(variable.name)
          // let manipulateVariable: any = {
          //   name: variable.name,
          //   variableId: variable.id,
          //   valueId: value.id,
          //   value: value.value,
          //   apply: 'Yes',
          // };
          
          // /** Checking if element is from a sort variables */
          // if (sortIndex[variable.name] >= 0) {
          //   /** if index and sortIndex has same index means this is where sort element belong */
          //   if (index === sortIndex[variable.name]) {
          //     setGolobalVariables.push(manipulateVariable);
          //   } else {
          //     /**checking if index has pass sort variable index means the element is already been manipulated */
          //     if (index > sortIndex[variable.name]) {
          //       /** Saving element to be sawp as temp variable */
          //       let swapElement = setGolobalVariables[sortIndex[variable.name]];
          //       /** change index with sorted element */

          //       setGolobalVariables[sortIndex[variable.name]] =
          //         manipulateVariable;
          //       /** returning the already manipulated element to this index */
          //       if (swapElement) {
          //         if (index === sortIndex['Public Holidays']) {
          //           setGolobalVariables[index - 1] = swapElement;
          //         } else {
          //           setGolobalVariables.push(swapElement);
          //         }
          //       }
          //       /**checking if index has not yet passed sort variable index means the element will later get sort and just swap it */
          //     } else if (index < sortIndex[variable.name]) {
          //       /** returning the not manipulated element to sort variable index */

          //       setGolobalVariables[sortIndex[variable.name]] =
          //         manipulateVariable;
          //       /** returning the manipulated element to this index */
          //     }
          //   }
          // } else {
              //setGolobalVariables.push(manipulateVariable);
          // }
      });
    }

    // let stateVariables: any= ['GST']

    let states = await this.manager.find(State);
    // states.forEach((el) => {
    //   stateVariables.push(el.label);
    // });

    let stateTax: any = await this.manager.query(`
      Select gvv.value tax, gvl.id value, gvl.name label from global_variable_labels gvl
        JOIN global_variable_values gvv on gvv.global_variable_id = gvl.id
        WHERE gvl.name IN ('GST', ${states.map(({ label }) => `'${label}'`)})
        AND gvv.start_date <= '${moment()
          .startOf('day')
          .format('YYYY-MM-DD HH:mm:ss')}'
        AND gvv.end_date >= '${moment()
          .endOf('day')
          .format('YYYY-MM-DD HH:mm:ss')}';`);
    //startDate and dateDate quert look into income_tax workInHand api
    // AND gvv.start_date BETWEEN '${fiscalYearStart}' AND '${fiscalYearEnd}'
    // AND gvv.start_date >= '${fiscalYearStart}' AND gvv.end_date <= '${fiscalYearEnd}'`
    let gst: number = 0;
    stateTax = stateTax.filter((states: any) => {
      if (states.label === 'GST') {
        gst = states.tax;
        // return false
      } else {
        return true;
      }
    });

    return {
      gst,
      stateTax,
      golobalVariables: variables,
    };
  }

  async createAndSave(
    globalVariableLabelValueDTO: GlobalVariableLabelValueDTO
  ): Promise<any> {
    return await this.manager.transaction(
      async (transactionalEntityManager) => {
        let globalVariable = await this.manager.findOne(
          GlobalVariableLabel,
          {
            name: globalVariableLabelValueDTO.name,
          },
          { relations: ['values'] }
        );

        if (!globalVariable) {
          throw new Error('Global Variable not found');
        }

        let valueStart = moment(globalVariableLabelValueDTO.startDate);
        let valueEnd = moment(globalVariableLabelValueDTO.endDate);

        for (let value of globalVariable.values) {
          if (
            valueStart.isBetween(value.startDate, value.endDate, 'date', '[]')
          ) {
            throw new Error('Values date cannot overlap');
          }

          if (
            valueEnd.isBetween(value.startDate, value.endDate, 'date', '[]')
          ) {
            throw new Error('Values date cannot overlap');
          }

          if (
            valueStart.isBefore(value.startDate) &&
            valueEnd.isAfter(valueEnd)
          ) {
            throw new Error('Values date cannot overlap');
          }
        }

        let globalVariableValue = new GlobalVariableValue();
        globalVariableValue.startDate = valueStart.startOf('day').toDate();
        globalVariableValue.endDate = valueEnd.endOf('day').toDate();
        globalVariableValue.value = globalVariableLabelValueDTO.value;
        globalVariableValue.globalVariableId = globalVariable.id;

        return transactionalEntityManager.save(globalVariableValue);
      }
    );
  }

  async updateAndReturn(
    id: number,
    globalVariableLabelValueDTO: GlobalVariableLabelValueDTO
  ): Promise<any> {
    return this.manager.transaction(async (transactionalEntityManager) => {
      let globalVariable = await this.manager.findOne(
        GlobalVariableLabel,
        {
          name: globalVariableLabelValueDTO.name,
        },
        { relations: ['values'] }
      );

      if (!globalVariable) {
        throw new Error('Global Variable not found');
      }

      let globalVariableValue = await this.findOne(id);

      if (!globalVariableValue) {
        throw new Error('Global value not found');
      }

      if (globalVariableValue.globalVariableId != globalVariable.id) {
        throw new Error('Global Variable Value not found');
      }

      let valueStart = moment(globalVariableLabelValueDTO.startDate);
      let valueEnd = moment(globalVariableLabelValueDTO.endDate);

      for (let value of globalVariable.values) {
        if (value.id === globalVariableValue.id) continue;

        if (
          valueStart.isBetween(value.startDate, value.endDate, 'date', '[]')
        ) {
          throw new Error('Values date cannot overlap');
        }

        if (valueEnd.isBetween(value.startDate, value.endDate, 'date', '[]')) {
          throw new Error('Values date cannot overlap');
        }

        if (
          valueStart.isBefore(value.startDate) &&
          valueEnd.isAfter(valueEnd)
        ) {
          throw new Error('Values date cannot overlap');
        }
      }

      globalVariableValue.startDate = valueStart.startOf('day').toDate();
      globalVariableValue.endDate = valueEnd.endOf('day').toDate();
      globalVariableValue.value = globalVariableLabelValueDTO.value;

      return transactionalEntityManager.save(
        GlobalVariableValue,
        globalVariableValue
      );
    });
  }

  async deleteCustom(id: number): Promise<any> {
    let globalVariableValue = await this.findOne(id);

    if (!globalVariableValue) {
      throw new Error('Global value not found');
    }

    return this.remove(globalVariableValue);
  }
}
