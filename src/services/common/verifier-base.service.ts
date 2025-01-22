import { ChainType, ZERO_BYTES_32 } from '@flarenetwork/mcc';
import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AttestationTypeOptions,
  IConfig,
  SourceNames,
  VerifierServerConfig,
} from '../../config/configuration';

import { EntityManager } from 'typeorm';
import {
  AttestationTypeBase_Request,
  AttestationTypeBase_Response,
} from '../../dtos/attestation-types/AttestationTypeBase.dto';
import {
  AttestationResponse,
  AttestationResponseEncoded,
  AttestationResponseStatus,
  EncodedRequestResponse,
  MicResponse,
} from '../../dtos/generic/generic.dto';
import { AttestationDefinitionStore } from '../../external-libs/AttestationDefinitionStore';
import { MIC_SALT, encodeAttestationName } from '../../external-libs/utils';
import { IIndexedQueryManager } from '../../indexed-query-manager/IIndexedQueryManager';
import { IndexedQueryManagerOptions } from '../../indexed-query-manager/indexed-query-manager-types';
import {
  BtcIndexerQueryManager,
  DogeIndexerQueryManager,
} from '../../indexed-query-manager/UtxoIndexQueryManager';
import { XrpIndexerQueryManager } from '../../indexed-query-manager/XrpIndexerQueryManager';

interface IVerificationServiceConfig {
  source: ChainType;
  attestationName: AttestationTypeOptions;
}

interface IVerificationServiceWithIndexerConfig
  extends IVerificationServiceConfig {
  indexerQueryManager:
    | typeof DogeIndexerQueryManager
    | typeof BtcIndexerQueryManager
    | typeof XrpIndexerQueryManager;
}

export type ITypeSpecificVerificationServiceConfig = Omit<
  IVerificationServiceWithIndexerConfig,
  'attestationName'
>;

export abstract class BaseVerifierService<
  Req extends AttestationTypeBase_Request,
  Res extends AttestationTypeBase_Response,
> {
  store: AttestationDefinitionStore;

  source: SourceNames;
  attestationName: AttestationTypeOptions;
  isTestnet: boolean;

  constructor(
    protected configService: ConfigService<IConfig>,
    config: IVerificationServiceConfig,
  ) {
    this.store = new AttestationDefinitionStore('src/config/type-definitions');
    this.source = getSourceName(config.source);
    this.attestationName = config.attestationName;
    this.isTestnet = this.configService.getOrThrow<boolean>('isTestnet');
  }

  protected abstract verifyRequest(
    fixedRequest: Req,
  ): Promise<AttestationResponse<Res>>;

  private async verifyRequestInternal(
    request: Req,
  ): Promise<AttestationResponse<Res>> {
    if (
      request.attestationType !== encodeAttestationName(this.attestationName) ||
      request.sourceId !==
        encodeAttestationName((this.isTestnet ? 'test' : '') + this.source)
    ) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: `Attestation type and source id combination not supported: (${
            request.attestationType
          }, ${request.sourceId}). This source supports attestation type '${
            this.attestationName
          }' (${encodeAttestationName(this.attestationName)}) and source id '${
            (this.isTestnet ? 'test' : '') + this.source
          }' (${encodeAttestationName(
            (this.isTestnet ? 'test' : '') + this.source,
          )}).`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const fixedRequest = {
      messageIntegrityCode: ZERO_BYTES_32,
      ...request, // if messageIntegrityCode is provided, it will shadow zero messageIntegrityCode
    };

    return this.verifyRequest(fixedRequest);
  }

  public async verifyEncodedRequest(
    abiEncodedRequest: string,
  ): Promise<AttestationResponse<Res>> {
    const requestJSON = this.store.parseRequest<
      {
        messageIntegrityCode: string;
      } & Req
    >(abiEncodedRequest);
    const response = await this.verifyRequestInternal(requestJSON);
    return response;
  }

  public async verifyEncodedRequestFDC(
    abiEncodedRequest: string,
  ): Promise<AttestationResponseEncoded> {
    let response: AttestationResponse<Res>;
    try {
      const requestJSON = this.store.parseRequest<
        {
          messageIntegrityCode: string;
        } & Req
      >(abiEncodedRequest);
      response = await this.verifyRequestInternal(requestJSON);
    } catch (error) {
      Logger.debug(`Error parsing request: ${abiEncodedRequest}`);
      Logger.error(`Error parsing request: ${error}`);
      return {
        status: AttestationResponseStatus.MALFORMED,
      };
    }
    if (
      response.status !== AttestationResponseStatus.VALID ||
      !response.response
    ) {
      return {
        status: response.status,
      };
    }
    const encoded = this.store.encodeResponse(response.response);
    return {
      status: response.status,
      abiEncodedResponse: encoded,
    };
  }

  public async prepareResponse(
    request: Req,
  ): Promise<AttestationResponse<Res>> {
    const response = await this.verifyRequestInternal(request);
    return response;
  }

  public async mic(request: Req): Promise<MicResponse> {
    const result = await this.verifyRequestInternal(request);
    if (result.status !== AttestationResponseStatus.VALID) {
      return new MicResponse({ status: result.status });
    }
    const response = result.response;
    if (!response) return new MicResponse({ status: result.status });
    return new MicResponse({
      status: AttestationResponseStatus.VALID,
      messageIntegrityCode: this.store.attestationResponseHash<Res>(
        response,
        MIC_SALT,
      ),
    });
  }

  public async prepareRequest(request: Req): Promise<EncodedRequestResponse> {
    const result = await this.verifyRequestInternal(request);
    if (result.status !== AttestationResponseStatus.VALID) {
      return new EncodedRequestResponse({ status: result.status });
    }
    const response = result.response;

    if (!response) return new EncodedRequestResponse({ status: result.status });
    const newRequest = {
      ...request,
      messageIntegrityCode: this.store.attestationResponseHash<Res>(
        response,
        MIC_SALT,
      ),
    };

    return new EncodedRequestResponse({
      status: AttestationResponseStatus.VALID,
      abiEncodedRequest: this.store.encodeRequest(newRequest).toLowerCase(),
    });
  }
}

export abstract class BaseVerifierServiceWithIndexer<
  Req extends AttestationTypeBase_Request,
  Res extends AttestationTypeBase_Response,
> extends BaseVerifierService<Req, Res> {
  indexedQueryManager: IIndexedQueryManager;

  constructor(
    protected configService: ConfigService<IConfig>,
    protected manager: EntityManager,
    options: IVerificationServiceWithIndexerConfig,
  ) {
    super(configService, {
      source: options.source,
      attestationName: options.attestationName,
    });
    const verifierConfig =
      this.configService.get<VerifierServerConfig>('verifierConfig');
    const numberOfConfirmations = verifierConfig.numberOfConfirmations;
    const IqmOptions: IndexedQueryManagerOptions = {
      chainType: options.source,
      entityManager: this.manager,
      numberOfConfirmations: () => {
        return numberOfConfirmations;
      },
    };
    this.indexedQueryManager = new options.indexerQueryManager(IqmOptions);
  }
}

export function fromNoMic<
  T extends Omit<AttestationTypeBase_Request, 'messageIntegrityCode'>,
>(request: T) {
  const fixedRequest = {
    messageIntegrityCode: ZERO_BYTES_32,
    ...request, // if messageIntegrityCode is provided, it will be shadowed
  };
  return fixedRequest;
}

function getSourceName(source: ChainType): SourceNames {
  switch (source) {
    case ChainType.DOGE:
      return 'DOGE';
    case ChainType.BTC:
      return 'BTC';
    case ChainType.XRP:
      return 'XRP';
    default:
      throw new Error(`Unsupported source chain, ${source}`);
  }
}
