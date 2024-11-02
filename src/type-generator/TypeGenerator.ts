import type { Primitive, TypeGeneratorConfiguration } from './types';
import { TSchema, Type } from '@sinclair/typebox';

function convertToTypeboxSchema(input: Primitive) {
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
        ? Type.Array(Type.Unknown())
        : null === input
        ? Type.Null()
        : Type.Object({});
    default:
      return Type.Any();
  }
}

function mergeTypes<T extends TSchema, U extends TSchema>(
  typeOne: T,
  typeTwo: U
) {
  if (deepEqual(typeOne, typeTwo)) return typeOne;
  return Type.Union([typeOne, typeTwo]);
}

export class TypeGenerator {
  readonly literalKeys: TypeGeneratorConfiguration['literalKeys'] = [];
  result: TypeGeneratorConfiguration['currentSchema'] = {};
  constructor(config?: TypeGeneratorConfiguration) {
    if (config?.literalKeys) {
      this.literalKeys = config.literalKeys;
    }
  }

  addObject(obj: Record<string | number, any>) {
    Object.keys(obj).reduce((prev, curr) => {
      // Already has info about key
      if (prev[curr]) {
        prev[curr] = mergeTypes(prev[curr], convertToTypeboxSchema(obj[curr]));
      } else {
        prev[curr] = this.literalKeys.includes(curr)
          ? Type.Literal(obj[curr])
          : convertToTypeboxSchema(obj[curr]);
      }

      return prev;
    }, this.result);
    return this.result;
  }

  produce() {
    return Type.Object(this.result);
  }
}

function deepEqual(obj1, obj2) {
  if (obj1 === obj2)
    // it's just the same object. No need to compare.
    return true;

  if (isPrimitive(obj1) && isPrimitive(obj2))
    // compare primitives
    return obj1 === obj2;

  if (Object.keys(obj1).length !== Object.keys(obj2).length) return false;

  // compare objects with same number of keys
  for (let key in obj1) {
    if (!(key in obj2)) return false; //other object doesn't have this prop

    if (!deepEqual(obj1[key], obj2[key])) return false;
  }

  return true;
}

//check if value is primitive
function isPrimitive(obj) {
  return obj !== Object(obj);
}
