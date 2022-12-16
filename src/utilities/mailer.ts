import nodemailer from 'nodemailer';

// Generate SMTP service account from ethereal.email

export let sendMail = (
  from: any,
  to: any,
  subject: any,
  text: any,
  html = ''
) => {
  // Create a SMTP transporter object

  let MAILER_HOST: any = process.env.MAILER_HOST;
  let MAILER_PORT: any = process.env.MAILER_PORT;
  let MAILER_SSL: any = process.env.MAILER_SSL === 'true';
  let MAILER_USER: any = process.env.MAILER_USER;
  let MAILER_PWD: any = process.env.MAILER_PWD;

  let transporter = nodemailer.createTransport({
    host: MAILER_HOST,
    port: MAILER_PORT,
    secure: MAILER_SSL,
    auth: {
      user: MAILER_USER,
      pass: MAILER_PWD,
    },
  });

  // Message object
  let mail = {
    from: `${process.env.ORGANIZATION} <${from}>`,
    to: `${to.username} <${to.email}>`,
    // from: `Sender Name <${from}>`,
    // to: `Recipient <${to}>`,
    subject: subject,
    text: text,
    html: html,
  };

  if (process.env.SEND_EMAIL === 'true') {
    transporter.sendMail(mail, (err, info) => {
      if (err) {
        console.log('Error occurred. ' + err.message);
        return process.exit(1);
      }

      console.log('Message sent: %s', info.messageId);
      // Preview only available when sending through an Ethereal account
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    });
  }
};
