import { expect, use } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { ProcessPoolService } from '../../../src/verification/web-2-json/process-pool.service';
import { abiEncode } from '../../../src/verification/web-2-json/utils';
import { ParamType } from 'ethers';
import { AttestationResponseStatus } from '../../../src/verification/response-status';

use(chaiAsPromised);

const jqProcessTimeoutMs = 500;

describe('Encoder unit tests', () => {
  describe('abiEncode', () => {
    it('Should reject - types/values length mismatch', () => {
      const abiType = ParamType.from('string');
      const values = Array(99).fill('x'.repeat(10));
      expect(() => abiEncode(values, abiType)).to.throw(
        'types/values length mismatch',
      );
    });

    it('Should reject - invalid value', () => {
      const abiType = ParamType.from('uint256');
      const values = ['not an int'];
      expect(() => abiEncode(values, abiType)).to.throw(
        'invalid BigNumberish string',
      );
    });

    it('Should reject - invalid value 2', () => {
      const abiType = ParamType.from('uint256');
      const values = [];
      expect(() => abiEncode(values, abiType)).to.throw(
        'types/values length mismatch',
      );
    });

    it('Should reject - invalid value 3', () => {
      const typeObj: object = {
        type: 'tuple',
        components: [
          { name: 'a', type: 'uint256' },
          { name: 'b', type: 'address' },
        ],
      };
      const abiType = ParamType.from(typeObj);
      const values = {
        a: 42,
        // missing 'b' field
      };
      expect(() => abiEncode(values, abiType)).to.throw('invalid address');
    });

    it('Should reject - invalid value 4', () => {
      const typeObj: object = {
        type: 'tuple',
        components: [
          { name: 'a', type: 'uint256' },
          { name: 'b', type: 'address' },
        ],
      };
      const abiType = ParamType.from(typeObj);
      const values = {
        a: 'test',
        b: '0x0000000000000000000000000000000000000000',
      };
      expect(() => abiEncode(values, abiType)).to.throw(
        'invalid BigNumberish string',
      );
    });
  });

  describe('filterAndEncodeData', () => {
    let pool: ProcessPoolService;

    before(() => {
      pool = new ProcessPoolService(jqProcessTimeoutMs, 1);
      pool.onModuleInit();
    });
    after(() => {
      pool?.onModuleDestroy();
    });

    it('Should reject - large input value', async () => {
      const types = ParamType.from('bytes');
      const values = ['0x' + 'ff'.repeat(100_000_000)];
      await expect(
        pool.filterAndEncodeData(values, '.', types),
      ).to.be.rejectedWith(AttestationResponseStatus.PROCESSING_TIMEOUT);
    });
  });
});
