import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { isPublic } from 'modules/auth/decorator';
import { UploadsService } from './uploads.service';

@Controller('uploads')
export class UploadsController {
  constructor(
    private readonly uploadsService: UploadsService,
  ) {}

  @isPublic()
  @Post('single')
  @UseInterceptors(FileInterceptor('file'))
  signupLocal(@UploadedFile() file) {
    return this.uploadsService.uploadImage(file);
  }
}
