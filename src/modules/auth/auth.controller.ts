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
import { GetUser } from './decorator';
import {
  AuthLoginDto,
  AuthSignupDto,
} from './dto';
import {
  JwtGaurd,
  JwtRefeshGaurd,
} from './gaurds';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('/local/signup')
  signupLocal(@Body() dto: AuthSignupDto) {
    return this.auth.signupLocal(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('/local/login')
  loginLocal(@Body() dto: AuthLoginDto) {
    return this.auth.loginLocal(dto);
  }

  @UseGuards(JwtGaurd)
  @HttpCode(HttpStatus.OK)
  @Post('/local/logout')
  logoutLocal(@GetUser() user: User) {
    return this.auth.logoutLocal(user.id);
  }

  @UseGuards(JwtRefeshGaurd)
  @HttpCode(HttpStatus.OK)
  @Post('/local/refesh')
  refreshToken() {
    return this.auth.refreshToken();
  }
}
