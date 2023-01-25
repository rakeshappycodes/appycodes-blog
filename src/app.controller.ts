import { Controller, Get } from '@nestjs/common';
import { isPublic } from 'modules/auth/decorator';

@Controller()
export class AppController {
  @isPublic()
  @Get('')
  welcome() {
    return { msg: 'Welcome to the API' };
  }
}
