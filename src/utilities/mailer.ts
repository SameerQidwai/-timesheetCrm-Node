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

  let MAILER_HOST = 'smtp.office365.com';
  let MAILER_PORT = 587;
  let MAILER_SSL = false;
  let MAILER_USER = 'support@timewize.com.au';
  let MAILER_PWD = '123123testtest';

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
    from: `OneLM <${from}>`,
    to: `${to.username} <${to.email}>`,
    // from: `Sender Name <${from}>`,
    // to: `Recipient <${to}>`,
    subject: subject,
    text: text,
    html: html,
  };

  transporter.sendMail(mail, (err, info) => {
    if (err) {
      console.log('Error occurred. ' + err.message);
      return process.exit(1);
    }

    console.log('Message sent: %s', info.messageId);
    // Preview only available when sending through an Ethereal account
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  });
};
