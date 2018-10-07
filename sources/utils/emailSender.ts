var mailgun = require('mailgun-js')({apiKey: 'ecbf0f4ae1176cc06e6a503f92179dc4-c8e745ec-260bafae', 
                                     domain: 'mg.kalastud.io'});

export class EmailSender {

  public static sendEmail(emailDest: string, subject: string, text: string): void {
      const data = {
            from: 'Perfect Week <perfect-week@kalastud.io>',
            to: emailDest,
            subject: subject,
            text: text
      };

      mailgun.messages().send(data);
  }
}