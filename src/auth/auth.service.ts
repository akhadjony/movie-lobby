import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  validateToken(token: string): boolean {
    return token === 'valid-admin-token';
  }
}
