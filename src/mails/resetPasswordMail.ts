import { StandardMailInterface } from '../utilities/interfaces';
import { BaseMail } from './baseMail';

export class ResetPasswordMail
  extends BaseMail
  implements StandardMailInterface
{
  fileName: string;

  constructor(userName: string | String, token: string) {
    super();
    this.fileName = 'resetPasswordMailContent.html';
    this.subject = `Forgot Password Request`;
    this.getHtml();
    this.getTemplate();
    this.replacements = {
      userName,
      organization: process.env.ORGANIZATION,
      resetUrl: `${process.env.ENV_URL}/reset-password/${encodeURIComponent(
        token
      )}`,
    };
    this.getMail();
  }
}
