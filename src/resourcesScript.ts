import { createConnection, getManager } from 'typeorm';
import { Milestone } from './entities/milestone';
import { Opportunity } from './entities/opportunity';
const connection = createConnection();

connection
  .then(async () => {
    let allWork = await getManager().find(Opportunity, {
      relations: ['milestones', 'opportunityResources'],
      withDeleted: true,
    });
    let promises = [];
    allWork.forEach(async (work) => {
      promises = work.opportunityResources.map((resource) => {
        resource.milestoneId = resource.opportunityId;
        return resource;
      });
      let resources = await Promise.all(promises);
      await getManager().save(resources);
    });

    console.log('resources updated');

    return true;
  })
  .catch((error) => {
    console.error('error in DB connection: ', error);
  });
