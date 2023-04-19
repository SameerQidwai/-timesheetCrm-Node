import { StandardMailInterface } from '../utilities/interfaces';
import { BaseMail } from './baseMail';

export class WelcomeMail extends BaseMail implements StandardMailInterface {
  fileName: string;

  constructor(userName: string | String, email: string, password: string) {
    super();
    this.fileName = 'welcomeMailContent.html';
    this.subject = `Invitation to ${process.env.ORGANIZATION}`;
    this.getHtml();
    this.getTemplate();
    this.replacements = {
      userName,
      email,
      password,
      organization: process.env.ORGANIZATION,
      envUrl: process.env.ENV_URL,
    };
    this.getMail();
  }
}
