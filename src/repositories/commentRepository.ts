import { EntityRepository, Repository } from 'typeorm';
import { Comment } from '../entities/comment';
import { Attachment } from '../entities/attachment';
import { CommentDTO } from '../dto/index';
import { EntityType } from '../constants/constants';

@EntityRepository(Comment)
export class CommentRepository extends Repository<Comment> {
  async createAndSave(comment: CommentDTO, userId: number): Promise<any> {
    let dbComment = await this.manager.transaction(
      async (transactionalEntityManager) => {
        let responseComment;

        let commentObj = new Comment();
        commentObj.content = comment.content;
        commentObj.targetId = comment.target;
        commentObj.targetType = comment.targetType;
        commentObj.userId = userId;
        let dbComment = await transactionalEntityManager.save(commentObj);

        if (comment.attachments) {
          for (const file of comment.attachments) {
            let attachmentObj = new Attachment();
            attachmentObj.fileId = file;
            attachmentObj.targetId = dbComment.id;
            attachmentObj.userId = userId;
            attachmentObj.targetType = EntityType.COMMENT;
            let dbAttachment = await transactionalEntityManager.save(
              attachmentObj
            );
          }
        }

        let queryAttachments = await transactionalEntityManager.find(
          Attachment,
          {
            relations: ['file'],
            where: { targetId: dbComment.id, targetType: 'COM' },
          }
        );

        let responseAttachments = queryAttachments.map((attachment) => {
          return {
            ...attachment,
            uid: attachment.file.uniqueName,
            name: attachment.file.originalName,
            type: attachment.file.type,
          };
        });

        responseComment = {
          ...dbComment,
          attachments: responseAttachments,
        };

        return responseComment;
      }
    );

    return dbComment;
  }

  async getTargetComments(type: EntityType, id: number): Promise<any> {
    // let result = await this.find({
    //   where: { type: type, targetId: id },
    // });
    console.log(type, id);
    //Query to get comments with attachments and files
    let baseQuery = this.createQueryBuilder('comment')
      .orderBy('comment.id')
      .leftJoinAndSelect(
        'employees',
        'employee',
        'employee.id = comment.user_id'
      )
      .leftJoinAndSelect(
        'contact_person_organizations',
        'organization',
        'organization.id = employee.contact_person_organization_id'
      )
      .leftJoinAndSelect(
        'contact_persons',
        'contact_person',
        'contact_person.id = organization.contact_person_id'
      )
      .leftJoinAndSelect(
        'attachments',
        'attachment',
        'attachment.targetId = comment.id and attachment.target_type = :const',
        { const: 'COM' }
      )
      .leftJoinAndSelect('files', 'file', 'file.id = attachment.fileId')
      .where('comment.target_id = :id', { id })
      .andWhere('comment.target_type = :type', { type });


    let queryComments = await baseQuery.getRawMany();

    //Making unique of comments
    let doneIndexes: any = [];

    //Saving comment indexes in object to avoid looping
    let commentIndexes: any = {};

    //Saving attachments
    // let commentAttachments: any = {};

    //saving comments
    let indexCounter = 0;
    let comments = queryComments
      .map((queryComment) => {
        if (commentIndexes[queryComment.comment_id] === undefined) {
          commentIndexes[queryComment.comment_id] = indexCounter;
          indexCounter++;
        }
        if (!doneIndexes.includes(queryComment.comment_id)) {
          doneIndexes.push(queryComment.comment_id);

          // commentAttachments[queryComment.comment_id] =  [...commentAttachments[queryComment.comment_id],{}];
          return {
            id: queryComment.comment_id,
            createdAt: queryComment.comment_created_at,
            updatedAt: queryComment.comment_updated_at,
            deletedAt: queryComment.comment_deleted_at,
            content: queryComment.comment_content,
            targetType: queryComment.comment_target_type,
            targetId: queryComment.comment_target_id,
            authorId: queryComment.employee_id,
            author: `${queryComment.contact_person_first_name} ${queryComment.contact_person_last_name}`,
            attachments: [] as any[],
          };
        }
      })
      .filter((x) => x);

    //attaching attachments and files with comments
    queryComments.forEach((queryComment) => {
      let comment = comments[commentIndexes[queryComment.comment_id]];
      if (comment && queryComment.attachment_id !== null) {
        comment.attachments.push({
          id: queryComment.attachment_id,
          createdAt: queryComment.attachment_created_at,
          updatedAt: queryComment.attachment_updated_at,
          deletedAt: queryComment.attachment_deleted_at,
          targetType: queryComment.attachment_target_type,
          targetId: queryComment.attachment_target_id,
          fileId: queryComment.file_id,
          uid: queryComment.file_unique_name,
          name: queryComment.file_original_name,
          type: queryComment.file_type,
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
