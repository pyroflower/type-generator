import type {
  ObjectTypes,
  Primitive,
  TypeGeneratorConfiguration,
} from './types';
import { TSchema, Type } from '@sinclair/typebox';
import { mergeTypes } from './utils/mergeTypes';
import cloneDeep from 'lodash/cloneDeep';

function convertToTypeboxSchema(
  input: Primitive | ObjectTypes,
  config?: TypeGeneratorConfiguration
) {
  switch (typeof input) {
    case 'string':
      return Type.String();
    case 'number':
    case 'bigint':
      return input % 1 === 0 ? Type.Integer() : Type.Number();
    case 'symbol':
      return Type.Symbol();
    case 'boolean':
      return Type.Boolean();
    case 'object':
      return Array.isArray(input)
        ? convertToTypeboxArrayType(input)
        : null === input
        ? Type.Null()
        : convertToTypeboxObjectType(input);
    default:
      return Type.Any();
  }
}

function convertToTypeboxArrayType(input: Array<unknown>) {
  if (input.length === 0) {
    return Type.Array(Type.Unknown());
  }

  const schemas = input.map((item) => convertToTypeboxSchema(item as any));
  const unionType = schemas.reduce((prev, curr) => mergeTypes(prev, curr));
  return Type.Array(unionType);
}

function convertToTypeboxObjectType<T extends object>(input: T) {
  const keys = Object.keys(input);

  const newObj = {} as Record<string | number, TSchema>;

  keys.forEach((key) => {
    newObj[key] = convertToTypeboxSchema(input[key]);
  });

  return Type.Object(newObj);
}

export class TypeGenerator {
  static convertToTypeboxSchema(
    input: Parameters<typeof convertToTypeboxSchema>[0]
  ) {
    return convertToTypeboxSchema(input);
  }

  static mergeTypes(...args: Parameters<typeof mergeTypes>) {
    return mergeTypes(...args);
  }

  readonly literalKeys: TypeGeneratorConfiguration['literalKeys'] = [];
  result: TypeGeneratorConfiguration['currentSchema'] = {};
  private isFirstObjectAdded = false;
  constructor(config?: TypeGeneratorConfiguration) {
    if (config?.literalKeys) {
      this.literalKeys = config.literalKeys;
    }
  }

  addObject(obj: Record<string | number, any>) {
    if (this.isFirstObjectAdded) {
      return this.addAdditionalObject(obj);
    }
    return this.addFirstObject(obj);
  }

  produce() {
    return Type.Object(cloneDeep(this.result));
  }

  private addFirstObject(obj: Record<string | number, any>) {
    const objectKeys = Object.keys(obj);
    objectKeys.reduce((prev, curr) => {
      if (
        typeof obj[curr] === 'object' &&
        !Array.isArray(obj[curr]) &&
        null !== obj[curr]
      ) {
        // is object
        if (this.literalKeys.includes(curr)) {
          // curr is a literal key
          const lTypeGenerator = new TypeGenerator({
            literalKeys: this.literalKeys,
          });
          lTypeGenerator.addObject(obj[curr]);
          prev[curr] = lTypeGenerator.produce();
          return prev;
        }
      }
      prev[curr] = this.literalKeys.includes(curr)
        ? Type.Literal(obj[curr])
        : convertToTypeboxSchema(obj[curr]);
      return prev;
    }, this.result);

    this.isFirstObjectAdded = true;
    return this.result;
  }

  private addAdditionalObject(obj: Record<string | number, any>) {
    const objectKeys = Object.keys(obj);
    const resultKeys = Object.keys(this.result);
    const missingKeys = resultKeys.filter((v) => !(v in obj));

    missingKeys.forEach((key) => {
      if (this.result[key]) {
        this.result[key] = Type.Optional(this.result[key]);
      }
    });

    objectKeys.reduce((prev, curr) => {
      if (prev[curr]) {
        if (
          typeof obj[curr] === 'object' &&
          !Array.isArray(obj[curr]) &&
          null !== obj[curr]
        ) {
          // is object
          const lTypeGenerator = new TypeGenerator({
            literalKeys: this.literalKeys,
          });
          lTypeGenerator.addObject(obj[curr]);
          prev[curr] = mergeTypes(prev[curr], lTypeGenerator.produce());
        } else {
          if (this.literalKeys.includes(curr)) {
            prev[curr] = mergeTypes(prev[curr], Type.Literal(obj[curr]));
          } else {
            prev[curr] = mergeTypes(
              prev[curr],
              convertToTypeboxSchema(obj[curr])
            );
          }
        }
      } else {
        prev[curr] = Type.Optional(
          this.literalKeys.includes(curr)
            ? Type.Literal(obj[curr])
            : convertToTypeboxSchema(obj[curr])
        );
      }
      return prev;
    }, this.result);

    return this.result;
  }
}
