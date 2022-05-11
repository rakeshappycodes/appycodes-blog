import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import {
  AuthLoginDto,
  AuthSignupDto,
  AuthToken,
} from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import { titleCaseWord } from '@common/utils';
import { PrismaService } from '@common/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async signupLocal(dto: AuthSignupDto) {
    const hash = await argon.hash(dto.password);
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hash,
          first_name: titleCaseWord(
            dto.first_name,
          ),
          last_name: dto.last_name,
        },
      });

      return this.signToken(user);
    } catch (error) {
      if (
        error instanceof
        PrismaClientKnownRequestError
      ) {
        if (error.code === 'P2002') {
          throw new ForbiddenException(
            'Email Already Exist',
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

    return this.signToken(user);
  }

  logoutLocal() {}

  refreshToken() {}

  async signToken(
    user: User,
  ): Promise<AuthToken> {
    const payload = {
      sub: user.id,
      email: user.email,
    };

    const secret = this.config.get('JWT_SECRET');

    const token = await this.jwt.signAsync(
      payload,
      {
        expiresIn: '1h',
        secret: secret,
      },
    );

    return {
      access_token: token,
      userId: user.id,
      role: user.role,
    };
  }
}
