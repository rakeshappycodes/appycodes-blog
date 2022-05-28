import { AuthGuard } from '@nestjs/passport';

export class JwtRefeshGaurd extends AuthGuard(
  'jwt-refresh',
) {
  constructor() {
    super();
  }
}
