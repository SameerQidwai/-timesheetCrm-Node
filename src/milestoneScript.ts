import { createConnection, getManager } from 'typeorm';
import { Milestone } from './entities/milestone';
import { Opportunity } from './entities/opportunity';
const connection = createConnection();

connection
  .then(async () => {
    let allMilestones = await getManager().delete(Milestone, {});

    let allWork = await getManager().find(Opportunity, {
      relations: ['milestones'],
      withDeleted: true,
    });
    let promises = allWork.map((work) => {
      console.log(work.id, work.milestones.length);
      if (work.milestones.length == 0) {
        let milestone = new Milestone();
        milestone.id = work.id;
        milestone.title = 'Default Milestone';
        milestone.description = '-';
        milestone.progress = 0;
        milestone.startDate = work.startDate;
        milestone.endDate = work.endDate;
        milestone.isApproved = false;
        milestone.projectId = work.id;
        milestone.createdAt = work.createdAt;
        milestone.deletedAt = work.deletedAt;

        return milestone;
      }
    });

    let milestones = await Promise.all(promises);
    await getManager().save(milestones);

    console.log('milestones created');

    return true;
  })
  .catch((error) => {
    console.error('error in DB connection: ', error);
  });
