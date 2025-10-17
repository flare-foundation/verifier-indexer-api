import { AttestationResponseStatus } from '../response-status';
import { Web2JsonValidationError } from './utils';
import { parse } from '@jq-tools/jq';

const dangerousKeywords = new RegExp(
  `(?:^|\\W)(${[
    // IO: stdin/files/env/process/modules, and indirect IO via eval
    'input',
    'inputs',
    'input_filename',
    'input_line_number',
    'env',
    'system',
    'open',
    'load',
    'import',
    'include',
    'module',
    'eval',
    'setpath',
    'getpath',
    'delpaths',
    // Recursion via user-defined functions and dynamic invocation
    'def',
    'call',
    // Potentially infinite/unbounded loops/recursion
    'while',
    'walk',
    'until',
    'repeat',
    'recurse',
    'recurse_down',
    'recurse_up',
    'range',
    'break',
    'label',
  ].join('|')})(?=\\W|$)`,
  'i',
);

export function validateJqFilter(jqFilter: string, maxLength: number): void {
  if (jqFilter.length > maxLength) {
    throw new Web2JsonValidationError(
      AttestationResponseStatus.INVALID_JQ_FILTER,
      `Exceeds max allowed length ${jqFilter.length} > ${maxLength}`,
    );
  }

  try {
    parse(jqFilter);
  } catch (error) {
    throw new Web2JsonValidationError(
      AttestationResponseStatus.INVALID_JQ_FILTER,
      `Parse error: ${error}`,
    );
  }

  if (dangerousKeywords.test(jqFilter)) {
    throw new Web2JsonValidationError(
      AttestationResponseStatus.INVALID_JQ_FILTER,
      `Contains potentially dangerous keywords`,
    );
  }
}
