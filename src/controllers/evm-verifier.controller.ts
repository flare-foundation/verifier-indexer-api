import { ApiTags } from '@nestjs/swagger';
import { Controller } from '@nestjs/common';
import { BaseControllerFactory } from './base/verifier-base.controller';
import {
  ETHEVMTransactionVerifierService,
  FLREVMTransactionVerifierService,
  SGBEVMTransactionVerifierService,
} from '../services/evm-transaction-verifier.service';
import {
  EVMTransaction_Request,
  EVMTransaction_Response,
} from '../dtos/attestation-types/EVMTransaction.dto';

@ApiTags('EVMTransaction', 'ETH')
@Controller('ETH/EVMTransaction')
export class ETHEVMTransactionVerifierController extends BaseControllerFactory<
  EVMTransaction_Request,
  EVMTransaction_Response
>(EVMTransaction_Request, EVMTransaction_Response) {
  constructor(
    public readonly verifierService: ETHEVMTransactionVerifierService,
  ) {
    super();
  }
}

@ApiTags('EVMTransaction', 'FLR')
@Controller('FLR/EVMTransaction')
export class FLREVMTransactionVerifierController extends BaseControllerFactory<
  EVMTransaction_Request,
  EVMTransaction_Response
>(EVMTransaction_Request, EVMTransaction_Response) {
  constructor(
    public readonly verifierService: FLREVMTransactionVerifierService,
  ) {
    super();
  }
}

@ApiTags('EVMTransaction', 'SGB')
@Controller('SGB/EVMTransaction')
export class SGBEVMTransactionVerifierController extends BaseControllerFactory<
  EVMTransaction_Request,
  EVMTransaction_Response
>(EVMTransaction_Request, EVMTransaction_Response) {
  constructor(
    public readonly verifierService: SGBEVMTransactionVerifierService,
  ) {
    super();
  }
}
