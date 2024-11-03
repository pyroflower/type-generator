import { expect } from '@jest/globals';
import 'expect-more-jest';
import 'jest-expect-message';
import { TypeGenerator } from '../../src/type-generator/TypeGenerator';
import '../__helpers__/customMatchers';
import { Type } from '@sinclair/typebox';
import isEqual from 'lodash/isequal';
import { addSingleTypeToArray } from '../../src/type-generator/utils/mergeTypes';

describe('mergeTypes', () => {
  test('If both schemes are equal, they result in that schema', () => {
    const typeOne = Type.String();
    const typeTwo = Type.String();
    const result = TypeGenerator.mergeTypes(typeOne, typeTwo);
    expect(result).toEqualSchema(Type.String());
  });

  test('If both schemes are strings, but one is optional, the resulting schema will be an optional string', () => {
    const typeOne = Type.String();
    const typeTwo = Type.Optional(Type.String());
    const expected = Type.Optional(Type.String());
    expect(TypeGenerator.mergeTypes(typeOne, typeTwo)).toEqualSchema(expected);
    expect(TypeGenerator.mergeTypes(typeOne, typeTwo)).toEqualSchema(expected);
  });

  test('When the given schemes differ, the result will be an union of both types', () => {
    const typeOne = Type.String();
    const typeTwo = Type.Number();
    const result = TypeGenerator.mergeTypes(typeOne, typeTwo);
    expect(result).toEqualSchema(Type.Union([Type.String(), Type.Number()]));
  });

  test('When the given schemes differ and one of the schemes is optional, the result will be an optional union of both types', () => {
    const typeOne = Type.Optional(Type.String());
    const typeTwo = Type.Integer();
    const result = TypeGenerator.mergeTypes(typeOne, typeTwo);
    const result2 = TypeGenerator.mergeTypes(typeTwo, typeOne);
    expect(result).toEqualSchema(
      Type.Optional(Type.Union([Type.Integer(), Type.String()]))
    );
    expect(result2).toEqualSchema(
      Type.Optional(Type.Union([Type.Integer(), Type.String()]))
    );
  });

  describe('Object types', () => {
    test('When the given schemes are both objects, the result will be an object where the types for the keys are merged into a scheme', () => {
      const typeOne = Type.Object({ foo: Type.String() });
      const typeTwo = Type.Object({ foo: Type.String() });
      const result = TypeGenerator.mergeTypes(typeOne, typeTwo);
      expect(result).toEqualSchema(Type.Object({ foo: Type.String() }));
    });

    test('returns optional type when merging objects together with optional and non-optional key', () => {
      const typeOne = Type.Object({ foo: Type.Optional(Type.String()) });
      const typeTwo = Type.Object({ foo: Type.String() });
      const result = TypeGenerator.mergeTypes(typeOne, typeTwo);
      const result2 = TypeGenerator.mergeTypes(typeTwo, typeOne);
      expect(result).toEqualSchema(
        Type.Object({ foo: Type.Optional(Type.String()) })
      );
      expect(result2).toEqualSchema(
        Type.Object({ foo: Type.Optional(Type.String()) })
      );
    });

    test('returns nested object type', () => {
      const typeOne = Type.Object({ foo: Type.Object({ bar: Type.String() }) });
      const typeTwo = Type.Object({ foo: Type.String() });
      const result = TypeGenerator.mergeTypes(typeOne, typeTwo);
      const result2 = TypeGenerator.mergeTypes(typeTwo, typeOne);
      expect(result).toEqualSchema(
        Type.Object({
          foo: Type.Union([Type.String(), Type.Object({ bar: Type.String() })]),
        })
      );
      expect(result2).toEqualSchema(
        Type.Object({
          foo: Type.Union([Type.String(), Type.Object({ bar: Type.String() })]),
        })
      );
    });

    test('returns nested object type', () => {
      const typeOne = Type.Object({ foo: Type.Object({ bar: Type.String() }) });
      const typeTwo = Type.Object({ foo: Type.Optional(Type.String()) });
      const result = TypeGenerator.mergeTypes(typeOne, typeTwo);
      const result2 = TypeGenerator.mergeTypes(typeTwo, typeOne);
      expect(result).toEqualSchema(
        Type.Object({
          foo: Type.Optional(
            Type.Union([Type.String(), Type.Object({ bar: Type.String() })])
          ),
        })
      );
      expect(result2).toEqualSchema(
        Type.Object({
          foo: Type.Optional(
            Type.Union([Type.String(), Type.Object({ bar: Type.String() })])
          ),
        })
      );
    });

    test('Object with Literal types', () => {
      const typeOne = Type.Object({
        foo: Type.Object({ bar: Type.Literal('literal') }),
      });
      const typeTwo = Type.Object({
        foo: Type.Object({ bar: Type.Boolean() }),
      });
      const expected = Type.Object({
        foo: Type.Object({
          bar: Type.Union([Type.Literal('literal'), Type.Boolean()]),
        }),
      });
      const result = TypeGenerator.mergeTypes(typeOne, typeTwo);
      const result2 = TypeGenerator.mergeTypes(typeTwo, typeOne);
      expect(result).toEqualSchema(expected);
      expect(result2).toEqualSchema(expected);
    });
  });

  describe('Union types', () => {
    test('Two unions should be merged into one', () => {
      const typeOne = Type.Union([Type.String(), Type.Number()]);
      const typeTwo = Type.Union([Type.Boolean(), Type.Integer()]);
      const result = TypeGenerator.mergeTypes(typeOne, typeTwo);
      const result2 = TypeGenerator.mergeTypes(typeTwo, typeOne);
      expect(result).toEqualSchema(
        Type.Union([
          Type.String(),
          Type.Boolean(),
          Type.Number(),
          Type.Integer(),
        ])
      );
      expect(result2).toEqualSchema(
        Type.Union([
          Type.String(),
          Type.Boolean(),
          Type.Number(),
          Type.Integer(),
        ])
      );
    });

    test('One union and primitive value should add primitive to the union', () => {
      const typeOne = Type.Union([Type.String(), Type.Number()]);
      const typeTwo = Type.Boolean();
      const result = TypeGenerator.mergeTypes(typeOne, typeTwo);
      const result2 = TypeGenerator.mergeTypes(typeTwo, typeOne);
      expect(result).toEqualSchema(
        Type.Union([Type.String(), Type.Boolean(), Type.Number()])
      );
      expect(result2).toEqualSchema(
        Type.Union([Type.String(), Type.Boolean(), Type.Number()])
      );
    });
  });

  describe('Literal types', () => {
    test('Literal string and generic string should become generic string', () => {
      const typeOne = Type.Literal('literal');
      const typeTwo = Type.String();
      const expected = Type.String();

      const result = TypeGenerator.mergeTypes(typeOne, typeTwo);
      const result2 = TypeGenerator.mergeTypes(typeTwo, typeOne);
      expect(result).toEqualSchema(expected);
      expect(result2).toEqualSchema(expected);
    });

    test('Literal number and generic number should become generic number', () => {
      const typeOne = Type.Literal(1);
      const typeTwo = Type.Number();
      const expected = Type.Number();

      const result = TypeGenerator.mergeTypes(typeOne, typeTwo);
      const result2 = TypeGenerator.mergeTypes(typeTwo, typeOne);
      expect(result).toEqualSchema(expected);
      expect(result2).toEqualSchema(expected);
    });

    test('Literal boolean and generic boolean should become generic boolean', () => {
      const typeOne = Type.Literal(true);
      const typeTwo = Type.Boolean();
      const expected = Type.Boolean();

      const result = TypeGenerator.mergeTypes(typeOne, typeTwo);
      const result2 = TypeGenerator.mergeTypes(typeTwo, typeOne);
      expect(result).toEqualSchema(expected);
      expect(result2).toEqualSchema(expected);
    });

    test('[helper] Merge type in array', () => {
      const arr = [
        Type.Literal('literal'),
        Type.Literal('abc'),
        Type.Literal(2),
      ];
      const input = Type.String();
      addSingleTypeToArray(arr, input);
      expect(isEqual(arr, [Type.Literal(2), Type.String()])).toBeTruthy();
    });

    test('Literal string in union and generic non-union string will have only generic in union', () => {
      const typeOne = Type.Literal('literal');
      const typeTwo = Type.Union([Type.Boolean(), Type.String()]);
      const expected = Type.Union([Type.Boolean(), Type.String()]);

      const result = TypeGenerator.mergeTypes(typeOne, typeTwo);
      const result2 = TypeGenerator.mergeTypes(typeTwo, typeOne);
      expect(result).toEqualSchema(expected);
      expect(result2).toEqualSchema(expected);
    });
  });
});
