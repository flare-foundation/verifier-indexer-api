import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  JsonApi_Request,
  JsonApi_Response,
} from '../dtos/attestation-types/JsonApi.dto';
import {
  JsonApiVerifierService,
} from '../services/json-api-verifier.service';
import { BaseControllerFactory } from './base/verifier-base.controller';

@ApiTags('JsonApi')
@Controller('JsonApi')
export class JsonApiVerifierController extends BaseControllerFactory<
  JsonApi_Request,
  JsonApi_Response
>(JsonApi_Request, JsonApi_Response) {
  constructor(public readonly verifierService: JsonApiVerifierService) {
    super();
  }
}
