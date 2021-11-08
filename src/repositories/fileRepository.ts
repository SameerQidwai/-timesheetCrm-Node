import { FileDTO } from '../dto';
import { EntityRepository, Repository } from 'typeorm';
import { File } from './../entities/file';

@EntityRepository(File)
export class FileRepository extends Repository<File> {
  async createAndSave(files: any, userId: number): Promise<any> {
    let resFiles = [];
    for (const file of files) {
      let obj = new File();
      obj.originalName = file.originalname;
      // obj.type = file.mimetype;
      obj.type =
        file.originalname.split('.')[file.originalname.split('.').length - 1];
      obj.uniqueName = file.filename;
      obj.userId = userId;
      let dbFile = await this.save(obj);
      resFiles.push(dbFile);
    }
    return resFiles;
  }
}
