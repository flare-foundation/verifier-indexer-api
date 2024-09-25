import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  ConfirmedBlockHeightExists_Request,
  ConfirmedBlockHeightExists_Response,
} from 'src/dtos/attestation-types/ConfirmedBlockHeightExists.dto';
import {
  BTCConfirmedBlockHeightExistsVerifierService,
  DOGEConfirmedBlockHeightExistsVerifierService,
  XRPConfirmedBlockHeightExistsVerifierService,
} from 'src/services/confirmed-block-height-exists-verifier.service';
import { BaseVerifierController } from './base/verifier-base.controller';

@ApiTags('ConfirmedBlockHeightExists')
@Controller('ConfirmedBlockHeightExists')
export class DOGEConfirmedBlockHeightExistsVerifierController extends BaseVerifierController<
  ConfirmedBlockHeightExists_Request,
  ConfirmedBlockHeightExists_Response
> {
  constructor(
    protected readonly verifierService: DOGEConfirmedBlockHeightExistsVerifierService,
  ) {
    super();
  }
}

@ApiTags('ConfirmedBlockHeightExists')
@Controller('ConfirmedBlockHeightExists')
export class BTCConfirmedBlockHeightExistsVerifierController extends BaseVerifierController<
  ConfirmedBlockHeightExists_Request,
  ConfirmedBlockHeightExists_Response
> {
  constructor(
    protected readonly verifierService: BTCConfirmedBlockHeightExistsVerifierService,
  ) {
    super();
  }
}

@ApiTags('ConfirmedBlockHeightExists')
@Controller('ConfirmedBlockHeightExists')
export class XRPConfirmedBlockHeightExistsVerifierController extends BaseVerifierController<
  ConfirmedBlockHeightExists_Request,
  ConfirmedBlockHeightExists_Response
> {
  constructor(
    protected readonly verifierService: XRPConfirmedBlockHeightExistsVerifierService,
  ) {
    super();
  }
}
