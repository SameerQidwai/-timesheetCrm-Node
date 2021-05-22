import { EntityRepository, Repository } from 'typeorm';
import { Attachment } from './../entities/attachment';
import { AttachmentDTO } from '../dto/index';
import { EntityType } from 'src/constants/constants';

@EntityRepository(Attachment)
export class AttachmentRepository extends Repository<Attachment> {
  async createAndSave(attachments: AttachmentDTO): Promise<any> {
    let responseAttachments = [];
    for (const file of attachments.files) {
      let obj = new Attachment();
      obj.fileId = file;
      obj.targetId = attachments.target;
      obj.type = attachments.type;
      let dbAttachment = await this.save(obj);
      responseAttachments.push(dbAttachment);
    }

    return responseAttachments;
  }

  async getTargetAttachments(type: EntityType, id: number): Promise<any> {
    let result = await this.find({
      where: { type: type, targetId: id },
      relations: ['file'],
    });

    return result;
  }
}
