import moment from 'moment';
import { ProjectScheduleDTO } from '../dto';
import { Opportunity } from '../entities/opportunity';
import { ProjectSchedule } from '../entities/projectSchedule';
import { ProjectScheduleSegment } from '../entities/projectScheduleSegment';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(ProjectSchedule)
export class ProjectScheduleRepository extends Repository<ProjectSchedule> {
  async createAndSave(projectScheduleDTO: ProjectScheduleDTO): Promise<any> {
    let id = await this.manager.transaction(
      async (transactionalEntityManager) => {
        let projectScheduleObj = new ProjectSchedule();

        let project = await transactionalEntityManager.findOne(
          Opportunity,
          projectScheduleDTO.projectId
        );
        if (!project) {
          throw new Error('Project not found');
        }
        projectScheduleObj.project = project;

        projectScheduleObj.startDate = moment(
          projectScheduleDTO.startDate
        ).toDate();
        projectScheduleObj.endDate = moment(
          projectScheduleDTO.endDate
        ).toDate();

        projectScheduleObj.amount = projectScheduleDTO.amount;

        projectScheduleObj.notes = projectScheduleDTO.notes;

        let schedule = await transactionalEntityManager.save(
          projectScheduleObj
        );

        for (let segmentDTO of projectScheduleDTO.segments) {
          let segment = new ProjectScheduleSegment();
          segment.startDate = moment(segmentDTO.startDate).toDate();
          segment.endDate = moment(segmentDTO.endDate).toDate();
          segment.amount = segmentDTO.amount;
          segment.scheduleId = schedule.id;

          await transactionalEntityManager.save(segment);
        }

        return schedule.id;
      }
    );
    let schedule = await this._findOneCustom(id);
    return schedule;
  }

  async getAllActive(): Promise<any> {
    let results = await this._findManyCustom();
    return results;
  }

  async updateAndReturn(
    id: number,
    projectScheduleDTO: ProjectScheduleDTO
  ): Promise<any> {
    await this.manager.transaction(async (transactionalEntityManager) => {
      let projectScheduleObj = await this._findOneCustom(id);

      let project = await transactionalEntityManager.findOne(
        Opportunity,
        projectScheduleDTO.projectId
      );
      if (!project) {
        throw new Error('Project not found');
      }
      projectScheduleObj.project = project;

      projectScheduleObj.startDate = moment(
        projectScheduleDTO.startDate
      ).toDate();
      projectScheduleObj.endDate = moment(projectScheduleDTO.endDate).toDate();

      projectScheduleObj.amount = projectScheduleDTO.amount;

      projectScheduleObj.notes = projectScheduleDTO.notes;

      let schedule = await transactionalEntityManager.save(projectScheduleObj);

      for (let segmentDTO of projectScheduleDTO.segments) {
        let segment = new ProjectScheduleSegment();
        segment.startDate = moment(segmentDTO.startDate).toDate();
        segment.endDate = moment(segmentDTO.endDate).toDate();
        segment.amount = segmentDTO.amount;

        await transactionalEntityManager.save(segment);
      }

      return schedule;
    });
    let schedule = await this._findOneCustom(id);
    return schedule;
  }

  async findOneCustom(id: number): Promise<any> {
    let result = await this._findOneCustom(id);
    return result;
  }

  async deleteCustom(id: number): Promise<any> {
    let result = await this._findOneCustom(id);
    return await this.softRemove(result);
  }

  async _findOneCustom(id: number, options = {}): Promise<ProjectSchedule> {
    let projectSchedule = await this.findOne(id, {
      relations: ['segments'],
      ...options,
    });
    if (!projectSchedule) {
      throw new Error('Project Schedule not found');
    }

    return projectSchedule;
  }

  async _findManyCustom(options = {}): Promise<ProjectSchedule[]> {
    let projectSchedules = await this.find({
      relations: ['segments'],
      ...options,
    });

    return projectSchedules;
  }
}
