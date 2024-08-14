import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IConfig } from 'src/config/configuration';

@Injectable()
export class AuthService {
  API_KEYS: string[];

  constructor(private readonly configService: ConfigService<IConfig>) {
    const API_KEYS = this.configService.get('api_keys');
    if (!API_KEYS) {
      throw new Error('Env variables are missing (API_KEYS)');
    }
    this.API_KEYS = API_KEYS;
  }

  validateApiKey(apiKey: string): boolean {
    return this.API_KEYS.includes(apiKey);
  }
}
