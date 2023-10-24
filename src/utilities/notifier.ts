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
import moment from 'moment-timezone';

let getNotifiers = async (userIds: Array<number | null | undefined>) => {
  const manager = getManager();

  let responseUsers: Array<{
    id: number;
    emailObj: StandardMailUserInterface;
  }> = [];

  let users: Array<Employee> = [];

  if (process.env.DUMMY_NOTIFICATION === 'true') {
    users = await manager.find(Employee, {
      relations: [
        'contactPersonOrganization',
        'contactPersonOrganization.contactPerson',
      ],
      where: { id: 1 },
    });
  } else {
    users = await manager.find(Employee, {
      relations: [
        'contactPersonOrganization',
        'contactPersonOrganization.contactPerson',
      ],
      where: [{ id: In(userIds) }, { roleId: 1 }],
    });
  }
  // if (userIds) {

  // } else {
  // users = await manager.find(Employee, {
  //   relations: [
  //     'contactPersonOrganization',
  //     'contactPersonOrganization.contactPerson',
  //   ],
  //   where: { role: 1 },
  // });
  // }

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
    generatedAt: moment().toDate(),
  });

  return await manager.save(notification);
};

export class NotificationManager {
  public static async info(
    userIds: Array<number | null | undefined>,
    title: string,
    content: string,
    url: string,
    event: NotificationEventType,
    exceptIds: Array<number> = []
  ): Promise<any> {
    try {
      if (process.env.NOTIFICATION_MODULE === 'false') return true;

      let users = await getNotifiers(userIds);

      for (let user of users) {
        if (exceptIds.includes(user.id)) continue;

        let notification = await dispatchNotification(
          user.id,
          title,
          content,
          NotificationType.INFO,
          url,
          event
        );

        if (process.env.SEND_NOTIFICATION_MAIL === 'true') {
          dispatchMail(
            new NotificationMail(user.emailObj.username, notification),
            user.emailObj
          );
        }
      }

      return true;
    } catch (e) {
      console.log(e);
    }
  }

  public static async success(
    userIds: Array<number | null | undefined>,
    title: string,
    content: string,
    url: string,
    event: NotificationEventType,
    exceptIds: Array<number> = []
  ): Promise<any> {
    try {
      let users = await getNotifiers(userIds);

      for (let user of users) {
        if (exceptIds.includes(user.id)) continue;

        let notification = await dispatchNotification(
          user.id,
          title,
          content,
          NotificationType.SUCCESS,
          url,
          event
        );

        if (process.env.SEND_NOTIFICATION_MAIL === 'true') {
          dispatchMail(
            new NotificationMail(user.emailObj.username, notification),
            user.emailObj
          );
        }
      }
      return true;
    } catch (e) {
      console.log(e);
    }
  }

  public static async danger(
    userIds: Array<number | null | undefined>,
    title: string,
    content: string,
    url: string,
    event: NotificationEventType,
    exceptIds: Array<number> = []
  ): Promise<any> {
    try {
      let users = await getNotifiers(userIds);

      for (let user of users) {
        if (exceptIds.includes(user.id)) continue;

        let notification = await dispatchNotification(
          user.id,
          title,
          content,
          NotificationType.DANGER,
          url,
          event
        );

        if (process.env.SEND_NOTIFICATION_MAIL === 'true') {
          dispatchMail(
            new NotificationMail(user.emailObj.username, notification),
            user.emailObj
          );
        }
      }
      return true;
    } catch (e) {
      console.log(e);
    }
  }

  public static async dynamic(
    userIds: Array<number | null | undefined>,
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

        if (process.env.SEND_NOTIFICATION_MAIL === 'true') {
          dispatchMail(
            new NotificationMail(user.emailObj.username, notification),
            user.emailObj
          );
        }
      }
      return true;
    } catch (e) {
      console.log(e);
    }
  }
}
