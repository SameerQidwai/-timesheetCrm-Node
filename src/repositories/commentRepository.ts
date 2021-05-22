import { EntityRepository, Repository } from 'typeorm';
import { Comment } from '../entities/comment';
import { Attachment } from '../entities/attachment';
import { CommentDTO } from '../dto/index';
import { EntityType } from '../constants/constants';

@EntityRepository(Comment)
export class CommentRepository extends Repository<Comment> {
  async createAndSave(comment: CommentDTO): Promise<any> {
    let dbComment = await this.manager.transaction(
      async (transactionalEntityManager) => {
        let commentObj = new Comment();
        commentObj.content = comment.content;
        commentObj.targetId = comment.target;
        commentObj.type = comment.type;
        let dbComment = await transactionalEntityManager.save(commentObj);

        if (comment.attachments) {
          let responseAttachments = [];
          for (const file of comment.attachments) {
            let attachmentObj = new Attachment();
            attachmentObj.fileId = file;
            attachmentObj.targetId = dbComment.id;
            attachmentObj.type = EntityType.COMMENT;
            let dbAttachment = await transactionalEntityManager.save(
              attachmentObj
            );
            responseAttachments.push(dbAttachment);
          }
        }

        return dbComment;
      }
    );

    return dbComment;
  }

  async getTargetComments(type: EntityType, id: number): Promise<any> {
    let result = await this.find({
      where: { type: type, targetId: id },
    });

    return result;
  }
}
