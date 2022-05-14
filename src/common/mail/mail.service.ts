import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import { join } from 'path';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService , private config: ConfigService) {}

  async sendUserConfirmation(user: User, token: string) {
    const home_url = this.config.get('HOME_URL')
    const confirm_url = home_url + `/auth/confirm?user=${user.id}&token=${token}`;

    await this.mailerService.sendMail({
      to: user.email,
      from: '"Support Team" <support@example.com>', // override default from
      subject: 'Welcome to Nice App! Confirm your Email',
      // text:'Please active your email account by clicking the link below: ' + url,
      template: 'confirmation',
      context:{
        registeredUser: user,
        url: confirm_url,
      }
    });
  }
}
