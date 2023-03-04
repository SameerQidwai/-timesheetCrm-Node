import moment from 'moment';
import { createConnection, getManager } from 'typeorm';
import { Milestone } from './entities/milestone';
import { Opportunity } from './entities/opportunity';
const connection = createConnection();

connection
  .then(async () => {
    let momentObj = moment('Jul 21', 'MMM YY', true);
    console.log(momentObj.isValid());
    console.log(momentObj);

    return true;
  })
  .catch((error) => {
    console.error('error in DB connection: ', error);
  });
