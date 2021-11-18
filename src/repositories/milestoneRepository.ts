import { EntityRepository, Repository } from 'typeorm';
import { Milestone } from './../entities/milestone';
import { MilestoneDTO } from '../dto/index';

@EntityRepository(Milestone)
export class MilestoneRepository extends Repository<Milestone> {
  async getAllActive(): Promise<any[]> {
    return await this.find({});
  }

  async createAndSave(milestoneDTO: MilestoneDTO): Promise<any> {
    let milestone = new Milestone();
    milestone.title = milestoneDTO.title;
    milestone.description = milestoneDTO.description;
    milestone.startDate = new Date(milestoneDTO.startDate);
    milestone.endDate = new Date(milestoneDTO.endDate);
    milestone.isApproved = milestoneDTO.isApproved;
    milestone.projectId = milestoneDTO.projectId;
    milestone.progress = milestoneDTO.progress;
    return this.manager.save(milestone);
  }

  async updateAndReturn(
    milestoneId: number,
    milestoneDTO: MilestoneDTO
  ): Promise<any> {
    let milestone = await this.findOne(milestoneId);
    if (!milestone) {
      throw new Error('Organization not found');
    }
    milestone.title = milestoneDTO.title;
    milestone.description = milestoneDTO.description;
    milestone.startDate = new Date(milestoneDTO.startDate);
    milestone.endDate = new Date(milestoneDTO.endDate);
    milestone.progress = milestoneDTO.progress;
    milestone.isApproved = milestoneDTO.isApproved;
    milestone.projectId = milestoneDTO.projectId;

    return this.manager.save(milestone);
  }

  async findOneCustom(id: number): Promise<any | undefined> {
    let milestone = await this.findOne(id);
    if (!milestone) {
      throw new Error('Milestone not found');
    }

    return milestone;
  }

  async deleteMilestone(id: number): Promise<any | undefined> {
    let milestone = await this.findOne(id);
    if (!milestone) {
      throw new Error('Milestone not found!');
    }
    return this.softDelete(id);
  }
}
