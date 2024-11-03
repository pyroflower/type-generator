import { expect } from '@jest/globals';
import 'expect-more-jest';
import 'jest-expect-message';
import { TypeGenerator } from '../../../src/type-generator/TypeGenerator';
import '../../__helpers__/customMatchers';
import { Type } from '@sinclair/typebox';

describe('Union Types', () => {
  let typeGenerator: TypeGenerator;
  let typeGeneratorUsingLiteral: TypeGenerator;

  const objectWithAllPrimitives = {
    keyNumber: 2,
    keyInteger: 2.9,
    keyString: 'str',
    keySymbol: Symbol('key'),
    keyBoolean: false,
    keyObject: {},
    keyNull: null,
    keyArray: [],
  };
  const copyOfObjectWithAllPrimitives = { ...objectWithAllPrimitives };
  const objectWAPChanged = {
    keyNumber: 'str',
    keyInteger: 'str',
    keyString: 3,
    keySymbol: 'str',
    keyBoolean: 'str',
    keyObject: 'str',
    keyNull: 'str',
    keyArray: 'str',
  };
  const AllPrimitivesSchema = Type.Object({
    keyNumber: Type.Integer(),
    keyInteger: Type.Number(),
    keyString: Type.String(),
    keySymbol: Type.Symbol(),
    keyBoolean: Type.Boolean(),
    keyObject: Type.Object({}),
    keyNull: Type.Null(),
    keyArray: Type.Array(Type.Unknown()),
  });

  const AllPrimitivesCombinedSchema = Type.Object({
    keyNumber: Type.Union([Type.Integer(), Type.String()]),
    keyInteger: Type.Union([Type.Number(), Type.String()]),
    keyString: Type.Union([Type.String(), Type.Integer()]),
    keySymbol: Type.Union([Type.Symbol(), Type.String()]),
    keyBoolean: Type.Union([Type.Boolean(), Type.String()]),
    keyObject: Type.Union([Type.Object({}), Type.String()]),
    keyNull: Type.Union([Type.Null(), Type.String()]),
    keyArray: Type.Union([Type.Array(Type.Unknown()), Type.String()]),
  });

  beforeEach(() => {
    typeGenerator = new TypeGenerator();
    typeGeneratorUsingLiteral = new TypeGenerator({
      literalKeys: ['key'],
    });
  });
  test('TypeGenerator type shall remain unchanged when a second object is pushed with the same types', () => {
    typeGenerator.addObject(objectWithAllPrimitives);

    expect(typeGenerator.produce()).toEqualSchema(AllPrimitivesSchema);

    typeGenerator.addObject(copyOfObjectWithAllPrimitives);
    expect(typeGenerator.produce()).toEqualSchema(AllPrimitivesSchema);
  });

  test('TypeGenerator type shall remain unchanged when a second object is pushed with the different types', () => {
    typeGenerator.addObject(objectWithAllPrimitives);

    expect(typeGenerator.produce()).toEqualSchema(AllPrimitivesSchema);

    typeGenerator.addObject(objectWAPChanged);
    expect(typeGenerator.produce()).toEqualSchema(AllPrimitivesCombinedSchema);
  });

  test('TypeGenerator key will become optional if new object is missing', () => {
    const firstObject = { key: 'str', optionalKey: 'str' };
    const secondObject = { key: 2 };
    const FirstObjectSchema = Type.Object({
      key: Type.String(),
      optionalKey: Type.String(),
    });
    const SecondObjectSchema = Type.Object({
      key: Type.Union([Type.String(), Type.Integer()]),
      optionalKey: Type.Optional(Type.String()),
    });
    typeGenerator.addObject(firstObject);

    expect(typeGenerator.produce()).toEqualSchema(FirstObjectSchema);

    typeGenerator.addObject(secondObject);
    expect(typeGenerator.produce()).toEqualSchema(SecondObjectSchema);
  });

  test('TypeGenerator key with the same types will not unionize', () => {
    const firstObject = { key: 'str' };
    const secondObject = { key: 'str' };
    const FirstObjectSchema = Type.Object({
      key: Type.String(),
    });
    typeGenerator.addObject(firstObject);

    expect(typeGenerator.produce()).toEqualSchema(FirstObjectSchema);

    typeGenerator.addObject(secondObject);
    expect(typeGenerator.produce()).toEqualSchema(FirstObjectSchema);
  });

  test('TypeGenerator existing object without a key in new object, will result in optional', () => {
    const firstObject = { key2: 'str' };
    const secondObject = { key: 'str' };
    const FirstObjectSchema = Type.Object({
      key2: Type.String(),
    });
    const SecondObjectSchema = Type.Object({
      key: Type.Optional(Type.String()),
      key2: Type.Optional(Type.String()),
    });
    typeGenerator.addObject(firstObject);

    expect(typeGenerator.produce()).toEqualSchema(FirstObjectSchema);

    typeGenerator.addObject(secondObject);
    expect(typeGenerator.produce()).toEqualSchema(SecondObjectSchema);
  });
});
