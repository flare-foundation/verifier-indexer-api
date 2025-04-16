import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  WebJqV1_7_1_Request,
  WebJqV1_7_1_Response,
} from '../dtos/attestation-types/WebJqV1_7_1.dto';
import { WebJqV1_7_1VerifierService } from '../services/web-jq-v-1_7_1-verifier.service';
import { BaseControllerFactory } from './base/verifier-base.controller';

@ApiTags('WebJqV1_7_1')
@Controller('WebJqV1_7_1')
export class WebJqV1_7_1VerifierController extends BaseControllerFactory<
  WebJqV1_7_1_Request,
  WebJqV1_7_1_Response
>(WebJqV1_7_1_Request, WebJqV1_7_1_Response) {
  constructor(public readonly verifierService: WebJqV1_7_1VerifierService) {
    super();
  }
}
