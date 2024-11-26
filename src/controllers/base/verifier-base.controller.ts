import {
  Body,
  HttpCode,
  Logger,
  Post,
  Type,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ApiSecurity } from '@nestjs/swagger';

import { ApiKeyAuthGuard } from 'src/auth/apikey.guard';
import {
  AttestationTypeBase_Request,
  AttestationTypeBase_Response,
} from 'src/dtos/attestation-types/AttestationTypeBase.dto';
import { AbstractValidationPipe } from 'src/dtos/dto-validation-pipelines';
import { BaseVerifierService } from 'src/services/common/verifier-base.service';
import {
  AttestationResponse,
  AttestationResponseVerificationEncoded,
  EncodedRequest,
  EncodedRequestResponse,
  MicResponse,
} from '../../dtos/generic/generic.dto';

export function BaseControllerFactory<
  Req extends AttestationTypeBase_Request,
  Res extends AttestationTypeBase_Response,
>(
  requestDto: Type<Req>,
  responseDto: Type<Res>,
): Type<IBaseVerifierController<Req, Res>> {
  const requestDtoPipe = new AbstractValidationPipe(
    {
      whitelist: true,
      transform: true,
    },
    { body: requestDto },
  );

  // class CrudController<T, C, U, Q> implements ICrudController<T, C, U, Q> {
  //   protected service: ICrudService<T, C, U, Q>;

  //   @Post()
  //   @UsePipes(createPipe)
  //   async create(
  //     @Body() body: C,
  //     @CurrentUser() user: Partial<User>,
  //   ): Promise<T> {
  //     return this.service.createItem(body, user);
  //   }

  //   @Get(':id')
  //   getOne(@Param() params: NumberIdDto): Promise<T> {
  //     return this.service.getItem(params.id);
  //   }

  //   @Get()
  //   @UsePipes(queryPipe)
  //   get(@Query() query: Q): Promise<T[]> {
  //     return this.service.getItems(query);
  //   }

  //   @Delete(':id')
  //   delete(@Param() params: NumberIdDto): Promise<Partial<T>> {
  //     return this.service.deleteItem(params.id);
  //   }

  //   @Patch()
  //   @UsePipes(updatePipe)
  //   update(@Body() body: U, @CurrentUser() user: Partial<User>): Promise<T> {
  //     return this.service.updateItem(body, user);
  //   }
  // }

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
