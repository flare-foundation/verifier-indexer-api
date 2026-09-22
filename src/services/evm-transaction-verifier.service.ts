import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { VerifierType } from '../config/configuration';

import { BaseVerifierService } from './common/verifier-base.service';
import {
  EVMTransaction_Request,
  EVMTransaction_Response,
} from '../dtos/attestation-types/EVMTransaction.dto';
import { AttestationResponse } from '../dtos/generic/generic.dto';
import { IConfig } from '../config/interfaces/common';
import { verifyEVMTransactionRequest } from '../verification/evm-transaction/evm-transaction';
import { EvmNodeEngineService } from './evm-services/evm-node-engine.service';

export abstract class BaseEVMTransactionVerifierService extends BaseVerifierService<
  EVMTransaction_Request,
  EVMTransaction_Response
> {
  protected readonly logger: Logger;

  protected constructor(
    protected configService: ConfigService<IConfig>,
    protected readonly nodeEngine: EvmNodeEngineService,
    verifierType: VerifierType,
  ) {
    super(configService, 'EVMTransaction', verifierType);
    this.logger = new Logger(new.target.name);
  }

  async verifyRequest(
    request: EVMTransaction_Request,
  ): Promise<AttestationResponse<EVMTransaction_Response>> {
    this.logger.debug(
      `Verifying EVMTransaction request: ${JSON.stringify(request)}`,
    );
    const result = await verifyEVMTransactionRequest(
      request,
      this.nodeEngine.provider,
    );
    this.logger.debug(
      `EVMTransaction response: status: ${result.status}, result: ${JSON.stringify(result.response?.responseBody ?? 'none')}`,
    );
    return result;
  }
}

@Injectable()
export class ETHEVMTransactionVerifierService extends BaseEVMTransactionVerifierService {
  constructor(
    protected configService: ConfigService<IConfig>,
    nodeEngine: EvmNodeEngineService,
  ) {
    super(configService, nodeEngine, VerifierType.ETH);
  }
}

@Injectable()
export class FLREVMTransactionVerifierService extends BaseEVMTransactionVerifierService {
  constructor(
    protected configService: ConfigService<IConfig>,
    nodeEngine: EvmNodeEngineService,
  ) {
    super(configService, nodeEngine, VerifierType.FLR);
  }
}

@Injectable()
export class SGBEVMTransactionVerifierService extends BaseEVMTransactionVerifierService {
  constructor(
    protected configService: ConfigService<IConfig>,
    nodeEngine: EvmNodeEngineService,
  ) {
    super(configService, nodeEngine, VerifierType.SGB);
  }
}

@Injectable()
export class BASEEVMTransactionVerifierService extends BaseEVMTransactionVerifierService {
  constructor(
    protected configService: ConfigService<IConfig>,
    nodeEngine: EvmNodeEngineService,
  ) {
    super(configService, nodeEngine, VerifierType.BASE);
  }
}

@Injectable()
export class HYPEEVMTransactionVerifierService extends BaseEVMTransactionVerifierService {
  constructor(
    protected configService: ConfigService<IConfig>,
    nodeEngine: EvmNodeEngineService,
  ) {
    super(configService, nodeEngine, VerifierType.HYPE);
  }
}
