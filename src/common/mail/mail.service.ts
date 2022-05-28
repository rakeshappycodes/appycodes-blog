import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import { join } from 'path';

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    private config: ConfigService,
  ) {}

  async sendUserConfirmation(
    user: User,
    token: string,
  ) {
    const confirm_url = this.config.get(
      'MAIl_COFIRM_URL',
    );
    const mailFrom = this.config.get('MAIL_FROM');
    const full_confirm_url =
      confirm_url +
      `?auth_key=${user.id}&token=${token}`;

    await this.mailerService.sendMail({
      to: user.email,
      from: mailFrom, // override default from
      subject:
        'Welcome to Appycodes Blog! Confirm your Email',
      template: 'confirmation',
      context: {
        registeredUser: user,
        url: full_confirm_url,
      },
    });
  }
}
