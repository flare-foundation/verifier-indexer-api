import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  getSchemaPath
} from '@nestjs/swagger';
import { ApiResponseWrapper } from './api-models/ApiResponse';
import { PaginatedList } from './api-models/PaginatedList';

/**
 * Open API array results properties for a given model
 * @param model
 * @returns
 */
function arrayResults<TModel extends Type<any>>(model: TModel) {
  return {
    properties: {
      data: {
        type: 'array',
        items: { $ref: getSchemaPath(model) },
      },
    },
  };
}

/**
 * Open API properties for flat model.
 * @param model
 * @returns
 */
function flatResults<TModel extends Type<any>>(model: TModel) {
  return {
    properties: {
      data: { $ref: getSchemaPath(model) },
    },
  };
}

/**
 * Open API decorator for API response wrappers given generic type, either in the direct form or in array.
 * @param model
 * @param isArray
 * @returns
 */
export function ApiResponseWrapperDec<TModel extends Type<any>>(
  model: TModel,
  isArray: boolean = false,
) {
  return applyDecorators(
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseWrapper) },
          isArray ? arrayResults(model) : flatResults(model),
        ],
      },
    }),
    ApiExtraModels(model),
    ApiExtraModels(ApiResponseWrapper),
  );
}

/**
 * Open API decorator for API response wrappers given generic type, either in the direct form or in array.
 * @param model
 * @param isArray
 * @returns
 */
export function ApiResponseWrapperPaginated<TModel extends Type<any>>(
  model: TModel,
) {
  return applyDecorators(
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseWrapper) },
          {
            properties: {
              data: {
                allOf: [
                  { $ref: getSchemaPath(PaginatedList) },
                  {
                    properties: {
                      data: {
                        type: 'array',
                        items: { $ref: getSchemaPath(model) },
                      },
                    },
                  },
                ],
              },
            },
          },
        ],
      },
    }),
    ApiExtraModels(model),
    ApiExtraModels(PaginatedList),
    ApiExtraModels(ApiResponseWrapper),
  );
}

// /**
//  *
//  * @param models
//  * @returns
//  */
// export function ApiPropertyUnion<TTypeArray extends Array<Type<any>>>(
//   models: TTypeArray,
// ) {
//   return applyDecorators(
//     ApiProperty({
//       oneOf: models.map((model) => {
//         return {
//           $ref: getSchemaPath(model),
//         };
//       }),
//     }),
//   );
// }

// /**
//  * Decorator for Union type generic responses.
//  * @param models
//  * @returns
//  */
// export function ApiBodyUnion<TTypeArray extends Array<Type<any>>>(
//   models: TTypeArray,
// ) {
//   return applyDecorators(
//     ApiBody({
//       schema: {
//         oneOf: models.map((model) => {
//           return {
//             $ref: getSchemaPath(model),
//           };
//         }),
//       },
//     }),
//   );
// }
