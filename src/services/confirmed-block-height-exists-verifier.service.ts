import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EntityManager } from 'typeorm';
import { VerifierType } from '../config/configuration';
import {
  AttestationResponseDTO_ConfirmedBlockHeightExists_Response,
  ConfirmedBlockHeightExists_Request,
  ConfirmedBlockHeightExists_Response,
} from '../dtos/attestation-types/ConfirmedBlockHeightExists.dto';
import { serializeBigInts } from '../external-libs/utils';

import { verifyConfirmedBlockHeightExists } from '../verification/confirmed-block-height-exists/confirmed-block-height-exists';
import { BaseVerifierServiceWithIndexer } from './common/verifier-base.service';
import { IConfig } from 'src/config/interfaces/common';

abstract class BaseConfirmedBlockHeightExistsVerifierService extends BaseVerifierServiceWithIndexer<
  ConfirmedBlockHeightExists_Request,
  ConfirmedBlockHeightExists_Response
> {
  protected constructor(
    protected configService: ConfigService<IConfig>,
    protected manager: EntityManager,
    verifierType: VerifierType,
  ) {
    super(configService, manager, 'ConfirmedBlockHeightExists', verifierType);
  }

  async verifyRequest(
    fixedRequest: ConfirmedBlockHeightExists_Request,
  ): Promise<AttestationResponseDTO_ConfirmedBlockHeightExists_Response> {
    const result = await verifyConfirmedBlockHeightExists(
      fixedRequest,
      this.indexedQueryManager,
    );
    return serializeBigInts({
      status: result.status,
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
    super(configService, manager, VerifierType.DOGE);
  }
}

@Injectable()
export class BTCConfirmedBlockHeightExistsVerifierService extends BaseConfirmedBlockHeightExistsVerifierService {
  constructor(
    protected configService: ConfigService<IConfig>,
    protected manager: EntityManager,
  ) {
    super(configService, manager, VerifierType.BTC);
  }
}

@Injectable()
export class XRPConfirmedBlockHeightExistsVerifierService extends BaseConfirmedBlockHeightExistsVerifierService {
  constructor(
    protected configService: ConfigService<IConfig>,
    protected manager: EntityManager,
  ) {
    super(configService, manager, VerifierType.XRP);
  }
}
