import { ConfigService } from '@nestjs/config';
import { v2 } from 'cloudinary';

export const CloudinaryProvider = {
  provide: 'Cloudinary',
  inject: [ConfigService],
  useFactory: async (config: ConfigService) => {
    const cloudinary = v2.config({
      cloud_name: config.get(
        'CLOUDINARY_CLOUD_NAME',
      ),
      api_key: config.get('CNOUDINARY_API_KEY'),
      api_secret: config.get(
        'CLOUDINARY_API_SECRET',
      ),
    });

    return cloudinary;
  },
};
