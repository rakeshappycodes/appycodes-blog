import { MailService } from '@common/mail/mail.service';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtGaurd } from 'modules/auth/gaurds';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CloudinaryModule } from './common/cloudinary/cloudinary.module';
import { PostsModule } from './modules/posts/posts.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { AppController } from 'app.controller';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CloudinaryModule,
    PostsModule,
    UploadsModule,
    EventEmitterModule.forRoot()
  ],
  controllers:[AppController],
  providers: [
    MailService,
    { provide: APP_GUARD, useClass: JwtGaurd },
  ],
})
export class AppModule {}
