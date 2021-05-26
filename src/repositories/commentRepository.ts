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
    // let result = await this.find({
    //   where: { type: type, targetId: id },
    // });

    //Query to get comments with attachments and files
    let queryComments = await this.createQueryBuilder('comment')
      .leftJoinAndSelect(
        'attachments',
        'attachment',
        'attachment.targetId = comment.id'
      )
      .leftJoinAndSelect('files', 'file', 'file.id = attachment.fileId')
      .where('comment.id = :id', { id })
      .where('comment.target_type = :type', { type })
      .getRawMany();

    //Making unique of comments
    let doneIndexes: any = [];

    //Saving comment indexes in object to avoid looping
    let commentIndexes: any = {};

    //saving comments
    let comments = queryComments
      .map((queryComment, index) => {
        if (!doneIndexes.includes(queryComment.comment_id)) {
          doneIndexes.push(queryComment.comment_id);
          commentIndexes[queryComment.comment_id] = index;
          return {
            id: queryComment.comment_id,
            createdAt: queryComment.comment_created_at,
            updatedAt: queryComment.comment_updated_at,
            deletedAt: queryComment.comment_deleted_at,
            content: queryComment.comment_content,
            targetType: queryComment.comment_target_type,
            targetId: queryComment.comment_target_id,
            attachments: [] as any[],
          };
        }
      })
      .filter((x) => x);

    //attaching attachments and files with comments
    queryComments.forEach((queryComment) => {
      let comment = comments[commentIndexes[queryComment.comment_id]];
      if (comment) {
        comment.attachments.push({
          id: queryComment.attachment_id,
          createdAt: queryComment.attachment_created_at,
          updatedAt: queryComment.attachment_updated_at,
          deletedAt: queryComment.attachment_deleted_at,
          targetType: queryComment.attachment_target_type,
          targetId: queryComment.attachment_target_id,
          file: {
            id: queryComment.file_id,
            createdAt: queryComment.file_created_at,
            updatedAt: queryComment.file_updated_at,
            deletedAt: queryComment.file_deleted_at,
            uniqueName: queryComment.file_unique_name,
            originalName: queryComment.file_original_name,
            type: queryComment.file_type,
          },
        });
      }
    });

    return comments;
  }

  async deleteComment(id: number): Promise<any | undefined> {
    let comment = await this.findOne(id);
    if (!comment) {
      throw new Error('Comment not found!');
    }

    return this.softDelete(id);
  }
}
