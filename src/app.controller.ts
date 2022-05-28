import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  welcome() {
    return { msg: 'Welcome to the API' };
  }
}
