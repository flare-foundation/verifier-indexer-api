import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { VerifierType } from '../config/configuration';

import { BaseVerifierService } from './common/verifier-base.service';
import { ethers, JsonRpcProvider } from 'ethers';
import {
  EVMTransaction_Request,
  EVMTransaction_Response,
} from '../dtos/attestation-types/EVMTransaction.dto';
import { AttestationResponse } from '../dtos/generic/generic.dto';
import { IConfig } from '../config/interfaces/common';
import { verifyEVMTransactionRequest } from '../verification/evm-transaction/evm-transaction';

export abstract class BaseEVMTransactionVerifierService extends BaseVerifierService<
  EVMTransaction_Request,
  EVMTransaction_Response
> {
  protected readonly logger: Logger;
  private readonly web3Provider: JsonRpcProvider;

  protected constructor(
    protected configService: ConfigService<IConfig>,
    verifierType: VerifierType,
  ) {
    super(configService, 'EVMTransaction', verifierType);

    this.logger = new Logger(new.target.name);
    const rpcUrl: string = configService.get('evmRpcUrl');
    this.logger.debug(`RPC host: ${new URL(rpcUrl).host}`);
    this.web3Provider = new ethers.JsonRpcProvider(rpcUrl);
  }

  async verifyRequest(
    request: EVMTransaction_Request,
  ): Promise<AttestationResponse<EVMTransaction_Response>> {
    this.logger.debug(
      `Verifying EVMTransaction request: ${JSON.stringify(request)}`,
    );
    const result = await verifyEVMTransactionRequest(
      request,
      this.web3Provider,
    );
    this.logger.debug(
      `EVMTransaction response: status: ${result.status}, result: ${JSON.stringify(result.response?.responseBody ?? 'none')}`,
    );
    return result;
  }
}

@Injectable()
export class ETHEVMTransactionVerifierService extends BaseEVMTransactionVerifierService {
  constructor(protected configService: ConfigService<IConfig>) {
    super(configService, VerifierType.ETH);
  }
}

@Injectable()
export class FLREVMTransactionVerifierService extends BaseEVMTransactionVerifierService {
  constructor(protected configService: ConfigService<IConfig>) {
    super(configService, VerifierType.FLR);
  }
}

@Injectable()
export class SGBEVMTransactionVerifierService extends BaseEVMTransactionVerifierService {
  constructor(protected configService: ConfigService<IConfig>) {
    super(configService, VerifierType.SGB);
  }
}

@Injectable()
export class BASEEVMTransactionVerifierService extends BaseEVMTransactionVerifierService {
  constructor(protected configService: ConfigService<IConfig>) {
    super(configService, VerifierType.BASE);
  }
}

@Injectable()
export class HYPEEVMTransactionVerifierService extends BaseEVMTransactionVerifierService {
  constructor(protected configService: ConfigService<IConfig>) {
    super(configService, VerifierType.HYPE);
  }
}
