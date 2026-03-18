/* eslint-disable no-console */
import { Options, format } from 'prettier';
import * as fs from 'fs';
import * as path from 'path';
import {
  ParamRecord,
  StructRecord,
  TypeRecord,
} from './types';
import {
  DEFAULT_ATTESTATION_TYPE_CONFIGS_PATH,
  encodeAttestationName,
} from '@flarenetwork/js-flare-common';

const ROOT = process.cwd();
const TYPE_DEFS_DIR = DEFAULT_ATTESTATION_TYPE_CONFIGS_PATH;
const DTO_DIR = path.join(ROOT, 'src/dtos/attestation-types');

function readJson(filePath: string): unknown {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

const PRETTIER_SETTINGS_NEST_JS_DTO: Options = {
  trailingComma: 'all',
  tabWidth: 2,
  printWidth: 120,
  semi: true,
  singleQuote: true,
  parser: 'typescript',
};

function JSDocCommentText(text?: string): string {
  if (!text || text.trim() === '') return '';
  return `/**
   * ${text.trim().replace(/\r/g, '').replace(/\n/g, '\n   * ').replace(/\*\//g, '* /')}
   */`;
}

const attestationResponseStatusEnum = `
/**
 * Attestation status
 */
export enum AttestationResponseStatus {
  /**
   * Attestation request is valid.
   */
  VALID = 'VALID',
  /**
   * Attestation request is invalid.
   */
  INVALID = 'INVALID',
  /**
   * Attestation request cannot be confirmed neither rejected by the verifier at the moment.
   */
  INDETERMINATE = 'INDETERMINATE',
}
`;

function solidityToDTOTypeInitialized(
  typeName: string,
  attestationTypeName: string,
): string {
  const match = typeName.match(/^(.+)(\[\d*])$/);
  if (match) {
    return (
      solidityToDTOTypeInitialized(match[1], attestationTypeName) + '[]'
    );
  }
  if (typeName.match(/^u?int\d+$/)) return 'string';
  if (typeName.match(/^bool$/)) return 'boolean';
  if (typeName.match(/^bytes\d*$/)) return 'string';
  if (typeName.match(/^address$/)) return 'string';
  if (typeName.match(/^string$/)) return 'string';
  if (typeName.match(/^byte$/)) return 'string';
  const structMatch = typeName.match(/^struct ([\w.]+)$/);
  if (structMatch) {
    const name = structMatch[1];
    return attestationTypeName + '_' + name.split('.').slice(-1)[0];
  }
  throw new Error(`Unknown type ${typeName}`);
}

function validationAnnotation(
  typeName: string,
  typeNameSimple: string,
  attestationTypeName: string,
  isArray = false,
): string {
  const arrayOpts = isArray ? '{ each: true }' : '';
  const arrayOptsComma = isArray ? ', { each: true }' : '';
  if (typeName.match(/^u?int\d+$/))
    return `@Validate(IsUnsignedIntLike${arrayOptsComma})`;
  if (typeName.match(/^int\d+$/))
    return `@Validate(IsUnsignedIntLike${arrayOptsComma})`;
  if (typeName.match(/^bool$/)) return `@IsBoolean(${arrayOpts})`;
  if (typeName.match(/^bytes32$/))
    return `@Validate(IsHash32${arrayOptsComma})`;
  if (typeName.match(/^bytes\d*$/))
    return `@Validate(Is0xHex${arrayOptsComma})`;
  if (typeName.match(/^address$/))
    return `@Validate(IsEVMAddress${arrayOptsComma})`;
  if (typeName.match(/^string$/)) return `@IsString(${arrayOpts})`;
  if (typeName.match(/^byte$/))
    return `@Validate(Is0xHex${arrayOptsComma})`;
  if (typeName.startsWith('struct ')) {
    const isEmptyObject = isArray ? '' : '\n  @IsNotEmptyObject()';
    return `@ValidateNested(${arrayOpts})
  @Type(() => ${attestationTypeName}_${typeNameSimple})
  @IsDefined(${arrayOpts})${isEmptyObject}
  @IsObject(${arrayOpts})`;
  }
  throw new Error(`Unknown type ${typeName}`);
}

function exampleFor(
  typeName: string,
  typeNameSimple: string,
  isArray = false,
): string {
  const left = isArray ? '[' : '';
  const right = isArray ? ']' : '';
  if (typeName.match(/^uint\d+$/)) return `${left}'123'${right}`;
  if (typeName.match(/^int\d+$/)) return `${left}'123'${right}`;
  if (typeName.match(/^bool$/)) return `${left}true${right}`;
  if (typeName.match(/^bytes32$/))
    return `${left}'0x0000000000000000000000000000000000000000000000000000000000000000'${right}`;
  if (typeName.match(/^bytes\d*$/)) return `${left}'0x1234abcd'${right}`;
  if (typeName.match(/^address$/))
    return `${left}'0x5d4BEB38B6b71aaF6e30D0F9FeB6e21a7Ac40b3a'${right}`;
  if (typeName.match(/^string$/)) return `${left}'Example string'${right}`;
  if (typeName.match(/^byte$/)) return `${left}'0x12'${right}`;
  if (typeName.startsWith('struct ')) return '';
  throw new Error(`Unknown type '${typeName}' / '${typeNameSimple}'`);
}

function commentsAndAnnotations(
  paramRec: ParamRecord,
  attestationTypeName: string,
  structName: string,
): string {
  const typeName = paramRec.type;
  const typeNameSimple = paramRec.typeSimple || paramRec.type;
  const comment = JSDocCommentText(paramRec.comment);
  const description = paramRec.comment
    .replace(/\`/g, "'")
    .replace(/\r/g, '')
    .replace(/\n/g, ' ');
  const match = typeName.match(/^(.+)(\[\d*])$/);

  if (match) {
    const match2 = typeNameSimple.match(/^(.+)(\[\d*])$/);
    if (!match2) {
      throw new Error(
        `Unexpected type name '${typeNameSimple}' for '${typeName}'.`,
      );
    }
    const apiPropertyAnnotation = typeName.startsWith('struct ')
      ? `@ApiProperty({ description: \`${description}\` })`
      : `@ApiProperty({ description: \`${description}\`, example: ${exampleFor(match[1], match2[1], true)} })`;
    const annotations = `${validationAnnotation(match[1], match2[1], attestationTypeName, true)}
  ${apiPropertyAnnotation}`;
    return comment ? `${comment}\n  ${annotations}` : `  ${annotations}`;
  }

  if (
    attestationTypeName === 'Web2Json' &&
    structName === 'RequestBody' &&
    paramRec.name === 'httpMethod'
  ) {
    const annotations = `@IsEnum(HTTP_METHOD)
  @ApiProperty({ description: \`${description}\`, example: 'GET', enum: HTTP_METHOD })`;
    return comment ? `${comment}\n  ${annotations}` : `  ${annotations}`;
  }

  if (typeName.match(/^bytes32$/)) {
    let example;
    if (paramRec.name === 'attestationType') {
      example = `'${encodeAttestationName(attestationTypeName)}'`;
    } else if (paramRec.name === 'sourceId') {
      example = `'${encodeAttestationName('DOGE')}'`;
    } else {
      example = exampleFor(typeName, typeNameSimple);
    }
    const annotations = `${validationAnnotation(typeName, typeNameSimple, attestationTypeName)}
  @Transform(transformHash32)
  @ApiProperty({ description: \`${description}\`, example: ${example} })`;
    return comment ? `${comment}\n  ${annotations}` : `  ${annotations}`;
  }

  if (typeName.startsWith('struct ')) {
    const annotations = `${validationAnnotation(typeName, typeNameSimple, attestationTypeName)}
  @ApiProperty({ description: \`${description}\` })`;
    return comment ? `${comment}\n  ${annotations}` : `  ${annotations}`;
  }

  const annotations = `${validationAnnotation(typeName, typeNameSimple, attestationTypeName)}
  @ApiProperty({ description: \`${description}\`, example: ${exampleFor(typeName, typeNameSimple)} })`;
  return comment ? `${comment}\n  ${annotations}` : `  ${annotations}`;
}

function paramFormat(
  param: ParamRecord,
  attestationTypeName: string,
  structName: string,
) {
  if (param.name === 'messageIntegrityCode') return '';
  const resolvedType =
    attestationTypeName === 'Web2Json' &&
    structName === 'RequestBody' &&
    param.name === 'httpMethod'
      ? 'HTTP_METHOD'
      : solidityToDTOTypeInitialized(param.type, attestationTypeName);

  return `${commentsAndAnnotations(param, attestationTypeName, structName)}
  ${param.name}: ${resolvedType};`;
}

function structType(structRec: StructRecord, attestationTypeName: string): string {
  return `export class ${attestationTypeName}_${structRec.name} {
  constructor(params: Required<${attestationTypeName}_${structRec.name}>) {
    Object.assign(this, params);
  }

${structRec.params
  .map((param) => paramFormat(param, attestationTypeName, structRec.name))
  .filter(Boolean)
  .join('\n\n')}
}`;
}

const autoGenerateCodeNotice = `
//////////////////////////////////////////////////////////////////////////////////////////
/////// THIS CODE IS AUTOGENERATED. DO NOT CHANGE!!!                             /////////
//////////////////////////////////////////////////////////////////////////////////////////
`;

function attestationResponseDTOSpecific(name: string) {
  if (name === 'EVMTransaction') return '';
  return `
/**
 * Attestation response for specific attestation type (flattened)
 */
export class AttestationResponseDTO_${name}_Response {
  constructor(params: Required<AttestationResponseDTO_${name}_Response>) {
    Object.assign(this, params);
  }

  status: AttestationResponseStatus;

  response?: ${name}_Response;
}
`;
}

export function getDTOsForName(name: string, typeRec: TypeRecord): string {
  const reversedRequestStructs = [...(typeRec.requestStructs || [])].reverse();
  const reversedResponseStructs = [...(typeRec.responseStructs || [])].reverse();
  const hasHttpMethod =
    name === 'Web2Json' &&
    (typeRec.requestBody.params || []).some((p) => p.name === 'httpMethod');
  const hasStatusEnum = name !== 'EVMTransaction';
  const hasScalarHash32 = [
    ...(typeRec.requestStructs || []),
    ...(typeRec.responseStructs || []),
    typeRec.responseBody,
    typeRec.requestBody,
    typeRec.request,
    typeRec.response,
    typeRec.proof,
  ]
    .filter(Boolean)
    .some((s) => (s.params || []).some((p) => p.type === 'bytes32'));

  return (
    (name === 'EVMTransaction' ? autoGenerateCodeNotice : '') +
    `import { ApiProperty } from '@nestjs/swagger';
import { ${hasScalarHash32 ? 'Transform, ' : ''}Type } from 'class-transformer';
import { IsBoolean, IsDefined, IsNotEmptyObject, IsObject, IsString, Validate, ValidateNested${hasHttpMethod ? ', IsEnum' : ''} } from 'class-validator';
import { Is0xHex, IsEVMAddress, IsHash32, IsUnsignedIntLike } from '../dto-validators';
${hasScalarHash32 ? "import { transformHash32 } from '../dto-transform-utils';" : ''}
${hasStatusEnum ? "import { AttestationResponseStatus } from '../../verification/response-status';" : ''}
${hasHttpMethod ? "import { HTTP_METHOD } from '../../config/interfaces/web2-json';" : ''}
${name === 'EVMTransaction' ? attestationResponseStatusEnum : ''}

///////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////// DTOs /////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////
${attestationResponseDTOSpecific(name)}
${reversedRequestStructs.map((struct) => structType(struct, name)).join('\n\n')}
${reversedResponseStructs.map((struct) => structType(struct, name)).join('\n\n')}
${structType(typeRec.responseBody, name)}
${structType(typeRec.requestBody, name)}
${structType(typeRec.request, name)}
${structType(typeRec.response, name)}
${structType(typeRec.proof, name)}
`
  );
}

async function main() {
  const args = process.argv.slice(2);
  const outDirArg = args.indexOf('--out-dir');
  const outDir =
    outDirArg >= 0 && args[outDirArg + 1] ? path.resolve(args[outDirArg + 1]) : DTO_DIR;

  const defs = fs
    .readdirSync(TYPE_DEFS_DIR)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .map((f) => readJson(path.join(TYPE_DEFS_DIR, f)) as TypeRecord);

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  for (const def of defs) {
    let content = getDTOsForName(def.name, def);
    content = await format(content, PRETTIER_SETTINGS_NEST_JS_DTO);
    const dtoPath = path.join(outDir, `${def.name}.dto.ts`);
    fs.writeFileSync(dtoPath, content);
    console.log(`generated ${path.relative(ROOT, dtoPath)}`);
  }
}

main();
