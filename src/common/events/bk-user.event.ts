import { Injectable } from '@nestjs/common';
import {
  EventEmitter2,
  OnEvent,
} from '@nestjs/event-emitter';

@Injectable()
export class UserEvent {
  constructor(
    private eventEmitter: EventEmitter2,
  ) {}

  userCreateEvent(user: any) {
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
    console.log(user);
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
