import { ZERO_BYTES_32 } from '@flarenetwork/mcc';
import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AttestationTypeOptions,
  ChainType,
  ChainSourceNames,
} from '../../config/configuration';

import { EntityManager } from 'typeorm';
import {
  AttestationTypeBase_Request,
  AttestationTypeBase_Response,
} from '../../dtos/attestation-types/AttestationTypeBase.dto';
import {
  AttestationResponse,
  AttestationResponseEncoded,
  EncodedRequestResponse,
  MicResponse,
} from '../../dtos/generic/generic.dto';
import { AttestationDefinitionStore } from '../../external-libs/AttestationDefinitionStore';
import { encodeAttestationName, MIC_SALT } from '../../external-libs/utils';
import { IIndexedQueryManager } from '../../indexed-query-manager/IIndexedQueryManager';
import { IndexedQueryManagerOptions } from '../../indexed-query-manager/indexed-query-manager-types';
import {
  BtcIndexerQueryManager,
  DogeIndexerQueryManager,
} from '../../indexed-query-manager/UtxoIndexQueryManager';
import { XrpIndexerQueryManager } from '../../indexed-query-manager/XrpIndexerQueryManager';
import { AttestationResponseStatus } from '../../verification/response-status';
import { IConfig, VerifierServerConfig } from 'src/config/interfaces/common';

interface IVerificationServiceConfig {
  chainType: ChainType;
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
  private readonly store = new AttestationDefinitionStore(
    'src/config/type-definitions',
  );
  protected readonly isTestnet: boolean;

  constructor(
    protected readonly configService: ConfigService<IConfig>,
    protected readonly config: IVerificationServiceConfig,
  ) {
    this.isTestnet = this.configService.getOrThrow<boolean>('isTestnet');
  }

  protected abstract verifyRequest(
    fixedRequest: Req,
  ): Promise<AttestationResponse<Res>>;

  private async verifyRequestInternal(
    request: Req,
  ): Promise<AttestationResponse<Res>> {
    this.checkSupportedType(request);

    const fixedRequest = {
      messageIntegrityCode: ZERO_BYTES_32,
      ...request, // if messageIntegrityCode is provided, it will shadow zero messageIntegrityCode
    };
    return this.verifyRequest(fixedRequest);
  }

  protected checkSupportedType(request: Req) {
    const source = getSourceName(this.config.chainType);
    const attestationName = this.config.attestationName;

    if (
      request.attestationType !== encodeAttestationName(attestationName) ||
      request.sourceId !==
        encodeAttestationName((this.isTestnet ? 'test' : '') + source)
    ) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: `Attestation type and source id combination not supported: (${
            request.attestationType
          }, ${request.sourceId}). This source supports attestation type '${
            attestationName
          }' (${encodeAttestationName(attestationName)}) and source id '${
            (this.isTestnet ? 'test' : '') + source
          }' (${encodeAttestationName(
            (this.isTestnet ? 'test' : '') + source,
          )}).`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
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
      (response.status !== AttestationResponseStatus.VALID ||
        !response.response) &&
      this.config.attestationName !== 'AddressValidity'
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
    if (
      result.status !== AttestationResponseStatus.VALID &&
      this.config.attestationName !== 'AddressValidity'
    ) {
      return new MicResponse({ status: result.status });
    }
    const response = result.response;
    if (!response) return new MicResponse({ status: result.status });
    return new MicResponse({
      status: result.status,
      messageIntegrityCode: this.store.attestationResponseHash<Res>(
        response,
        MIC_SALT,
      ),
    });
  }

  public async prepareRequest(request: Req): Promise<EncodedRequestResponse> {
    const result = await this.verifyRequestInternal(request);
    if (
      result.status !== AttestationResponseStatus.VALID &&
      this.config.attestationName !== 'AddressValidity'
    ) {
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
      status: result.status,
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
      chainType: options.chainType,
      attestationName: options.attestationName,
    });
    const verifierConfig =
      this.configService.get<VerifierServerConfig>('verifierConfig');
    const numberOfConfirmations = verifierConfig.numberOfConfirmations;
    const IqmOptions: IndexedQueryManagerOptions = {
      chainType: options.chainType,
      entityManager: this.manager,
      numberOfConfirmations: () => {
        return numberOfConfirmations;
      },
    };
    this.indexedQueryManager = new options.indexerQueryManager(IqmOptions);
  }
}

function getSourceName(chainType: ChainType): ChainSourceNames {
  switch (chainType) {
    case ChainType.DOGE:
      return 'DOGE';
    case ChainType.BTC:
      return 'BTC';
    case ChainType.XRP:
      return 'XRP';
    default:
      throw new Error(`Unsupported source chain, ${chainType}`);
  }
}
