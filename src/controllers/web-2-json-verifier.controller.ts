import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  Web2Json_Request,
  Web2Json_Response,
} from '../dtos/attestation-types/Web2Json.dto';
import { Web2JsonVerifierService } from '../services/web2-json-verifier.service';
import { BaseControllerFactory } from './base/verifier-base.controller';

@ApiTags('Web2Json')
@Controller('Web2Json')
export class Web2JsonVerifierController extends BaseControllerFactory<
  Web2Json_Request,
  Web2Json_Response
>(Web2Json_Request, Web2Json_Response) {
  constructor(public readonly verifierService: Web2JsonVerifierService) {
    super();
  }
}
