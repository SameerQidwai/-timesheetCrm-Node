import { Notification } from '../entities/notification';
import { StandardMailInterface } from '../utilities/interfaces';
import { BaseMail } from './baseMail';

export class NotificationMail
  extends BaseMail
  implements StandardMailInterface
{
  fileName: string;

  constructor(userName: string | String, notification: Notification) {
    super();
    this.fileName = 'notificationMailContent.html';
    this.subject = notification.title;
    this.getHtml();
    this.getTemplate();
    this.replacements = {
      userName,
      title: notification.title,
      content: notification.content,
      url: `${process.env.ENV_URL}${notification.url}`,
    };
    this.getMail();
  }
}
