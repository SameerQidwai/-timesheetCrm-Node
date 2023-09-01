import { StandardMailInterface } from '../utilities/interfaces';
import { BaseMail } from './baseMail';

export class TimesheetMail extends BaseMail implements StandardMailInterface {
  fileName: string;

  constructor(userName: string | String, content: string, url: string) {
    super();
    this.fileName = 'timesheetContent.html';
    this.subject = `Time Sheet Update`;
    this.getHtml();
    this.getTemplate();
    this.replacements = {
      userName,
      content,
      url,
    };
    this.getMail();
  }
}
