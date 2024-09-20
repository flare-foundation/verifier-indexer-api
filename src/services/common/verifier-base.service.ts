import { ZERO_BYTES_32 } from '@flarenetwork/mcc';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IConfig, VerifierTypeOptions } from 'src/config/configuration';

import { ARBase, ARESBase } from 'src/external-libs/interfaces';
import {
  AddressValidity_Request,
  AddressValidity_Response,
} from '../../dtos/attestation-types/AddressValidity.dto';
import {
  AttestationResponse,
  AttestationResponseEncoded,
  AttestationResponseStatus,
  EncodedRequestResponse,
  MicResponse,
} from '../../dtos/generic/generic.dto';
import { AttestationDefinitionStore } from '../../external-libs/AttestationDefinitionStore';
import { MIC_SALT, encodeAttestationName } from '../../external-libs/utils';

export interface IVerificationServiceConfig {
  source: VerifierTypeOptions;
  attestationName: string; // TODO: add union type for attestation names
}

export abstract class BaseVerifierService<
  Req extends ARBase,
  Res extends ARESBase,
> {
  store: AttestationDefinitionStore;

  source: VerifierTypeOptions;
  attestationName: string;
  isTestnet: boolean;

  constructor(
    protected configService: ConfigService<IConfig>,
    config: IVerificationServiceConfig,
  ) {
    this.store = new AttestationDefinitionStore('src/config/type-definitions');
    this.source = config.source;
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
          }, ${
            request.sourceId
          }). This source supports attestation type '${this.attestationName}' (${encodeAttestationName(this.attestationName)}) and source id '${
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
      ...request, // if messageIntegrityCode is provided, it will be shadowed
    };

    return this.verifyRequest(fixedRequest);
  }

  public async verifyEncodedRequest(
    abiEncodedRequest: string,
  ): Promise<AttestationResponse<Res>> {
    const requestJSON = this.store.parseRequest<Req>(abiEncodedRequest);
    const response = await this.verifyRequestInternal(requestJSON);
    return response;
  }

  public async verifyEncodedRequestFDC(
    abiEncodedRequest: string,
  ): Promise<AttestationResponseEncoded> {
    const requestJSON = this.store.parseRequest<Req>(abiEncodedRequest);
    const response = await this.verifyRequestInternal(requestJSON);
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
      messageIntegrityCode:
        this.store.attestationResponseHash<AddressValidity_Response>(
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
      messageIntegrityCode:
        this.store.attestationResponseHash<AddressValidity_Response>(
          response,
          MIC_SALT,
        )!,
    } as AddressValidity_Request;

    return new EncodedRequestResponse({
      status: AttestationResponseStatus.VALID,
      abiEncodedRequest: this.store.encodeRequest(newRequest),
    });
  }
}

export function fromNoMic<T extends Omit<ARBase, 'messageIntegrityCode'>>(
  request: T,
) {
  const fixedRequest = {
    messageIntegrityCode: ZERO_BYTES_32,
    ...request, // if messageIntegrityCode is provided, it will be shadowed
  };
  return fixedRequest;
}
