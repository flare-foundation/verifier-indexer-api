import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChainType, IConfig } from '../config/configuration';
import {
  AttestationResponseDTO_IJsonApi_Response,
  IJsonApi_Request,
  IJsonApi_Response,
} from '../dtos/attestation-types/IJsonApi.dto';
import { serializeBigInts } from '../external-libs/utils';
import { verifyJsonApi } from '../verification/json-api/json-api-verifications';
import { BaseVerifierService } from './common/verifier-base.service';

@Injectable()
export class IJsonApiVerifierService extends BaseVerifierService<
  IJsonApi_Request,
  IJsonApi_Response
> {
  constructor(protected configService: ConfigService<IConfig>) {
    super(configService, {
      source: ChainType.WEB2,
      attestationName: 'IJsonApi',
    });
  }

  async verifyRequest(
    fixedRequest: IJsonApi_Request,
  ): Promise<AttestationResponseDTO_IJsonApi_Response> {
    const result = await verifyJsonApi(fixedRequest);


    return serializeBigInts({
      status: result.status,
      response: result.response,
    });
  }
}
