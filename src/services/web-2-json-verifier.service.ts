import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChainType } from '../config/configuration';
import {
  AttestationResponseDTO_Web2Json_Response,
  Web2Json_Request,
  Web2Json_Response,
} from '../dtos/attestation-types/Web2Json.dto';
import { serializeBigInts } from '../external-libs/utils';
import { verifyWeb2Json } from '../verification/web-2-json/web-2-json-verifications';
import { BaseVerifierService } from './common/verifier-base.service';
import {
  Web2JsonConfig,
  Web2JsonSecurityConfig,
  Web2JsonSourceConfig,
} from 'src/config/interfaces/web2Json';
import { IConfig } from 'src/config/interfaces/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Injectable()
export class Web2JsonVerifierService extends BaseVerifierService<
  Web2Json_Request,
  Web2Json_Response
> {
  constructor(
    protected configService: ConfigService<IConfig>,
    @Inject(REQUEST) private readonly req: Request,
  ) {
    super(configService, {
      source: ChainType.PublicWeb2,
      attestationName: 'Web2Json',
    });
  }

  async verifyRequest(
    fixedRequest: Web2Json_Request,
  ): Promise<AttestationResponseDTO_Web2Json_Response> {
    const verifierConfigOptions: Web2JsonConfig = this.configService.get(
      'verifierConfigOptions',
    );
    const securityConfig: Web2JsonSecurityConfig =
      verifierConfigOptions.securityConfig;
    const sourceConfig: Web2JsonSourceConfig =
      verifierConfigOptions.sourceConfig;

    // store user-agent if available
    const userAgent: string = this.req.headers['user-agent'] || '';
    const result = await verifyWeb2Json(
      fixedRequest,
      securityConfig,
      sourceConfig,
      userAgent,
    );

    return serializeBigInts({
      status: result.status,
      response: result.response,
    });
  }
}
