import { isEncodeMessage } from '../../../src/verification/web-2-json/utils';
import { runEncodeSeparately } from '../../../src/verification/web-2-json/web-2-json-verifications';
import { expect, use } from 'chai';
import chaiAsPromised from 'chai-as-promised';

use(chaiAsPromised);

const jqProcessTimeoutMs = 500;

describe('Encoder unit tests', () => {
  it('Should reject - types/values length mismatch', async () => {
    const types = Array(100).fill('string');
    const values = Array(99).fill('x'.repeat(10));
    await expect(
      runEncodeSeparately(types, values, jqProcessTimeoutMs),
    ).to.be.rejectedWith('types/values length mismatch');
  });

  it('Should reject - invalid type', async () => {
    const types = ['tuple(uint256)'];
    const values = ['this is not a tuple'];
    await expect(
      runEncodeSeparately(types, values, jqProcessTimeoutMs),
    ).to.be.rejectedWith('invalid BigNumberish string');
  });

  it('Should reject - invalid type 2', async () => {
    const abiSignature = { internalType: 'uint', name: 'age', type: 'uint' };
    const values = [];
    await expect(
      runEncodeSeparately(abiSignature, values, jqProcessTimeoutMs),
    ).to.be.rejectedWith('invalid BigNumberish value');
  });

  it('Should reject - invalid type 3', async () => {
    const abiSignature = {
      internalType: 'mapping(address => uint256)',
      name: 'balances',
      type: 'mapping',
    };
    const values = [];
    await expect(
      runEncodeSeparately(abiSignature, values, jqProcessTimeoutMs),
    ).to.be.rejectedWith('invalid type');
  });

  it('Should reject - invalid type 4', async () => {
    const abiSignature = {
      internalType: 'invalid',
      name: 'magic',
      type: 'invalid',
    };
    const values = [];
    await expect(
      runEncodeSeparately(abiSignature, values, jqProcessTimeoutMs),
    ).to.be.rejectedWith('invalid type');
  });

  it('Should reject - invalid value', async () => {
    let nestedType = 'uint256';
    for (let i = 0; i < 10; i++) {
      nestedType = `tuple(${nestedType})[]`;
    }

    const types = [nestedType];
    const deepArray = [[[42]]];
    const values = [deepArray];
    await expect(
      runEncodeSeparately(types, values, jqProcessTimeoutMs),
    ).to.be.rejectedWith('expected array value');
  });

  it('Should reject - timeout triggered (large bytes)', async () => {
    const types = ['bytes'];
    const values = ['0x' + 'ff'.repeat(100_000_000)];
    await expect(
      runEncodeSeparately(types, values, jqProcessTimeoutMs),
    ).to.be.rejectedWith('Encode process exceeded timeout');
  });

  it('Should reject - timeout triggered (large uint256 array)', async () => {
    const types = ['uint256[]'];
    const values = [Array(10_000_000).fill(42)];
    await expect(
      runEncodeSeparately(types, values, jqProcessTimeoutMs),
    ).to.be.rejectedWith('Encode process exceeded timeout');
  });

  it('Should reject - error in child process (invalid tuple)', async () => {
    const abiSignature = {
      internalType: 'tuple(uint256, string',
      name: 'info',
      type: 'tuple',
    };
    const values = [];
    await expect(
      runEncodeSeparately(abiSignature, values, jqProcessTimeoutMs),
    ).to.be.rejectedWith('Error during child process');
  });

  it('Should reject - error in child process (missing value in tuple)', async () => {
    const abiSignature = {
      internalType: 'tuple(uint256,,string)',
      name: 'pair',
      type: 'tuple',
    };
    const values = [];
    await expect(
      runEncodeSeparately(abiSignature, values, jqProcessTimeoutMs),
    ).to.be.rejectedWith('Error during child process');
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
      runEncodeSeparately(abiSignature, values, jqProcessTimeoutMs),
    ).to.be.rejectedWith('Error during child process');
  });

  it('Should reject - invalid format', () => {
    const input = null;
    const input2 = 'not an object';
    const input3 = {};
    const input4 = 42;
    const input5 = { abiSignature: {} };
    const input6 = { abiSignature: 'not-object', jqPostProcessData: {} };
    const input7 = { abiSignature: 123, jqPostProcessData: 'data' };
    const input8 = { abiSignature: {}, jqPostProcessData: 123 };
    expect(isEncodeMessage(input)).to.be.false;
    expect(isEncodeMessage(input2)).to.be.false;
    expect(isEncodeMessage(input3)).to.be.false;
    expect(isEncodeMessage(input4)).to.be.false;
    expect(isEncodeMessage(input5)).to.be.false;
    expect(isEncodeMessage(input6)).to.be.false;
    expect(isEncodeMessage(input7)).to.be.false;
    expect(isEncodeMessage(input8)).to.be.false;
  });
});
