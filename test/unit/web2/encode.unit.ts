import { expect, use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { ProcessPoolService } from '../../../src/verification/web-2-json/process-pool.service';
import { abiEncode } from '../../../src/verification/web-2-json/utils';

use(chaiAsPromised);

const jqProcessTimeoutMs = 500;

describe('Encoder unit tests', () => {
  describe('abiEncode', () => {
    it('Should reject - types/values length mismatch', () => {
      const types = Array(100).fill('string');
      const values = Array(99).fill('x'.repeat(10));
      expect(() => abiEncode(values, types)).to.throw(
        'types/values length mismatch',
      );
    });

    it('Should reject - invalid type', () => {
      const types = ['tuple(uint256)'];
      const values = ['this is not a tuple'];
      expect(() => abiEncode(values, types)).to.throw(
        'invalid BigNumberish string',
      );
    });

    it('Should reject - invalid type 2', () => {
      const abiSignature = { internalType: 'uint', name: 'age', type: 'uint' };
      const values = [];
      expect(() => abiEncode(values, abiSignature)).to.throw(
        'invalid BigNumberish value',
      );
    });

    it('Should reject - invalid type 3', () => {
      const abiSignature = {
        internalType: 'mapping(address => uint256)',
        name: 'balances',
        type: 'mapping',
      };
      const values = [];
      expect(() => abiEncode(values, abiSignature)).to.throw('invalid type');
    });

    it('Should reject - invalid type 4', () => {
      const abiSignature = {
        internalType: 'invalid',
        name: 'magic',
        type: 'invalid',
      };
      const values = [];
      expect(() => abiEncode(values, abiSignature)).to.throw('invalid type');
    });

    it('Should reject - invalid value', () => {
      let nestedType = 'uint256';
      for (let i = 0; i < 10; i++) {
        nestedType = `tuple(${nestedType})[]`;
      }

      const types = [nestedType];
      const deepArray = [[[42]]];
      const values = [deepArray];
      expect(() => abiEncode(values, types)).to.throw('expected array value');
    });
  });

  describe('processTask', () => {
    let pool: ProcessPoolService;

    before(() => {
      pool = new ProcessPoolService(jqProcessTimeoutMs, 1);
      pool.onModuleInit();
    });
    after(async () => {
      await pool?.onModuleDestroy();
    });

    it('Should reject - deeply nested JSON', async () => {
      const types = ['bytes'];
      const values = ['0x' + 'ff'.repeat(100_000_000)];
      await expect(pool.filterAndEncodeData(values, '.', types)).to.be.rejectedWith(
        'Filtering and encoding JSON timed out',
      );
    });
    it('Should reject - deeply nested JSON', async () => {
      const types = ['uint256[]'];
      const values = [Array(10_000_000).fill(42)];
      await expect(pool.filterAndEncodeData(values, '.', types)).to.be.rejectedWith(
        'Filtering and encoding JSON timed out',
      );
    });
    it('Should reject - error in child process (invalid tuple)', async () => {
      const abiSignature = {
        internalType: 'tuple(uint256, string',
        name: 'info',
        type: 'tuple',
      };
      const values = [];
      await expect(
        pool.filterAndEncodeData(values, '.', abiSignature),
      ).to.be.rejectedWith('ABI ENCODING ERROR');
    });
    it('Should reject - error in child process (missing value in tuple)', async () => {
      const abiSignature = {
        internalType: 'tuple(uint256,,string)',
        name: 'pair',
        type: 'tuple',
      };
      const values = [];
      await expect(
        pool.filterAndEncodeData(values, '.', abiSignature),
      ).to.be.rejectedWith('ABI ENCODING ERROR');
    });

    it('Should reject - error in child process (deep nested tuple)', async () => {
      const abiSignature = {
        internalType:
          'tuple(tuple(tuple(tuple(tuple(tuple(tuple(tuple(uint256))))))))',
        name: 'nested',
        type: 'tuple',
      };
      const values = [];
      await expect(
        pool.filterAndEncodeData(values, '.', abiSignature),
      ).to.be.rejectedWith('ABI ENCODING ERROR');
    });
    it('Should reject - invalid format', async () => {
      await expect(
        pool.filterAndEncodeData({}, '.', { foo: 123 }),
      ).to.be.rejectedWith();
    });
  });
});
