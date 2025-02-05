import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChainType, IConfig } from '../config/configuration';
import {
  AttestationResponseDTO_JsonApi_Response,
  JsonApi_Request,
  JsonApi_Response,
} from '../dtos/attestation-types/JsonApi.dto';
import { serializeBigInts } from '../external-libs/utils';
import { verifyJsonApi } from '../verification/json-api/json-api-verifications';
import { BaseVerifierService } from './common/verifier-base.service';

@Injectable()
export class JsonApiVerifierService extends BaseVerifierService<
  JsonApi_Request,
  JsonApi_Response
> {
  constructor(protected configService: ConfigService<IConfig>) {
    super(configService, {
      source: ChainType.WEB2,
      attestationName: 'JsonApi',
    });
  }

  async verifyRequest(
    fixedRequest: JsonApi_Request,
  ): Promise<AttestationResponseDTO_JsonApi_Response> {
    const result = await verifyJsonApi(fixedRequest);

    return serializeBigInts({
      status: result.status,
      response: result.response,
    });
  }
}
