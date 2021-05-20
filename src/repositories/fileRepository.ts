import { FileDTO } from '../dto';
import { EntityRepository, Repository } from 'typeorm';
import { File } from './../entities/file';

@EntityRepository(File)
export class FileRepository extends Repository<File> {
  async createAndSave(files: any): Promise<any> {
    let ids = [];
    for (const file of files) {
      let obj = new File();
      obj.originalName = file.originalname;
      // obj.type = file.mimetype;
      obj.type =
        file.originalname.split('.')[file.originalname.split('.').length - 1];
      obj.uniqueName = file.filename;
      let dbFile = await this.save(obj);
      ids.push(dbFile.id);
    }
    return ids;
  }
}
