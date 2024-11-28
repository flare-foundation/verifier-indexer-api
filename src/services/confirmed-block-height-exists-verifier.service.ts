import { ChainType } from '@flarenetwork/mcc';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IConfig } from '../config/configuration';
import {
  AttestationResponseDTO_ConfirmedBlockHeightExists_Response,
  ConfirmedBlockHeightExists_Request,
  ConfirmedBlockHeightExists_Response,
} from '../dtos/attestation-types/ConfirmedBlockHeightExists.dto';
import { AttestationResponse } from '../dtos/generic/generic.dto';
import { serializeBigInts } from '../external-libs/utils';
import {
  BtcIndexerQueryManager,
  DogeIndexerQueryManager,
} from '../indexed-query-manager/UtxoIndexQueryManager';
import { XrpIndexerQueryManager } from '../indexed-query-manager/XrpIndexerQueryManager';
import { getAttestationStatus } from '../verification/attestation-types/attestation-types';
import { verifyConfirmedBlockHeightExists } from '../verification/generic-chain-verifications';
import { EntityManager } from 'typeorm';
import {
  BaseVerifierServiceWithIndexer,
  ITypeSpecificVerificationServiceConfig,
} from './common/verifier-base.service';

abstract class BaseConfirmedBlockHeightExistsVerifierService extends BaseVerifierServiceWithIndexer<
  ConfirmedBlockHeightExists_Request,
  ConfirmedBlockHeightExists_Response
> {
  constructor(
    protected configService: ConfigService<IConfig>,
    protected manager: EntityManager,
    options: ITypeSpecificVerificationServiceConfig,
  ) {
    super(configService, manager, {
      ...options,
      attestationName: 'ConfirmedBlockHeightExists',
    });
  }

  async verifyRequest(
    fixedRequest: ConfirmedBlockHeightExists_Request,
  ): Promise<AttestationResponseDTO_ConfirmedBlockHeightExists_Response> {
    const result = await verifyConfirmedBlockHeightExists(
      fixedRequest,
      this.indexedQueryManager,
    );
    return serializeBigInts({
      status: getAttestationStatus(result.status),
      response: result.response,
    });
  }
}

@Injectable()
export class DOGEConfirmedBlockHeightExistsVerifierService extends BaseConfirmedBlockHeightExistsVerifierService {
  constructor(
    protected configService: ConfigService<IConfig>,
    protected manager: EntityManager,
  ) {
    super(configService, manager, {
      source: ChainType.DOGE,
      indexerQueryManager: DogeIndexerQueryManager,
    });
  }
}

@Injectable()
export class BTCConfirmedBlockHeightExistsVerifierService extends BaseConfirmedBlockHeightExistsVerifierService {
  constructor(
    protected configService: ConfigService<IConfig>,
    protected manager: EntityManager,
  ) {
    super(configService, manager, {
      source: ChainType.BTC,
      indexerQueryManager: BtcIndexerQueryManager,
    });
  }
}

@Injectable()
export class XRPConfirmedBlockHeightExistsVerifierService extends BaseConfirmedBlockHeightExistsVerifierService {
  constructor(
    protected configService: ConfigService<IConfig>,
    protected manager: EntityManager,
  ) {
    super(configService, manager, {
      source: ChainType.XRP,
      indexerQueryManager: XrpIndexerQueryManager,
    });
  }
}
