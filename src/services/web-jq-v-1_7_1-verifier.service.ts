import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChainType } from '../config/configuration';
import {
  AttestationResponseDTO_WebJqV1_7_1_Response,
  WebJqV1_7_1_Request,
  WebJqV1_7_1_Response,
} from '../dtos/attestation-types/WebJqV1_7_1.dto';
import { serializeBigInts } from '../external-libs/utils';
import { verifyWebJqV1_7_1 } from '../verification/web-jq-v-1_7_1/web-jq-1_7_1-verifications';
import { BaseVerifierService } from './common/verifier-base.service';
import {
  WebJqV1_7_1Config,
  WebJqV1_7_1SecurityConfig,
  WebJqV1_7_1SourceConfig,
} from 'src/config/interfaces/webJqV1_7_1';
import { IConfig } from 'src/config/interfaces/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Injectable()
export class WebJqV1_7_1VerifierService extends BaseVerifierService<
  WebJqV1_7_1_Request,
  WebJqV1_7_1_Response
> {
  constructor(
    protected configService: ConfigService<IConfig>,
    @Inject(REQUEST) private readonly req: Request,
  ) {
    super(configService, {
      source: ChainType.WEB2,
      attestationName: 'WebJqV1_7_1',
    });
  }

  async verifyRequest(
    fixedRequest: WebJqV1_7_1_Request,
  ): Promise<AttestationResponseDTO_WebJqV1_7_1_Response> {
    const verifierConfigOptions: WebJqV1_7_1Config = this.configService.get(
      'verifierConfigOptions',
    );
    const securityConfig: WebJqV1_7_1SecurityConfig =
      verifierConfigOptions.securityConfig;
    const sourceConfig: WebJqV1_7_1SourceConfig =
      verifierConfigOptions.sourceConfig;

    // store user-agent if available
    const userAgent: string = this.req.headers['user-agent'] || '';
    const result = await verifyWebJqV1_7_1(
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
