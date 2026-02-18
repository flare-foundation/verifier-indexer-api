import { Injectable } from '@nestjs/common';
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
  private readonly web3Provider: JsonRpcProvider;

  protected constructor(
    protected configService: ConfigService<IConfig>,
    verifierType: VerifierType,
  ) {
    super(configService, 'EVMTransaction', verifierType);

    const rpcUrl: string = configService.get('evmRpcUrl');
    this.web3Provider = new ethers.JsonRpcProvider(rpcUrl);
  }

  async verifyRequest(
    request: EVMTransaction_Request,
  ): Promise<AttestationResponse<EVMTransaction_Response>> {
    return await verifyEVMTransactionRequest(request, this.web3Provider);
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
