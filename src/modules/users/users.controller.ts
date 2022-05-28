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
import { JwtGaurd } from '../auth/gaurds';
import { GetCurrentUser } from 'modules/auth/decorator';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}
  @UseGuards(JwtGaurd)
  @Get('me')
  getMe(@GetCurrentUser() user: User) {
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
    return updatedUser;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
