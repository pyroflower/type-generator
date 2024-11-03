import { expect } from '@jest/globals';
import 'expect-more-jest';
import 'jest-expect-message';
import { TypeGenerator } from '../../src/type-generator/TypeGenerator';
import '../__helpers__/customMatchers';
import { Type } from '@sinclair/typebox';

describe('convertToTypeboxSchema', () => {
  test('converts string to Type.String()', () => {
    const input = 'test string';
    const result = TypeGenerator.convertToTypeboxSchema(input);
    expect(result).toEqualSchema(Type.String());
  });

  test('converts integer number to Type.Integer()', () => {
    const input = 42;
    const result = TypeGenerator.convertToTypeboxSchema(input);
    expect(result).toEqualSchema(Type.Integer());
  });

  test('converts float number to Type.Number()', () => {
    const input = 3.14;
    const result = TypeGenerator.convertToTypeboxSchema(input);
    expect(result).toEqualSchema(Type.Number());
  });

  test('converts boolean to Type.Boolean()', () => {
    const input = true;
    const result = TypeGenerator.convertToTypeboxSchema(input);
    expect(result).toEqualSchema(Type.Boolean());
  });

  test('converts null to Type.Null()', () => {
    const input = null;
    const result = TypeGenerator.convertToTypeboxSchema(input);
    expect(result).toEqualSchema(Type.Null());
  });

  test('converts array to Type.Array(Type.Unknown())', () => {
    const input = [];
    const result = TypeGenerator.convertToTypeboxSchema(input);
    expect(result).toEqualSchema(Type.Array(Type.Unknown()));
  });

  test('converts empty object to Type.Object({})', () => {
    const input = {};
    const result = TypeGenerator.convertToTypeboxSchema(input);
    expect(result).toEqualSchema(Type.Object({}));
  });

  test('converts symbol to Type.Symbol()', () => {
    const input = Symbol('test');
    const result = TypeGenerator.convertToTypeboxSchema(input);
    expect(result).toEqualSchema(Type.Symbol());
  });

  test('converts undefined to Type.Any()', () => {
    const input = undefined;
    const result = TypeGenerator.convertToTypeboxSchema(input);
    expect(result).toEqualSchema(Type.Any());
  });

  test('converts array containing a number to Type.Array(Type.Integer())', () => {
    const input = [1];
    const result = TypeGenerator.convertToTypeboxSchema(input);
    expect(result).toEqualSchema(Type.Array(Type.Integer()));
  });

  test('converts array containing a number to Type.Array(Type.Integer())', () => {
    const input = [1, 'str'];
    const result = TypeGenerator.convertToTypeboxSchema(input);
    expect(result).toEqualSchema(
      Type.Array(Type.Union([Type.Integer(), Type.String()]))
    );
  });
});
