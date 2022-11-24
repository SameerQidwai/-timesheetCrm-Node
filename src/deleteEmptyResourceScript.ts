import { createConnection, getManager } from 'typeorm';
import { Opportunity } from './entities/opportunity';
const connection = createConnection();

connection
  .then(async () => {
    let manager = getManager();
    let opportunities = await manager.find(Opportunity, {
      relations: [
        'opportunityResources',
        'opportunityResources.opportunityResourceAllocations',
      ],
    });

    for (let opportunity of opportunities) {
      for (let resource of opportunity.opportunityResources) {
        if (!resource.opportunityResourceAllocations.length) {
          await manager.remove(resource);
        }
      }
    }
    console.log('Script Ran Successfully..');
  })
  .catch((error) => {
    console.error('error in DB connection: ', error);
  });
