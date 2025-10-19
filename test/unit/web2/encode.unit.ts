import { expect, use } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import {
  abiEncode,
  Web2JsonValidationError,
} from '../../../src/verification/web-2-json/utils';
import { ParamType } from 'ethers';
import { parseAndValidateAbiType } from '../../../src/verification/web-2-json/validate-abi';

use(chaiAsPromised);


describe('ABI encoding', () => {
  describe('parseAndValidateAbiType', () => {
    const MAX_LEN = 1000;

    it('rejects an overly long type string', () => {
      const longType = 'a'.repeat(MAX_LEN + 1);
      expect(() => parseAndValidateAbiType(longType, MAX_LEN)).to.throw(
        Web2JsonValidationError,
      );
    });

    it('est', () => {
      const types = 'string';
      const type = parseAndValidateAbiType(types, MAX_LEN);
      const values = ['hello'];
      const out = abiEncode(values, type);
      console.log('Encoded output:', out);
    });

    it('allows a primitive type string', () => {
      expect(() => parseAndValidateAbiType('uint256', MAX_LEN)).to.not.throw();
      expect(() => parseAndValidateAbiType('address', MAX_LEN)).to.not.throw();
      expect(() => parseAndValidateAbiType('bytes', MAX_LEN)).to.not.throw();
      expect(() => parseAndValidateAbiType('string', MAX_LEN)).to.not.throw();
      expect(() => parseAndValidateAbiType('bool', MAX_LEN)).to.not.throw();
    });

    it('rejects a simple tuple of primitives', () => {
      expect(() =>
        parseAndValidateAbiType('tuple(uint256,address,bool)', MAX_LEN),
      ).to.throw();
    });

    it('rejects arrays array type', () => {
      expect(() => parseAndValidateAbiType('uint256[]', MAX_LEN)).to.throw(
        Web2JsonValidationError,
      );
      expect(() => parseAndValidateAbiType('uint256[3]', MAX_LEN)).to.throw(
        Web2JsonValidationError,
      );
    });

    it('rejects tuple strings', () => {
      expect(() => parseAndValidateAbiType('tuple()', MAX_LEN)).to.throw(
        Web2JsonValidationError,
      );
      expect(() =>
        parseAndValidateAbiType('tuple(address,uint256)', MAX_LEN),
      ).to.throw(Web2JsonValidationError);
    });

    it('accepts a JSON tuple definition with primitive components', () => {
      const json = JSON.stringify({
        type: 'tuple',
        components: [
          { name: 'a', type: 'uint256' },
          { name: 'b', type: 'address' },
        ],
      });
      expect(() => parseAndValidateAbiType(json, MAX_LEN)).to.not.throw();
    });

    it('rejects a JSON tuple that contains an array component', () => {
      const json = JSON.stringify({
        type: 'tuple',
        components: [{ name: 'a', type: 'uint256[]' }],
      });
      expect(() => parseAndValidateAbiType(json, MAX_LEN)).to.throw(
        Web2JsonValidationError,
      );
    });

    it('rejects a JSON tuple array type ', () => {
      const json = `{
      "internalType": "tuple[]",
      "type": "tuple[]",
      "components": [
        {
          "internalType": "uint8",
          "name": "id",
          "type": "uint8"
        },
        {
          "internalType": "string",
          "name": "title",
          "type": "string"
        }
      ]
    }`;
      expect(() => parseAndValidateAbiType(json, MAX_LEN)).to.throw(
        Web2JsonValidationError,
      );
    });
  });

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
});
