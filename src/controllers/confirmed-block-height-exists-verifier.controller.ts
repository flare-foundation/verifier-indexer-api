import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  ConfirmedBlockHeightExists_Request,
  ConfirmedBlockHeightExists_Response,
} from '../dtos/attestation-types/ConfirmedBlockHeightExists.dto';
import {
  BTCConfirmedBlockHeightExistsVerifierService,
  DOGEConfirmedBlockHeightExistsVerifierService,
  XRPConfirmedBlockHeightExistsVerifierService,
} from '../services/confirmed-block-height-exists-verifier.service';
import { BaseControllerFactory } from './base/verifier-base.controller';

@ApiTags('ConfirmedBlockHeightExists')
@Controller('ConfirmedBlockHeightExists')
export class DOGEConfirmedBlockHeightExistsVerifierController extends BaseControllerFactory<
  ConfirmedBlockHeightExists_Request,
  ConfirmedBlockHeightExists_Response
>(ConfirmedBlockHeightExists_Request, ConfirmedBlockHeightExists_Response) {
  constructor(
    public readonly verifierService: DOGEConfirmedBlockHeightExistsVerifierService,
  ) {
    super();
  }
}

@ApiTags('ConfirmedBlockHeightExists')
@Controller('ConfirmedBlockHeightExists')
export class BTCConfirmedBlockHeightExistsVerifierController extends BaseControllerFactory<
  ConfirmedBlockHeightExists_Request,
  ConfirmedBlockHeightExists_Response
>(ConfirmedBlockHeightExists_Request, ConfirmedBlockHeightExists_Response) {
  constructor(
    public readonly verifierService: BTCConfirmedBlockHeightExistsVerifierService,
  ) {
    super();
  }
}

@ApiTags('ConfirmedBlockHeightExists')
@Controller('ConfirmedBlockHeightExists')
export class XRPConfirmedBlockHeightExistsVerifierController extends BaseControllerFactory<
  ConfirmedBlockHeightExists_Request,
  ConfirmedBlockHeightExists_Response
>(ConfirmedBlockHeightExists_Request, ConfirmedBlockHeightExists_Response) {
  constructor(
    public readonly verifierService: XRPConfirmedBlockHeightExistsVerifierService,
  ) {
    super();
  }
}
