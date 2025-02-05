import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  IJsonApi_Request,
  IJsonApi_Response,
} from '../dtos/attestation-types/IJsonApi.dto';
import { IJsonApiVerifierService } from '../services/ijson-api-verifier.service';
import { BaseControllerFactory } from './base/verifier-base.controller';

@ApiTags('JsonApi')
@Controller('JsonApi')
export class IJsonApiVerifierController extends BaseControllerFactory<
  IJsonApi_Request,
  IJsonApi_Response
>(IJsonApi_Request, IJsonApi_Response) {
  constructor(public readonly verifierService: IJsonApiVerifierService) {
    super();
  }
}
