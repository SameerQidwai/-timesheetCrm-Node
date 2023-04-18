import { readFileSync } from 'fs';
import { compile } from 'handlebars';
import path from 'path';

export class BaseMail {
  public getHtml(fileName: string): string {
    const filePath = path.join(__dirname, '../emails/password-reset.html');
    const html = readFileSync(filePath, 'utf-8').toString();
    return html;
  }

  public getTemplate(html: string) {
    const template = compile(html);
    return template;
  }

  public getMail(template: HandlebarsTemplateDelegate, replacements: {}) {
    const htmlToSend = template(replacements);
    return htmlToSend;
  }
}
