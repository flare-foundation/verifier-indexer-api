import { Body, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';

import { ApiKeyAuthGuard } from 'src/auth/apikey.guard';
import { ARBase, ARESBase } from 'src/external-libs/interfaces';
import { BaseVerifierService } from 'src/services/common/verifier-base.service';
import {
  AttestationResponse,
  AttestationResponseVerificationEncoded,
  EncodedRequest,
  EncodedRequestResponse,
  MicResponse,
} from '../../dtos/generic/generic.dto';

@ApiTags('AddressValidity')
@UseGuards(ApiKeyAuthGuard)
@ApiSecurity('X-API-KEY')
export abstract class BaseVerifierController<
  Req extends ARBase,
  Res extends ARESBase,
> {
  protected readonly verifierService: BaseVerifierService<Req, Res>;

  /**
   * Tries to verify encoded attestation request without checking message integrity code, and if successful it returns response.
   * @param verifierBody
   * @returns
   */
  @HttpCode(200)
  @Post()
  async verify(
    @Body() body: EncodedRequest,
  ): Promise<AttestationResponse<Res>> {
    return this.verifierService.verifyEncodedRequest(body.abiEncodedRequest!);
  }

  /**
   * Tries to verify encoded attestation request without checking message integrity code, and if successful it returns response in abi encoded form.
   * @param body
   * @returns abi encoded AttestationResponse
   */
  @HttpCode(200)
  @Post('verifyFDC')
  async verifyFDC(
    @Body() body: EncodedRequest,
  ): Promise<AttestationResponseVerificationEncoded> {
    return this.verifierService.verifyEncodedRequestFDC(
      body.abiEncodedRequest!,
    );
  }

  /**
   * Tries to verify attestation request (given in JSON) without checking message integrity code, and if successful it returns response.
   * @param prepareResponseBody
   * @returns
   */
  @HttpCode(200)
  @Post('prepareResponse') // TODO: actually Request where mic is optional
  async prepareResponse(@Body() body: Req): Promise<AttestationResponse<Res>> {
    return this.verifierService.prepareResponse(body);
  }

  /**
   * Tries to verify attestation request (given in JSON) without checking message integrity code, and if successful, it returns the correct message integrity code.
   * @param body
   */
  @HttpCode(200)
  @Post('mic') // TODO: actually Request where mic is optional
  async mic(@Body() body: Req): Promise<MicResponse> {
    return this.verifierService.mic(body);
  }

  /**
   * Tries to verify attestation request (given in JSON) without checking message integrity code.
   * If successful, it returns the encoding of the attestation request with the correct message integrity code, which can be directly submitted to the State Connector contract.
   * @param body
   */
  @HttpCode(200)
  @Post('prepareRequest') // TODO: actually Request where mic is optional
  async prepareRequest(@Body() body: Req): Promise<EncodedRequestResponse> {
    return this.verifierService.prepareRequest(body);
  }
}
