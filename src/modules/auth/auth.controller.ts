import { UserEvent } from '@common/events/user.event';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { AuthService } from './auth.service';
import {
  GetCurrentUser,
  isPublic,
} from './decorator';
import {
  AuthLoginDto,
  AuthSignupDto,
  ConfrimEmailDto,
} from './dto';

import {
  JwtGaurd,
  JwtRefeshGaurd,
} from './gaurds';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService, private userEvent: UserEvent) {}

  @isPublic()
  @Post('local/signup')
  async signupLocal(@Body() dto: AuthSignupDto) {
    let user =  await this.auth.signupLocal(dto);
    this.userEvent.userCreateEvent(user);
    return user;
  }

  @HttpCode(HttpStatus.OK)
  @isPublic()
  @Post('local/login')
  loginLocal(@Body() dto: AuthLoginDto) {
    return this.auth.loginLocal(dto);
  }

  // @UseGuards(JwtGaurd)

  @HttpCode(HttpStatus.OK)
  @Post('local/logout')
  logoutLocal(@GetCurrentUser() user: User) {
    return this.auth.logoutLocal(user.id);
  }

  @isPublic()
  @UseGuards(JwtRefeshGaurd)
  @HttpCode(HttpStatus.OK)
  @Post('local/refesh')
  refreshToken(@GetCurrentUser() user: any) {
    return this.auth.refreshToken(
      user.id,
      user.refreshToken,
    );
  }

  @HttpCode(HttpStatus.OK)
  @isPublic()
  @Post('confirm')
  confrimEmail(@Body() dto: ConfrimEmailDto) {
    return this.auth.verifyEmail(dto);
  }
}
