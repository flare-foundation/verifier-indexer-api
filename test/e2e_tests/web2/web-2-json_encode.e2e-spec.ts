import { ethers } from 'ethers';

describe.skip('Encoder checker', () => {
  it('encode 1', () => {
    const types = Array(100_000).fill('string');
    const values = types.map(() => 'x'.repeat(100));
    const encodedData = ethers.AbiCoder.defaultAbiCoder().encode(types, values);
    console.log('encodedData', encodedData);
  });

  it('encode 2', () => {
    const types = ['tuple(uint256)'];
    const values = ['this is not a tuple'];
    const encodedData = ethers.AbiCoder.defaultAbiCoder().encode(types, values);
    console.log('encodedData', encodedData);
  });

  it('encode 3', () => {
    let nestedType = 'uint256';
    for (let i = 0; i < 10; i++) {
      nestedType = `tuple(${nestedType})[]`;
    }

    const types = [nestedType];
    const deepArray = [[[42]]];
    const values = [deepArray];
    const encodedData = ethers.AbiCoder.defaultAbiCoder().encode(types, values);
    console.log('encodedData', encodedData);
  });

  it('encode 4', () => {
    const types = ['bytes'];
    const values = ['0x' + 'ff'.repeat(100_000_000)];
    const encodedData = ethers.AbiCoder.defaultAbiCoder().encode(types, values);
    console.log('encodedData', encodedData);
  });

  it('encode 5', () => {
    const types = ['uint256[]'];
    const values = [Array(10_000_000).fill(42)];
    const encodedData = ethers.AbiCoder.defaultAbiCoder().encode(types, values);
    console.log('encodedData', encodedData);
  });
});
