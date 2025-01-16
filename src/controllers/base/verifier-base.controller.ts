import {
  Body,
  HttpCode,
  Post,
  Type,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiSecurity } from '@nestjs/swagger';

import { ApiKeyAuthGuard } from '../../auth/apikey.guard';
import {
  AttestationTypeBase_Request,
  AttestationTypeBase_Response,
} from '../../dtos/attestation-types/AttestationTypeBase.dto';
import { AbstractValidationPipe } from '../../dtos/dto-validation-pipelines';
import {
  AttestationResponse,
  AttestationResponseVerificationEncoded,
  EncodedRequest,
  EncodedRequestResponse,
  MicResponse,
} from '../../dtos/generic/generic.dto';
import { BaseVerifierService } from '../../services/common/verifier-base.service';

export function BaseControllerFactory<
  Req extends AttestationTypeBase_Request,
  Res extends AttestationTypeBase_Response,
>(
  requestDto: Type<Req>,
  _responseDto: Type<Res>,
): Type<IBaseVerifierController<Req, Res>> {
  const requestDtoPipe = new AbstractValidationPipe(
    {
      whitelist: true,
      transform: true,
    },
    { body: requestDto },
  );

  @UseGuards(ApiKeyAuthGuard)
  @ApiSecurity('X-API-KEY')
  class VerifierController implements IBaseVerifierController<Req, Res> {
    public readonly verifierService: BaseVerifierService<Req, Res>;

    /**
     * Tries to verify encoded attestation request without checking message integrity code, and if successful it returns response.
     * @param verifierBody
     * @returns
     */
    @HttpCode(200)
    @Post()
    @ApiOperation({ deprecated: true })
    async verify(
      @Body() body: EncodedRequest,
    ): Promise<AttestationResponse<Res>> {
      return this.verifierService.verifyEncodedRequest(body.abiEncodedRequest);
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
        body.abiEncodedRequest,
      );
    }

    /**
     * Tries to verify attestation request (given in JSON) without checking message integrity code, and if successful it returns response.
     * @param prepareResponseBody
     * @returns
     */
    @HttpCode(200)
    @Post('prepareResponse')
    @UsePipes(requestDtoPipe)
    @ApiBody({ type: requestDto })
    async prepareResponse(
      @Body() body: Req,
    ): Promise<AttestationResponse<Res>> {
      return this.verifierService.prepareResponse(body);
    }

    /**
     * Tries to verify attestation request (given in JSON) without checking message integrity code, and if successful, it returns the correct message integrity code.
     * @param body
     */
    @HttpCode(200)
    @Post('mic')
    @UsePipes(requestDtoPipe)
    @ApiBody({ type: requestDto })
    async mic(@Body() body: Req): Promise<MicResponse> {
      return this.verifierService.mic(body);
    }

    /**
     * Tries to verify attestation request (given in JSON) without checking message integrity code.
     * If successful, it returns the encoding of the attestation request with the correct message integrity code, which can be directly submitted to the State Connector contract.
     * @param body
     */
    @HttpCode(200)
    @Post('prepareRequest')
    @UsePipes(requestDtoPipe)
    @ApiBody({ type: requestDto })
    async prepareRequest(@Body() body: Req): Promise<EncodedRequestResponse> {
      return this.verifierService.prepareRequest(body);
    }
  }

  return VerifierController;
}

export interface IBaseVerifierController<
  Req extends AttestationTypeBase_Request,
  Res extends AttestationTypeBase_Response,
> {
  readonly verifierService: BaseVerifierService<Req, Res>;

  /**
   * Tries to verify encoded attestation request without checking message integrity code, and if successful it returns response.
   * @param verifierBody
   * @returns
   */
  verify(body: EncodedRequest): Promise<AttestationResponse<Res>>;

  /**
   * Tries to verify encoded attestation request without checking message integrity code, and if successful it returns response in abi encoded form.
   * @param body
   * @returns abi encoded AttestationResponse
   */

  verifyFDC(
    body: EncodedRequest,
  ): Promise<AttestationResponseVerificationEncoded>;

  /**
   * Tries to verify attestation request (given in JSON) without checking message integrity code, and if successful it returns response.
   * @param prepareResponseBody
   * @returns
   */
  prepareResponse(body: Req): Promise<AttestationResponse<Res>>;

  /**
   * Tries to verify attestation request (given in JSON) without checking message integrity code, and if successful, it returns the correct message integrity code.
   * @param body
   */
  mic(body: Req): Promise<MicResponse>;

  /**
   * Tries to verify attestation request (given in JSON) without checking message integrity code.
   * If successful, it returns the encoding of the attestation request with the correct message integrity code, which can be directly submitted to the State Connector contract.
   * @param body
   */
  prepareRequest(body: Req): Promise<EncodedRequestResponse>;
}
