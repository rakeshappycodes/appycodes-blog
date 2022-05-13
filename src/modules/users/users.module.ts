import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserEvent } from '@common/events/user.event';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UserEvent],
})
export class UsersModule {}
