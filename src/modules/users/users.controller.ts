import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUser } from '../auth/decorator';
import { JwtGaurd } from '../auth/gaurds';
import { UserEvent } from '@common/events/user.event';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly UserEvent: UserEvent,
  ) {}
  @UseGuards(JwtGaurd)
  @Get('me')
  getMe(@GetUser() user: User) {
    return user;
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':key')
  findOne(@Param('key') key: string) {
    return this.usersService.findOne(key);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    /**
     * Update user data
     */
    const params = { id, updateUserDto };
    const updatedUser =
      await this.usersService.update(params);

    /**
     * Send Event to User Event Emitter
     */

    this.UserEvent.userUpdateEvent(updatedUser);
    return updatedUser;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
