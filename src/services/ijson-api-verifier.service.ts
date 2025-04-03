import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChainType } from '../config/configuration';
import {
  AttestationResponseDTO_IJsonApi_Response,
  IJsonApi_Request,
  IJsonApi_Response,
} from '../dtos/attestation-types/IJsonApi.dto';
import { serializeBigInts } from '../external-libs/utils';
import { verifyJsonApi } from '../verification/json-api/json-api-verifications';
import { BaseVerifierService } from './common/verifier-base.service';
import { IJsonApiConfig, IJsonApiSecurityConfig, IJsonApiSourceConfig } from 'src/config/interfaces/json-api';
import { IConfig } from 'src/config/interfaces/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Injectable()
export class IJsonApiVerifierService extends BaseVerifierService<
  IJsonApi_Request,
  IJsonApi_Response
> {
  constructor(protected configService: ConfigService<IConfig>,
    @Inject(REQUEST) private readonly req: Request,
  ) {
    super(configService, {
      source: ChainType.WEB2,
      attestationName: 'IJsonApi',
    });
  }

  async verifyRequest(
    fixedRequest: IJsonApi_Request,
  ): Promise<AttestationResponseDTO_IJsonApi_Response> {
    const verifierConfigOptions: IJsonApiConfig = this.configService.get("verifierConfigOptions");
    const securityConfig: IJsonApiSecurityConfig = verifierConfigOptions.securityConfig;
    const sourceConfig: IJsonApiSourceConfig = verifierConfigOptions.sourceConfig;

    const userAgent: string = this.req.headers['user-agent'] || "";
    const result = await verifyJsonApi(fixedRequest, securityConfig, sourceConfig, userAgent);

    return serializeBigInts({
      status: result.status,
      response: result.response,
    });
  }
}
