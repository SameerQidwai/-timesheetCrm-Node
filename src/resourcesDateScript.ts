import { createConnection, getManager } from 'typeorm';
import { OpportunityResource } from './entities/opportunityResource';
const connection = createConnection();

connection
  .then(async () => {
    let allResources = await getManager().find(OpportunityResource, {
      relations: ['opportunityResourceAllocations'],
    });
    let promises = allResources.filter(async (resource) => {
      let allocation = resource.opportunityResourceAllocations.filter(
        (allocation) => allocation.isMarkedAsSelected
      )[0];

      if (allocation == undefined)
        allocation = resource.opportunityResourceAllocations[0];

      if (allocation) {
        resource.startDate = allocation.startDate;
        resource.endDate = allocation.endDate;
        console.count('allocates');
        return resource;
      }
    });

    let resources = await Promise.all(promises);
    await getManager().save(resources);

    console.log('resources updated');

    return true;
  })
  .catch((error) => {
    console.error('error in DB connection: ', error);
  });
