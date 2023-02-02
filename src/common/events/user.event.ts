import { MailService } from '@common/mail/mail.service';
import { Injectable } from '@nestjs/common';
import {
  EventEmitter2,
  OnEvent,
} from '@nestjs/event-emitter';
import { User } from '@prisma/client';

@Injectable()
export class UserEvent {
  constructor(
    private eventEmitter: EventEmitter2,
    private mail: MailService,
  ) {}

  userCreateEvent(user: User) {
    this.eventEmitter.emitAsync(
      'user.created',
      user,
    );
  }

  userUpdateEvent(user: any) {
    this.eventEmitter.emit('user.updated', user);
  }

  userDeleteEvent(email: string) {
    this.eventEmitter.emit('user.deleted', email);
  }

  @OnEvent('user.created')
  handleUserCreateEvent(user: any) {
   this.mail.sendUserConfirmation(user);
  }

  @OnEvent('user.updated')
  handleUserUpdateEvent(user: any) {
    console.log(user);
  }

  @OnEvent('user.deleted')
  listentToUserDeleteEvent(email: string) {
    console.log('Message Deleted: ', email);
  }
}
