import { AttestationResponseStatus } from '../response-status';
import { Web2JsonValidationError } from './utils';
import { parse } from '@jq-tools/jq';
import type {
  ExpressionAst,
  FilterAst,
  ObjectAst,
  ObjectEntryAst,
  ProgAst,
  StrAst,
} from '@jq-tools/jq/src/lib/parser/AST';

// Limit the max number of AST nodes visited
const MAX_AST_NODES = 10000;

const DANGEROUS_FILTERS = new Set([
  // IO / eval
  'input',
  'inputs',
  'input_filename',
  'input_line_number',
  'env',
  'system',
  'open',
  'load',
  'eval',
  'setpath',
  'getpath',
  'delpaths',
  // user-defined functions / dynamic invocation
  'call',
  // potentially unbounded iteration / recursion
  'while',
  'walk',
  'until',
  'repeat',
  'recurse',
  'recurse_down',
  'recurse_up',
  'range',
]);

/**
 * Validates a jq filter string to ensure it does not contain potentially dangerous operations or excessive computation.
 * - Checks the length of the filter.
 * - Parses the filter into an AST and traverses it to look for dangerous keywords.
 * - Limits the number of AST nodes visited to prevent excessive computation.
 *
 * @throws {Web2JsonValidationError} If the filter is invalid or contains dangerous keywords.
 */
export function validateJqFilter(jqFilter: string, maxLength: number): void {
  if (jqFilter.length > maxLength) {
    throw new Web2JsonValidationError(
      AttestationResponseStatus.INVALID_JQ_FILTER,
      `Exceeds max allowed length ${jqFilter.length} > ${maxLength}`,
    );
  }

  let ast: ProgAst;
  try {
    ast = parse(jqFilter) as ProgAst;
  } catch (error) {
    throw new Web2JsonValidationError(
      AttestationResponseStatus.INVALID_JQ_FILTER,
      `Parse error: ${error}`,
    );
  }

  const throwError = () =>
    new Web2JsonValidationError(
      AttestationResponseStatus.INVALID_JQ_FILTER,
      'Contains potentially dangerous keywords',
    );

  let visited = 0;
  const stack: ExpressionAst[] = [];
  if (ast.expr) stack.push(ast.expr);

  while (stack.length) {
    const expr = stack.pop()!;
    visited++;
    if (visited > MAX_AST_NODES) throw throwError();

    switch (expr.type) {
      case 'binary':
        stack.push(expr.right);
        stack.push(expr.left);
        break;
      case 'def':
        throw throwError();
      case 'filter': {
        const raw = (expr as FilterAst).name ?? '';
        const name = raw.toLowerCase();
        const base = name.replace(/\/\d+$/, '');
        if (DANGEROUS_FILTERS.has(base)) throw throwError();
        for (let i = expr.args.length - 1; i >= 0; i--)
          stack.push(expr.args[i]);
        break;
      }
      case 'if':
        if (expr.else) stack.push(expr.else);
        if (expr.elifs)
          for (let i = expr.elifs.length - 1; i >= 0; i--) {
            stack.push(expr.elifs[i].then);
            stack.push(expr.elifs[i].cond);
          }
        stack.push(expr.then);
        stack.push(expr.cond);
        break;
      case 'try':
        if (expr.catch) stack.push(expr.catch);
        stack.push(expr.body);
        break;
      case 'reduce':
        throw throwError();
      case 'foreach':
        throw throwError();
      case 'label':
        throw throwError();
      case 'break':
        throw throwError();
      case 'unary':
        stack.push(expr.expr);
        break;
      case 'index':
        if (typeof expr.index !== 'string') stack.push(expr.index);
        stack.push(expr.expr);
        break;
      case 'slice':
        if (expr.to) stack.push(expr.to);
        if (expr.from) stack.push(expr.from);
        stack.push(expr.expr);
        break;
      case 'iterator':
        stack.push(expr.expr);
        break;
      case 'array':
        if (expr.expr) stack.push(expr.expr);
        break;
      case 'object': {
        const obj = expr as ObjectAst;
        for (let i = obj.entries.length - 1; i >= 0; i--) {
          const entry = obj.entries[i] as ObjectEntryAst;
          if (typeof entry.key !== 'string') stack.push(entry.key as any);
          if ('value' in entry && (entry as any).value)
            stack.push((entry as any).value);
        }
        break;
      }
      case 'var':
      case 'identity':
      case 'num':
      case 'bool':
      case 'null':
      case 'format':
        break; // Terminals
      case 'str': {
        const s = expr as StrAst;
        if (s.interpolated) {
          for (let i = s.parts.length - 1; i >= 0; i--) {
            const part = s.parts[i];
            if (typeof part !== 'string') stack.push(part);
          }
        }
        break;
      }
      case 'varDeclaration':
        stack.push(expr.next);
        stack.push(expr.expr);
        break;
      case 'recursiveDescent':
        throw throwError();
      default:
        // Exhaustiveness guard — if a new node type appears, be conservative
        throw throwError();
    }
  }
}
