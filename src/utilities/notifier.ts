import {
  NotificationEventType,
  NotificationType,
} from '../constants/constants';
import { Employee } from '../entities/employee';
import { Notification } from '../entities/notification';
import { getManager, In } from 'typeorm';
import { StandardMailUserInterface } from './interfaces';
import { dispatchMail } from './mailer';
import { NotificationMail } from '../mails/notificationMail';

let getNotifiers = async (userIds: Array<number>) => {
  const manager = getManager();

  let responseUsers: Array<{
    id: number;
    emailObj: StandardMailUserInterface;
  }> = [];

  let users: Array<Employee> = [];

  if (userIds) {
    users = await manager.find(Employee, {
      relations: [
        'contactPersonOrganization',
        'contactPersonOrganization.contactPerson',
      ],
      where: { id: In(userIds) },
    });
  } else {
    users = await manager.find(Employee, {
      relations: [
        'contactPersonOrganization',
        'contactPersonOrganization.contactPerson',
      ],
      where: { role: 1 },
    });
  }

  if (!users.length) {
    throw new Error('Users not found');
  }

  for (let user of users)
    responseUsers.push({
      id: user.id,
      emailObj: { email: user.username, username: user.getFullName },
    });

  return responseUsers;
};

let dispatchNotification = async (
  notifiableId: number,
  title: string,
  content: string,
  type: NotificationType,
  url: string,
  event: NotificationEventType
): Promise<Notification> => {
  const manager = getManager();

  let notification = manager.create(Notification, {
    title,
    content,
    type,
    notifiableId,
    url,
    event,
  });

  return await manager.save(notification);
};

export class NotificationManager {
  public static async info(
    userIds: Array<number>,
    title: string,
    content: string,
    url: string,
    event: NotificationEventType
  ): Promise<any> {
    try {
      let users = await getNotifiers(userIds);

      for (let user of users) {
        let notification = await dispatchNotification(
          user.id,
          title,
          content,
          NotificationType.INFO,
          url,
          event
        );

        dispatchMail(
          new NotificationMail(user.emailObj.username, notification),
          user.emailObj
        );
      }
    } catch (e) {
      console.log(e);
    }
  }

  public static async success(
    userIds: Array<number>,
    title: string,
    content: string,
    url: string,
    event: NotificationEventType
  ): Promise<any> {
    try {
      let users = await getNotifiers(userIds);

      for (let user of users) {
        let notification = await dispatchNotification(
          user.id,
          title,
          content,
          NotificationType.SUCCESS,
          url,
          event
        );

        dispatchMail(
          new NotificationMail(user.emailObj.username, notification),
          user.emailObj
        );
      }
    } catch (e) {
      console.log(e);
    }
  }

  public static async danger(
    userIds: Array<number>,
    title: string,
    content: string,
    url: string,
    event: NotificationEventType
  ): Promise<any> {
    try {
      let users = await getNotifiers(userIds);

      for (let user of users) {
        let notification = await dispatchNotification(
          user.id,
          title,
          content,
          NotificationType.DANGER,
          url,
          event
        );

        dispatchMail(
          new NotificationMail(user.emailObj.username, notification),
          user.emailObj
        );
      }
    } catch (e) {
      console.log(e);
    }
  }

  public static async dynamic(
    userIds: Array<number>,
    title: string,
    content: string,
    url: string,
    event: NotificationEventType,
    type: NotificationType
  ): Promise<any> {
    try {
      let users = await getNotifiers(userIds);

      for (let user of users) {
        let notification = await dispatchNotification(
          user.id,
          title,
          content,
          type,
          url,
          event
        );

        dispatchMail(
          new NotificationMail(user.emailObj.username, notification),
          user.emailObj
        );
      }
    } catch (e) {
      console.log(e);
    }
  }
}
