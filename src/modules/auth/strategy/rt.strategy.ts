import {
    ExtractJwt,
    Strategy,
  } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
  
  @Injectable()
  export class RtStrategy extends PassportStrategy(
    Strategy, 'jwt-refresh'
  ) {
    constructor(
      config: ConfigService,
    ) {
      super({
        jwtFromRequest:
          ExtractJwt.fromAuthHeaderAsBearerToken(),
        passReqToCallback: true,
        secretOrKey: config.get('JWT_RT_SECRET'),
      });
    }
  
    async validate(req: Request, payload: any) {
        const refreshToken = req
          ?.get('authorization')
          ?.replace('Bearer', '')
          .trim();
    
        if (!refreshToken) throw new ForbiddenException('Refresh token malformed');
    
        return {
          ...payload,
          refreshToken,
        };
      }
  }
  