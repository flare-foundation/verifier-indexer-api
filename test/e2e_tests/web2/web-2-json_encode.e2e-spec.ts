import { runEncodeSeparately } from '../../../src/verification/web-2-json/web-2-json-verifications';
import { expect } from 'chai';

const jqProcessTimeoutMs = 500;

describe('Encoder checker', () => {
  it('encode 1', async () => {
    const types = Array(100_000).fill('string');
    const values = types.map(() => 'x'.repeat(100));
    const encodedData = await runEncodeSeparately(
      types,
      values,
      jqProcessTimeoutMs,
    );
    expect(encodedData).to.be.null;
  });

  it('encode 2', async () => {
    const types = ['tuple(uint256)'];
    const values = ['this is not a tuple'];
    const encodedData = await runEncodeSeparately(
      types,
      values,
      jqProcessTimeoutMs,
    );
    expect(encodedData).to.be.null;
  });

  it('encode 3', async () => {
    let nestedType = 'uint256';
    for (let i = 0; i < 10; i++) {
      nestedType = `tuple(${nestedType})[]`;
    }

    const types = [nestedType];
    const deepArray = [[[42]]];
    const values = [deepArray];
    const encodedData = await runEncodeSeparately(
      types,
      values,
      jqProcessTimeoutMs,
    );
    expect(encodedData).to.be.null;
  });

  it('encode 4', async () => {
    const types = ['bytes'];
    const values = ['0x' + 'ff'.repeat(100_000_000)];
    const encodedData = await runEncodeSeparately(
      types,
      values,
      jqProcessTimeoutMs,
    );
    expect(encodedData).to.be.null;
  });

  it('encode 5', async () => {
    const types = ['uint256[]'];
    const values = [Array(10_000_000).fill(42)];
    const encodedData = await runEncodeSeparately(
      types,
      values,
      jqProcessTimeoutMs,
    );
    expect(encodedData).to.be.null;
  });

  it('encode 6', async () => {
    const abiSignature = { internalType: 'uint', name: 'age', type: 'uint' };
    const values = [];
    const encodedData = await runEncodeSeparately(
      abiSignature,
      values,
      jqProcessTimeoutMs,
    );
    expect(encodedData).to.be.null;
  });

  it('encode 7', async () => {
    const abiSignature = {
      internalType: 'mapping(address => uint256)',
      name: 'balances',
      type: 'mapping',
    };
    const values = [];
    const encodedData = await runEncodeSeparately(
      abiSignature,
      values,
      jqProcessTimeoutMs,
    );
    expect(encodedData).to.be.null;
  });

  it('encode 8', async () => {
    const abiSignature = {
      internalType: 'tuple(uint256, string',
      name: 'info',
      type: 'tuple',
    };
    const values = [];
    const encodedData = await runEncodeSeparately(
      abiSignature,
      values,
      jqProcessTimeoutMs,
    );
    expect(encodedData).to.be.null;
  });

  it('encode 9', async () => {
    const abiSignature = {
      internalType: 'invalid',
      name: 'magic',
      type: 'invalid',
    };
    const values = [];
    const encodedData = await runEncodeSeparately(
      abiSignature,
      values,
      jqProcessTimeoutMs,
    );
    expect(encodedData).to.be.null;
  });

  it('encode 10', async () => {
    const abiSignature = {
      internalType: 'tuple(uint256,,string)',
      name: 'pair',
      type: 'tuple',
    };
    const values = [];
    const encodedData = await runEncodeSeparately(
      abiSignature,
      values,
      jqProcessTimeoutMs,
    );
    expect(encodedData).to.be.null;
  });

  it('encode 11', async () => {
    const abiSignature = {
      internalType:
        'tuple(tuple(tuple(tuple(tuple(tuple(tuple(tuple(uint256))))))))',
      name: 'nested',
      type: 'tuple',
    };
    const values = [];
    const encodedData = await runEncodeSeparately(
      abiSignature,
      values,
      jqProcessTimeoutMs,
    );
    expect(encodedData).to.be.null;
  });
});
