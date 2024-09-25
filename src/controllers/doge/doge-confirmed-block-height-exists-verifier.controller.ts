// ///////////////////////////////////////////////////////////////
// // THIS IS GENERATED CODE. DO NOT CHANGE THIS FILE MANUALLY .//
// ///////////////////////////////////////////////////////////////

// import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
// import { ApiSecurity, ApiTags } from '@nestjs/swagger';

// import { ApiKeyAuthGuard } from 'src/auth/apikey.guard';
// import {
//   AttestationResponseDTO_ConfirmedBlockHeightExists_Response,
//   ConfirmedBlockHeightExists_RequestNoMic,
// } from '../../dtos/attestation-types/ConfirmedBlockHeightExists.dto';
// import {
//   EncodedRequest,
//   EncodedRequestResponse,
//   MicResponse,
// } from '../../dtos/generic/generic.dto';
// import { DOGEConfirmedBlockHeightExistsVerifierService } from 'src/services/confirmed-block-height-exists-verifier.service';

// @ApiTags('ConfirmedBlockHeightExists')
// @Controller('ConfirmedBlockHeightExists')
// @UseGuards(ApiKeyAuthGuard)
// @ApiSecurity('X-API-KEY')
// export class DOGEConfirmedBlockHeightExistsVerifierController {
//   constructor(
//     private readonly verifierService: DOGEConfirmedBlockHeightExistsVerifierService,
//   ) {}

//   /**
//    *
//    * Tries to verify encoded attestation request without checking message integrity code, and if successful it returns response.
//    * @param verifierBody
//    * @returns
//    */
//   @HttpCode(200)
//   @Post()
//   async verify(
//     @Body() body: EncodedRequest,
//   ): Promise<AttestationResponseDTO_ConfirmedBlockHeightExists_Response> {
//     return this.verifierService.verifyEncodedRequest(body.abiEncodedRequest!);
//   }

//   /**
//    * Tries to verify attestation request (given in JSON) without checking message integrity code, and if successful it returns response.
//    * @param prepareResponseBody
//    * @returns
//    */
//   @HttpCode(200)
//   @Post('prepareResponse')
//   async prepareResponse(
//     @Body() body: ConfirmedBlockHeightExists_RequestNoMic,
//   ): Promise<AttestationResponseDTO_ConfirmedBlockHeightExists_Response> {
//     return this.verifierService.prepareResponse(body);
//   }

//   /**
//    * Tries to verify attestation request (given in JSON) without checking message integrity code, and if successful, it returns the correct message integrity code.
//    * @param body
//    */
//   @HttpCode(200)
//   @Post('mic')
//   async mic(
//     @Body() body: ConfirmedBlockHeightExists_RequestNoMic,
//   ): Promise<MicResponse> {
//     return this.verifierService.mic(body);
//   }

//   /**
//    * Tries to verify attestation request (given in JSON) without checking message integrity code.
//    * If successful, it returns the encoding of the attestation request with the correct message integrity code, which can be directly submitted to the State Connector contract.
//    * @param body
//    */
//   @HttpCode(200)
//   @Post('prepareRequest')
//   async prepareRequest(
//     @Body() body: ConfirmedBlockHeightExists_RequestNoMic,
//   ): Promise<EncodedRequestResponse> {
//     return this.verifierService.prepareRequest(body);
//   }
// }
