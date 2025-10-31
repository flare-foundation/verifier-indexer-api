import { AttestationResponseStatus } from '../response-status';
import { Web2JsonValidationError } from './utils';
import { parse } from '@jq-tools/jq';
import {
  BinaryOperator,
  ExpressionAst,
  ProgAst,
} from '@jq-tools/jq/src/lib/parser/AST';

// Limit the max number of AST nodes visited
const MAX_AST_NODES = 10000;

// Conservative allowlist of jq builtin filters considered safe for this verifier.
const ALLOWED_FILTERS = new Set([
  // basic transforms
  'map',
  'select',
  'flatten',
  // array/object helpers
  'length',
  'keys',
  'to_entries',
  'from_entries',
  'has',
  'contains',
  'add',
  'join',
  // numeric / string helpers
  'tonumber',
  'tostring',
  'split',
  'gsub',
  'match',
  // inspection / type helpers
  'type',
  // common string helpers
  'startswith',
  'endswith',
  'test',
  'explode',
  'implode',
  'ascii_upcase',
  'ascii_downcase',
  // sorting / sampling
  'sort',
  'sort_by',
  'reverse',
  'first',
  'last',
  // identity
  '.',
]);

const throwError = (message?: string) =>
  new Web2JsonValidationError(
    AttestationResponseStatus.INVALID_JQ_FILTER,
    message || 'Invalid or disallowed jq expression',
  );

/**
 * Validates a jq filter string to ensure it only contains {@link ALLOWED_FILTERS}.
 * - Checks the length of the filter.
 * - Parses the filter into an AST and traverses it checking if keywords are allowed.
 * - Limits the number of AST nodes visited to prevent excessive computation.
 *
 * The AST traversal is now whitelist-driven: only specific node types and filters are supported.
 * Any unknown node type or filter will be rejected immediately.
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
    ast = parse(jqFilter);
  } catch (error) {
    throw new Web2JsonValidationError(
      AttestationResponseStatus.INVALID_JQ_FILTER,
      `Parse error: ${error}`,
    );
  }

  let visited = 0;
  const stack: ExpressionAst[] = [];
  if (ast.expr) {
    stack.push(ast.expr);
  }

  while (stack.length) {
    const expr = stack.pop();
    visited++;
    if (visited > MAX_AST_NODES) throw throwError();

    switch (expr.type) {
      case 'binary': {
        validateOperator(expr.operator);
        stack.push(expr.right);
        stack.push(expr.left);
        break;
      }
      case 'filter': {
        const raw = expr.name ?? '';
        const name = raw.toLowerCase();
        const base =
          name
            .replace(/\/\d+$/, '')
            .split('::')
            .pop() || name;
        if (!ALLOWED_FILTERS.has(base))
          throw throwError(`Unknown or disallowed jq filter: ${base}`);
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
      case 'unary': {
        const operator = expr.operator as string;
        switch (operator) {
          case '-':
            stack.push(expr.expr);
            break;
          default:
            throw throwError(
              `Unsupported or disallowed unary operator: ${operator}`,
            );
        }
        break;
      }
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
        const entries = expr.entries;
        for (let i = entries.length - 1; i >= 0; i--) {
          const entry = entries[i];
          if (typeof entry.key !== 'string') stack.push(entry.key);
          if (entry.value != null) stack.push(entry.value);
        }
        break;
      }
      case 'str': {
        if (expr.interpolated) {
          for (let i = expr.parts.length - 1; i >= 0; i--) {
            const part = expr.parts[i];
            if (typeof part !== 'string') stack.push(part);
          }
        }
        break;
      }
      case 'varDeclaration':
        stack.push(expr.next);
        stack.push(expr.expr);
        break;
      case 'var':
      case 'identity':
      case 'num':
      case 'bool':
      case 'null':
      case 'format':
        break;
      default:
        // Disallow all other node types
        throw throwError();
    }
  }
}

/** Allow non-assignment operators. */
function validateOperator(op: BinaryOperator) {
  switch (op) {
    case '|':
    case ',':
    case '//':
    case 'and':
    case 'or':
    case '==':
    case '!=':
    case '<':
    case '>':
    case '<=':
    case '>=':
    case '+':
    case '-':
    case '*':
    case '/':
    case '%':
      break;
    default: {
      // Defensive: reject other operators by default
      throw throwError(`Unsupported or unknown binary operator: ${String(op)}`);
    }
  }
}
