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
      let attachment = await this.findOne(dbAttachment.id, {
        relations: ['file'],
      });
      console.log(attachment);
      responseAttachments.push(attachment);
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

  async deleteAttachment(id: number): Promise<any | undefined> {
    let attachment = await this.findOne(id);
    if (!attachment) {
      throw new Error('Attachment not found!');
    }

    return this.softDelete(id);
  }
}
