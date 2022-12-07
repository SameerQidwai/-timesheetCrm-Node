import { Moment } from 'moment';
import { EmploymentContract } from '../entities/employmentContract';
import { Employee } from '../entities/employee';
import { Opportunity } from '../entities/opportunity';

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
