import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthLoginDto, AuthSignupDto } from './dto';

@Controller('auth')
export class AuthController {

    constructor(private auth: AuthService){}


    @Post('/local/signup')
    signupLocal(@Body() dto:AuthSignupDto){
        return this.auth.signupLocal(dto)
    }

    @HttpCode(HttpStatus.OK)
    @Post('/local/login')
    loginLocal(@Body() dto: AuthLoginDto){
        return this.auth.loginLocal(dto)
    }


    @Post('/local/logout')
    logoutLocal(){
        return this.auth.logoutLocal()
    }


    @Post('/local/refesh')
    refreshToken(){
        return this.auth.refreshToken()
    }


}
