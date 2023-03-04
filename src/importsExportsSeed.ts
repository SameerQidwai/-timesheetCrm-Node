import { createConnection, getManager } from 'typeorm';
import { Entities } from './constants/constants';
import { DataExport } from './entities/dataExport';
import { DataImport } from './entities/dataImport';
const connection = createConnection();
import runSeeders from './utilities/seeders';

connection
  .then(async () => {
    let manager = getManager();

    let entities = [
      Entities.ORGANIZATION,
      Entities.CONTACT_PERSON,
      Entities.OPPORTUNITY,
      Entities.PROJECT,
      Entities.EMPLOYEE,
      Entities.SUB_CONTRACTOR,
    ];

    for (let entity of entities) {
      let dataImportObj = new DataImport();
      dataImportObj.type = entity;
      await manager.save(dataImportObj);
      let dataExportObj = new DataExport();
      dataExportObj.type = entity;
      await manager.save(dataExportObj);
    }

    console.log('Base Data Import Export Entries Seeded');
  })
  .catch((error) => {
    console.error('error in DB connection: ', error);
  });
