import { CloudinaryService } from '@common/cloudinary/cloudinary.service';
import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class UploadsService {
  constructor(
    private cloudinary: CloudinaryService,
  ) {}

  async uploadImage(file: Express.Multer.File) {
    return await this.cloudinary
      .uploadImage(file)
      .catch(() => {
        throw new BadRequestException(
          'Invalid file type.',
        );
      });
  }
}
