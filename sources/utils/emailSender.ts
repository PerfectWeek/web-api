var mailgun = require('mailgun-js')({apiKey: process.env.API_KEY, 
                                     domain: process.env.API_DOMAIN});

export class EmailSender {

  public static sendEmail(emailDest: string, subject: string, text: string): void {
    if (process.env.EMAIL_ENABLED) {
      const data = {
        from: 'Perfect Week<perfectweek@kalastud.io>',
        to: emailDest,
        subject: subject,
        text: text
      };

      mailgun.messages().send(data);
    }
  }
}
