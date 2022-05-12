import { PartialType } from '@nestjs/mapped-types';
import { AuthSignupDto } from 'modules/auth/dto';


export class UpdateUserDto extends PartialType(
  AuthSignupDto,
) {}
