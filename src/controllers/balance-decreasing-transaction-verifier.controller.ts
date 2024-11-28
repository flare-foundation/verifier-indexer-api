import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  BalanceDecreasingTransaction_Request,
  BalanceDecreasingTransaction_Response,
} from '../dtos/attestation-types/BalanceDecreasingTransaction.dto';

import {
  BTCBalanceDecreasingTransactionVerifierService,
  DOGEBalanceDecreasingTransactionVerifierService,
  XRPBalanceDecreasingTransactionVerifierService,
} from '../services/balance-decreasing-transaction-verifier.service';
import { BaseControllerFactory } from './base/verifier-base.controller';

@ApiTags('BalanceDecreasingTransaction')
@Controller('BalanceDecreasingTransaction')
export class DOGEBalanceDecreasingTransactionVerifierController extends BaseControllerFactory<
BalanceDecreasingTransaction_Request,
BalanceDecreasingTransaction_Response
>(BalanceDecreasingTransaction_Request, BalanceDecreasingTransaction_Response){
  constructor(
    public readonly verifierService: DOGEBalanceDecreasingTransactionVerifierService,
  ) {
    super();
  }
}

@ApiTags('BalanceDecreasingTransaction')
@Controller('BalanceDecreasingTransaction')
export class BTCBalanceDecreasingTransactionVerifierController extends BaseControllerFactory<
BalanceDecreasingTransaction_Request,
BalanceDecreasingTransaction_Response
>(BalanceDecreasingTransaction_Request, BalanceDecreasingTransaction_Response){
  constructor(
    public readonly verifierService: BTCBalanceDecreasingTransactionVerifierService,
  ) {
    super();
  }
}

@ApiTags('BalanceDecreasingTransaction')
@Controller('BalanceDecreasingTransaction')
export class XRPBalanceDecreasingTransactionVerifierController extends BaseControllerFactory<
BalanceDecreasingTransaction_Request,
BalanceDecreasingTransaction_Response
>(BalanceDecreasingTransaction_Request, BalanceDecreasingTransaction_Response){
  constructor(
    public readonly verifierService: XRPBalanceDecreasingTransactionVerifierService,
  ) {
    super();
  }
}
