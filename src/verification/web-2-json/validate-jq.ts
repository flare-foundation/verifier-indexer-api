import { AttestationResponseStatus } from '../response-status';
import { Web2JsonValidationError } from './utils';

const dangerousKeywords = new RegExp(
  `(?:^|\\W)(${[
    'debug',
    'stderr',
    'input',
    'input_filename',
    'input_line_number',
    'env',
    'system',
    'open',
    'load',
    'call',
    'eval',
    'tojson',
    'fromjson',
    'halt',
    'halt_error',
    'error',
    'empty',
    'setpath',
    'getpath',
    'delpaths',
    'walk',
    'bzip2',
    'gzip',
    'deflate',
    'inflate',
    'base64',
    'base64d',
    'range',
    'repeat',
    // 'map',
    // 'map_values',
    // 'map_keys',
    'select',
    // 'sort',
    // 'sort_by',
    // 'group_by',
    'explode',
    'implode',
    '@csv',
    '@tsv',
    '@html',
    '@uri',
    '@sh',
    'while',
    'foreach',
    'reduce',
    'recurse',
    'recurse_down',
    'recurse_up',
    'import',
    'include',
    'module',
    'def',
    'try',
    'catch',
    'break',
    'continue',
    'label',
    'goto',
  ].join('|')})(?=\\W|$)`,
  'i',
);

export function validateJqFilter(jqFilter: string, maxLength: number): void {
  if (jqFilter.length > maxLength) {
    throw new Web2JsonValidationError(
      AttestationResponseStatus.INVALID_JQ_FILTER,
      `Invalid jq filter: exceeds max allowed length ${jqFilter.length} > ${maxLength}`,
    );
  }
  if (dangerousKeywords.test(jqFilter)) {
    throw new Web2JsonValidationError(
      AttestationResponseStatus.INVALID_JQ_FILTER,
      `Invalid jq filter: contains potentially dangerous keywords`,
    );
  }
}
