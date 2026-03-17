import { ApiTags } from '@nestjs/swagger';
import { Controller } from '@nestjs/common';
import { BaseControllerFactory } from './base/verifier-base.controller';
import {
  BASEEVMTransactionVerifierService,
  ETHEVMTransactionVerifierService,
  FLREVMTransactionVerifierService,
  HYPEEVMTransactionVerifierService,
  SGBEVMTransactionVerifierService,
} from '../services/evm-transaction-verifier.service';
import {
  EVMTransaction_Request,
  EVMTransaction_Response,
} from '../dtos/attestation-types/EVMTransaction.dto';

@ApiTags('EVMTransaction', 'ETH')
@Controller('EVMTransaction')
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
@Controller('EVMTransaction')
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
@Controller('EVMTransaction')
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

@ApiTags('EVMTransaction', 'BASE')
@Controller('EVMTransaction')
export class BASEEVMTransactionVerifierController extends BaseControllerFactory<
  EVMTransaction_Request,
  EVMTransaction_Response
>(EVMTransaction_Request, EVMTransaction_Response) {
  constructor(
    public readonly verifierService: BASEEVMTransactionVerifierService,
  ) {
    super();
  }
}

@ApiTags('EVMTransaction', 'HYPE')
@Controller('EVMTransaction')
export class HYPEEVMTransactionVerifierController extends BaseControllerFactory<
  EVMTransaction_Request,
  EVMTransaction_Response
>(EVMTransaction_Request, EVMTransaction_Response) {
  constructor(
    public readonly verifierService: HYPEEVMTransactionVerifierService,
  ) {
    super();
  }
}
