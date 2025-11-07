import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AttestationResponseDTO_Web2Json_Response,
  Web2Json_Request,
  Web2Json_Response,
} from '../dtos/attestation-types/Web2Json.dto';
import {
  encodeAttestationName,
  serializeBigInts,
} from '../external-libs/utils';
import { verifyWeb2Json } from '../verification/web-2-json/web2-json-verifications';
import { BaseVerifierService } from './common/verifier-base.service';
import { Web2JsonConfig } from 'src/config/interfaces/web2-json';
import { IConfig } from 'src/config/interfaces/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { ProcessPoolService } from '../verification/web-2-json/process-pool.service';
import {
  BackpressureException,
  getPreview,
} from '../verification/web-2-json/utils';

@Injectable()
export class Web2JsonVerifierService extends BaseVerifierService<
  Web2Json_Request,
  Web2Json_Response
> {
  private readonly logger = new Logger(Web2JsonVerifierService.name);
  private static readonly attestationName = 'Web2Json';
  private readonly web2JsonConfig: Web2JsonConfig;

  constructor(
    protected configService: ConfigService<IConfig>,
    private readonly processPool: ProcessPoolService,
    @Inject(REQUEST) private readonly req: Request,
  ) {
    super(configService, undefined);
    this.web2JsonConfig = this.configService.get('web2JsonConfig');
  }

  protected checkSupportedType(request: Web2Json_Request) {
    const supportedAttestation = encodeAttestationName(
      Web2JsonVerifierService.attestationName,
    );
    const supportedSources = this.web2JsonConfig.sources.map((s) => s.sourceId);

    if (
      request.attestationType !== supportedAttestation ||
      !supportedSources.some(
        (s) => request.sourceId == encodeAttestationName(s),
      )
    ) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: `Attestation type and source id combination not supported: (${request.attestationType}, ${request.sourceId}). Supported attestation: '${Web2JsonVerifierService.attestationName}' (${supportedAttestation}). Supported source ids: [${supportedSources.join(', ')}].`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async verifyRequest(
    fixedRequest: Web2Json_Request,
  ): Promise<AttestationResponseDTO_Web2Json_Response> {
    this.logger.debug(
      `Verifying Web2Json request: ${JSON.stringify(fixedRequest)}`,
    );

    // Fail fast: check if worker pool queue is already full before performing external fetch.
    if (this.processPool.isQueueFull()) {
      this.logger.warn(
        `Request queue is full, rejecting request to prevent overload.`,
      );
      throw new BackpressureException();
    }

    // store user-agent if available
    const userAgent: string = this.req.headers['user-agent'] || undefined;
    const sourceConfig = this.web2JsonConfig.sources.find(
      (s) => encodeAttestationName(s.sourceId) === fixedRequest.sourceId,
    );
    const result = await verifyWeb2Json(
      fixedRequest,
      this.web2JsonConfig.securityParams,
      sourceConfig,
      userAgent,
      this.processPool,
    );
    this.logger.debug(
      `Web2Json response: status: ${result.status}, result: ${getPreview(result.response?.responseBody.abiEncodedData)}`,
    );
    return serializeBigInts({
      status: result.status,
      response: result.response,
    });
  }
}
