import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  BalanceDecreasingTransaction_Request,
  BalanceDecreasingTransaction_Response,
} from 'src/dtos/attestation-types/BalanceDecreasingTransaction.dto';

import { BaseVerifierController } from './base/verifier-base.controller';
import {
  DOGEBalanceDecreasingTransactionVerifierService,
  BTCBalanceDecreasingTransactionVerifierService,
  XRPBalanceDecreasingTransactionVerifierService,
} from 'src/services/balance-decreasing-transaction-verifier.service';

@ApiTags('BalanceDecreasingTransaction')
@Controller('BalanceDecreasingTransaction')
export class DOGEBalanceDecreasingTransactionVerifierController extends BaseVerifierController<
  BalanceDecreasingTransaction_Request,
  BalanceDecreasingTransaction_Response
> {
  constructor(
    protected readonly verifierService: DOGEBalanceDecreasingTransactionVerifierService,
  ) {
    super();
  }
}

@ApiTags('BalanceDecreasingTransaction')
@Controller('BalanceDecreasingTransaction')
export class BTCBalanceDecreasingTransactionVerifierController extends BaseVerifierController<
  BalanceDecreasingTransaction_Request,
  BalanceDecreasingTransaction_Response
> {
  constructor(
    protected readonly verifierService: BTCBalanceDecreasingTransactionVerifierService,
  ) {
    super();
  }
}

@ApiTags('BalanceDecreasingTransaction')
@Controller('BalanceDecreasingTransaction')
export class XRPBalanceDecreasingTransactionVerifierController extends BaseVerifierController<
  BalanceDecreasingTransaction_Request,
  BalanceDecreasingTransaction_Response
> {
  constructor(
    protected readonly verifierService: XRPBalanceDecreasingTransactionVerifierService,
  ) {
    super();
  }
}
