import { OptionalKind, TSchema, Type } from '@sinclair/typebox';
import { isLiteral, isObjectType, isOptional, isUnion } from './typeGuards';
import isEqual from 'lodash/isequal';
import { deepEqual } from './deepEqual';

export function addSingleTypeToArray(arr: TSchema[], input: TSchema) {
  if (isLiteral(input)) {
    // If input is literal, check if we already have a non-literal type that matches
    if (
      arr.some((item) => !isLiteral(item) && item.type === typeof input.const)
    ) {
      return;
    }

    // Remove any literals of same type
    const remainingItems = arr.filter((item) => !deepEqual(item, input));
    remainingItems.push(input);
    arr.length = 0;
    arr.push(...remainingItems);
    return;
  }

  // If input is non-literal, remove any literals of same type
  const remainingItems = arr.filter(
    (item) => !isLiteral(item) || item.type !== input.type
  );

  // Only add if the type is not in the array yet
  if (!remainingItems.some((item) => deepEqual(item, input))) {
    remainingItems.push(input);
  }

  arr.length = 0;
  arr.push(...remainingItems);
}

function addSchemaToUnion(arr: TSchema[], schema: TSchema) {
  if (isUnion(schema)) {
    schema.anyOf.forEach((type) => addSingleTypeToArray(arr, type));
  } else {
    addSingleTypeToArray(arr, schema);
  }
}

export function mergeTypes<T extends TSchema, U extends TSchema>(
  typeOne: T,
  typeTwo: U
) {
  if (isOptional(typeOne) || isOptional(typeTwo)) {
    const { [OptionalKind]: _o1, ...restTypeOne } = typeOne;
    const { [OptionalKind]: _o2, ...restTypeTwo } = typeTwo;
    return Type.Optional(mergeTypes(restTypeOne as any, restTypeTwo as any));
  }
  if (isObjectType(typeOne) !== isObjectType(typeTwo)) {
    return Type.Union([typeOne, typeTwo]);
  }
  if (isObjectType(typeOne) && isObjectType(typeTwo)) {
    const mergedProperties = {};
    const allKeys = new Set([
      ...Object.keys(typeOne.properties),
      ...Object.keys(typeTwo.properties),
    ]);

    for (const key of allKeys) {
      if (key in typeOne.properties && key in typeTwo.properties) {
        mergedProperties[key] = mergeTypes(
          typeOne.properties[key],
          typeTwo.properties[key]
        );
      } else if (key in typeOne.properties) {
        mergedProperties[key] = Type.Optional(typeOne.properties[key]);
      } else {
        mergedProperties[key] = Type.Optional(typeTwo.properties[key]);
      }
    }

    return Type.Object(mergedProperties);
  }
  if (isEqual(typeOne, typeTwo)) {
    return typeOne;
  }

  // merge unions
  if (isUnion(typeOne) || isUnion(typeTwo)) {
    const typesToUnionize = [];

    addSchemaToUnion(typesToUnionize, typeOne);
    addSchemaToUnion(typesToUnionize, typeTwo);

    return Type.Union(typesToUnionize);
  }

  // Literal Type
  if (
    typeOne.type === typeTwo.type &&
    (typeOne.type === 'string' ||
      typeOne.type === 'number' ||
      typeOne.type === 'boolean')
  ) {
    if (typeOne.const !== undefined || typeTwo.const !== undefined) {
      // If either is a literal type but they share the same base type, return the generic type
      return Type[
        typeOne.type.charAt(0).toUpperCase() + typeOne.type.slice(1)
      ]();
    }
  }
  return Type.Union([typeOne, typeTwo]);
}
