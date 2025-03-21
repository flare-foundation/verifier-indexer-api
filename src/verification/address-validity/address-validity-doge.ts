import basex from 'base-x';
import { AddressValidity_ResponseBody } from '../../dtos/attestation-types/AddressValidity.dto';
import { AttestationResponseStatus } from '../response-status';
import { VerificationResponse } from '../response-status';
import {
  INVALID_ADDRESS_RESPONSE,
  base58Checksum,
  validAddressToResponse,
} from './utils';

const DOGE_BASE_58_DICT =
  '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const DOGE_BASE_58_DICT_regex =
  /[^123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]/;

const dogeBase58 = basex(DOGE_BASE_58_DICT);

/**
 * Verifies that @param address given as a string represents a valid address on Dogecoin.
 * If @param testnet is truthy, checks whether address is valid on testnet.
 * @returns
 */
export function verifyAddressDOGE(
  address: string,
  testnet: boolean = false,
): VerificationResponse<AddressValidity_ResponseBody> {
  let validPrefix: string[];
  let validPrefixDecodedDec: number[];

  if (testnet) {
    validPrefix = ['n', 'm', '2'];
    validPrefixDecodedDec = [113, 196];
  } else {
    validPrefix = ['D', 'A', '9'];
    validPrefixDecodedDec = [30, 22];
  }

  //length is base58
  const shortLen = 25 > address.length || address.length > 34;
  if (shortLen)
    return {
      status: AttestationResponseStatus.VALID,
      response: INVALID_ADDRESS_RESPONSE,
    };

  //contains only characters from the alphabet
  const invalidChar = DOGE_BASE_58_DICT_regex.test(address);
  if (invalidChar)
    return {
      status: AttestationResponseStatus.VALID,
      response: INVALID_ADDRESS_RESPONSE,
    };

  //prefix in base58
  const prefix = validPrefix.includes(address[0]);
  if (!prefix)
    return {
      status: AttestationResponseStatus.VALID,
      response: INVALID_ADDRESS_RESPONSE,
    };

  const decodedAddress = Buffer.from(dogeBase58.decode(address));

  //decoded length
  if (decodedAddress.length != 25)
    return {
      status: AttestationResponseStatus.VALID,
      response: INVALID_ADDRESS_RESPONSE,
    };

  //checksum
  const checksum = base58Checksum(decodedAddress);
  if (!checksum)
    return {
      status: AttestationResponseStatus.VALID,
      response: INVALID_ADDRESS_RESPONSE,
    };

  //prefix in hex
  if (!validPrefixDecodedDec.includes(decodedAddress[0]))
    return {
      status: AttestationResponseStatus.VALID,
      response: INVALID_ADDRESS_RESPONSE,
    };
  else {
    const response = validAddressToResponse(address, false);
    return { status: AttestationResponseStatus.VALID, response };
  }
}
