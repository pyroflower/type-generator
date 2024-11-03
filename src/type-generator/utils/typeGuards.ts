import {
  TSchema,
  Kind,
  TUnion,
  TObject,
  OptionalKind,
  TLiteral,
  TOptional,
} from '@sinclair/typebox';

export function isObjectType<T extends TSchema>(obj: T): obj is T & TObject {
  return obj[Kind] === 'Object' && obj.type === 'object';
}

export function isUnion<T extends TSchema>(
  obj: T
): obj is T & TUnion<TSchema[]> {
  return obj[Kind] === 'Union' && obj['anyOf']?.length;
}

export function isOptional<T extends TSchema>(obj: T): obj is TOptional<T> {
  return obj[OptionalKind] === 'Optional';
}

export function isLiteral<T extends TSchema>(obj: T): obj is T & TLiteral {
  return obj[Kind] === 'Literal' && 'const' in obj;
}
