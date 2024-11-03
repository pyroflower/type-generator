import { Type } from '@sinclair/typebox';
import isEqual from 'lodash/isequal';
import { addSingleTypeToArray } from '../../src/type-generator/utils/mergeTypes';
import { deepEqual } from '../../src/type-generator/utils/deepEqual';

test('[helper] Merge schema in empty array', () => {
  const arr = [];
  const input = Type.String();
  addSingleTypeToArray(arr, input);
  expect(isEqual(arr, [Type.String()])).toBeTruthy();
});

test('[helper] Merge schema into array which already copy the same schema', () => {
  const arr = [Type.String()];
  const input = Type.String();
  addSingleTypeToArray(arr, input);
  expect(isEqual(arr, [Type.String()])).toBeTruthy();
});

test('[helper] Merge literal schema into array with generic type of literal', () => {
  const arr = [Type.String()];
  const input = Type.Literal('literal');
  addSingleTypeToArray(arr, input);
  expect(isEqual(arr, [Type.String()])).toBeTruthy();
});

test('[helper] Merge generic schema into array with literal type of that schema', () => {
  const arr = [Type.Literal('literal')];
  const input = Type.String();
  addSingleTypeToArray(arr, input);
  expect(isEqual(arr, [Type.String()])).toBeTruthy();
});

test('[helper] Merge Multiple types into an array', () => {
  const arr = [Type.Literal('literal')];
  const inputs = [
    Type.String(),
    Type.Literal(false),
    Type.Literal(true),
    Type.Literal(false),
    Type.Object({}),
    Type.Array(Type.String()),
  ];
  inputs.forEach((v) => addSingleTypeToArray(arr, v));
  expect(
    deepEqual(arr, [
      Type.String(),
      Type.Literal(true),
      Type.Literal(false),
      Type.Object({}),
      Type.Array(Type.String()),
    ])
  ).toBeTruthy();
  expect(
    deepEqual(arr, [
      Type.Literal(true),
      Type.Literal(false),
      Type.Object({}),
      Type.Array(Type.String()),
    ])
  ).toBeFalsy();
});
