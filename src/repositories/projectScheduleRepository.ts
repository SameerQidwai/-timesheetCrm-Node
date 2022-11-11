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
        }

        transactionalEntityManager;
      }
    );
  }

  async getAllActive(): Promise<any> {
    let results = await this.find({
      relations: ['segments'],
    });

    return results;
  }

  async updateAndReturn(
    id: number,
    projectScheduleDTO: ProjectScheduleDTO
  ): Promise<any> {}

  async findOneCustom(id: number): Promise<any> {
    let result = await this.findOne(id, {
      relations: ['segments'],
    });

    return result;
  }

  async deleteCustom(id: number): Promise<any> {
    return await this.softDelete(id);
  }
}
