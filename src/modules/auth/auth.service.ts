import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import {
  AuthLoginDto,
  AuthSignupDto,
  AuthTokenResponse,
  ConfrimEmailDto,
} from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import { titleCaseWord } from '@common/utils';
import { PrismaService } from '@common/prisma/prisma.service';
import { PrismaError } from '@common/prisma/prismaError';
import { UserNotFoundException } from '@common/exceptions';
import { MailService } from '@common/mail/mail.service';
import { Exception } from 'handlebars/runtime';

@Injectable()
export class AuthService {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async signupLocal(dto: AuthSignupDto) {
    const hash = await argon.hash(dto.password);
    const eToken =
      this.getEmailVerificationToken();
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hash,
          first_name: titleCaseWord(
            dto.first_name,
          ),
          last_name: titleCaseWord(dto.last_name),
          email_hash: eToken,
        },
      });
      delete user.password;
      return user;
    } catch (error) {
      if (
        error instanceof
        PrismaClientKnownRequestError
      ) {
        if (
          error.code ===
          PrismaError.RecordAlreadyExists
        ) {
          throw new HttpException(
            'Email Already Exist',
            HttpStatus.CONFLICT,
          );
        }
      }
      throw error;
    }
  }

  async loginLocal(dto: AuthLoginDto) {
    // Check
    const user =
      await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });

    if (!user)
      throw new ForbiddenException(
        'Email or Password Invalid',
      );

    const pwdMatches = await argon.verify(
      user.password,
      dto.password,
    );

    if (!pwdMatches)
      throw new ForbiddenException(
        'Email or Password Invalid',
      );

    if (!user.email_verifed_at)
      throw new ForbiddenException(
        'Acoount not verified',
      );

    if (!user.is_active)
      throw new ForbiddenException(
        'Acoount Disabled',
      );
    let userTokenData = await this.getTokens(user);
    return {'message': 'Successfully Registered' , 'data': userTokenData}
  }

  async logoutLocal(userId: string) {
    try {
      await this.prisma.user.updateMany({
        where: {
          id: userId,
          hashed_rt_token: {
            not: null,
          },
        },
        data: {
          hashed_rt_token: null,
        },
      });

      return;
    } catch (error) {
      if (
        error instanceof
        PrismaClientKnownRequestError
      ) {
        throw new UserNotFoundException(userId);
      }

      throw error;
    }
  }

  async verifyEmail(dto: ConfrimEmailDto) {
    const user = await this.prisma.user.findFirst(
      {
        where: {
          id: dto.user_id,
        },
      },
    );

    if (!user)
      throw new ForbiddenException(
        'Invalid Verification Hash',
      );

    if (user.is_active) {
      throw new HttpException(
        'Email Already Verified',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (user.email_hash !== dto.email_hash) {
      throw new ForbiddenException(
        'Invalid Verification Hash',
      );
    }

    try {
      const isUpdated =
        await this.prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            is_active: true,
            email_verifed_at: new Date(),
            email_hash: null,
          },
        });

      return isUpdated;
    } catch (error) {
      if (
        error instanceof
        PrismaClientKnownRequestError
      ) {
        throw new Exception(
          'Please try again later',
        );
      }
    }
  }

  async refreshToken(userId: string, rt: string) {
    const user =
      await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

    if (!user || !user.hashed_rt_token)
      throw new ForbiddenException(
        'Access Denied',
      );

    const rtMatches = await argon.verify(
      user.hashed_rt_token,
      rt,
    );

    if (!rtMatches)
      throw new ForbiddenException(
        'Invalid Token',
      );

    return this.getTokens(user);
  }

  async getTokens(
    user: User,
  ): Promise<AuthTokenResponse> {
    const payload = {
      sub: user.id,
      email: user.email,
    };

    const jwtSecret =  this.config.get('JWT_SECRET');
    const jwtRefeshSecret = this.config.get('JWT_RT_SECRET');

    const [at, rt] = await Promise.all([
      this.jwt.signAsync(payload, {
        expiresIn: this.config.get(
          'JWT_EXPIRES_IN',
        ),
        secret: jwtSecret,
      }),
      this.jwt.signAsync(payload, {
        expiresIn: this.config.get(
          'JWT_RT_EXPIRES_IN',
        ),
        secret: jwtRefeshSecret,
      }),
    ]);

    await this.updateRtToken(user.id, rt);

    return {
      access_token: at,
      refresh_token: rt,
      userId: user.id,
      role: user.role,
    };
  }

  async updateRtToken(
    userId: string,
    rtToken: string,
  ) {
    const hash = await argon.hash(rtToken);
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        hashed_rt_token: hash,
      },
    });
  }

  getEmailVerificationToken() {
    return Array.from(Array(50), () =>
      Math.floor(Math.random() * 36).toString(36),
    ).join('');
  }
}
