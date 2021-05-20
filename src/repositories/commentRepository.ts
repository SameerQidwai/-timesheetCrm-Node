import { EntityRepository, Repository } from 'typeorm';
import { Comment } from '../entities/comment';
import { CommentDTO } from '../dto/index';
import { EntityType } from 'src/constants/constants';

@EntityRepository(Comment)
export class CommentRepository extends Repository<Comment> {
  async createAndSave(comment: CommentDTO): Promise<any> {
    let obj = new Comment();
    obj.content = comment.content;
    obj.targetId = comment.target;
    obj.type = comment.type;
    let dbComment = await this.save(obj);

    return dbComment;
  }

  async getTargetComments(type: EntityType, id: number): Promise<any> {
    let result = await this.find({
      where: { type: type, targetId: id },
    });

    return result;
  }
}
