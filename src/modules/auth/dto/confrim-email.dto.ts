import {
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class ConfrimEmailDto {
  @IsString()
  @IsNotEmpty()
  email_hash: string;

  @IsString()
  @IsNotEmpty()
  user_id: string;
}
