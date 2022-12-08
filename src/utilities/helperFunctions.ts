import moment, { Moment } from 'moment';
import { EmploymentContract } from '../entities/employmentContract';
import { Employee } from '../entities/employee';
import { Opportunity } from '../entities/opportunity';
import { GlobalVariableLabel } from '../entities/globalVariableLabel';
import { getManager } from 'typeorm';
import { EmploymentType } from 'src/constants/constants';

export let getProjectsByUserId = (
  projects: Opportunity[],
  mode: string,
  phase: number,
  contactPersonId: number,
  employeeId: number,
  idArray = false
) => {
  //O for in resources.
  //M for in project manager.
  //Phase of opportunity

  let response: any = [];

  projects.map((project) => {
    let add_flag = 0;
    if (project.phase || phase === 1) {
      if (mode == 'O' || mode == 'o' || mode == '') {
        project.opportunityResources.map((resource) => {
          resource.opportunityResourceAllocations.filter((allocation) => {
            if (
              allocation.contactPersonId === contactPersonId &&
              allocation.isMarkedAsSelected
            ) {
              add_flag = 1;
            }
          });
        });
        if (add_flag === 1) {
          if (idArray) {
            response.push(project.id);
          } else {
            response.push({ value: project.id, label: project.title });
          }
        }
      }
      if ((mode == 'M' || mode == 'm' || mode == '') && add_flag === 0) {
        if (project.projectManagerId == employeeId) {
          add_flag = 1;
          if (idArray) {
            response.push(project.id);
          } else {
            response.push({ value: project.id, label: project.title });
          }
        }
      }
      if ((mode == 'R' || mode == 'r' || mode == '') && add_flag === 0) {
        if (project.contactPersonId == contactPersonId) {
          add_flag = 1;
          if (idArray) {
            response.push(project.id);
          } else {
            response.push({ value: project.id, label: project.title });
          }
        }
      }
    }
  });

  return response;
};

export let getContractByDate = (
  employee: Employee,
  startDate: Moment,
  endDate: Moment
): EmploymentContract => {
  return employee.employmentContracts[0];
};

export let buyRateByEmployee = async (employee: Employee): Promise<number> => {
  let buyRate = 0;

  let currentContract: any = employee.getActiveContract;

  if (!currentContract) {
    return buyRate;
  }

  if (!currentContract.noOfHours) {
    return buyRate;
  }

  if (!currentContract.noOfDays) {
    return buyRate;
  }

  /** doing neccesary calculation */
  currentContract.dailyHours =
    currentContract?.noOfHours / currentContract?.noOfDays;
  currentContract.hourlyBaseRate =
    currentContract?.type === 1
      ? currentContract?.remunerationAmount
      : currentContract?.remunerationAmount / 52 / currentContract?.noOfHours;

  let setGolobalVariables: any = [];
  // if coontract is found
  if (currentContract?.hourlyBaseRate) {
    let stateName =
      employee.contactPersonOrganization.contactPerson.state.label;

    // let variables: any = [
    //   { name: 'Superannuation' },
    //   { name: stateName },
    //   { name: 'WorkCover' },
    // ];

    // if (currentContract?.type !== 1) {
    //   variables.push({ name: 'Public Holidays' });
    // }

    // employee?.leaveRequestBalances.forEach((el) => {
    //   variables.push({ name: el.type.leaveRequestType.label });
    // });

    // let golobalVariables: any = await this.manager.find(GlobalVariableLabel, {
    //   where: variables,
    //   relations: ['values'],
    // });

    let variables: any = ['Superannuation', stateName, 'WorkCover'];

    if (currentContract?.type !== 1) {
      variables.push('Public Holidays');

      employee?.leaveRequestBalances.forEach((el) => {
        variables.push(el.type.leaveRequestType.label);
      });
    }

    let golobalVariables: any = await getManager()
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
      [stateName]: 1,
      WorkCover: 2,
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

            setGolobalVariables[sortIndex[variable.name]] = manipulateVariable;
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

            setGolobalVariables[sortIndex[variable.name]] = manipulateVariable;
            /** returning the manipulated element to this index */
          }
        }
      } else {
        setGolobalVariables.push(manipulateVariable);
      }
    });

    //** Calculation to get cost Rate for the employee **//
    buyRate = currentContract?.hourlyBaseRate;
    // console.log(setGolobalVariables);

    // console.log(setGolobalVariables)
    setGolobalVariables = setGolobalVariables.map((el: any, index: number) => {
      if (index === 0) {
        el.amount = (currentContract?.hourlyBaseRate * el?.value) / 100;
      } else {
        // console.log(el.name, el.value);

        el.amount =
          ((currentContract?.hourlyBaseRate + setGolobalVariables?.[0].amount) *
            el.value) /
          100;
      }
      el.apply = 'Yes';

      buyRate += el.amount;
      return el;
    });
    /**let calendar = await this.manager.find(CalendarHoliday);

    let holidays: any = [];

    if (calendar[0]) {
      calendar.forEach((holiday) => {
        holidays.push(moment(holiday.date).format('M D YYYY'));
      });
    }**/
  }
  return parseFloat(buyRate.toFixed(2));
};

export let parseContractType = (type: EmploymentType | number): string => {
  return type === 1
    ? 'Casual'
    : type === 2
    ? 'Full Time'
    : type === 3
    ? 'Part Time'
    : 'Inactive Contract';
};
