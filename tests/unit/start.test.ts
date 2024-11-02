import { expect } from '@jest/globals';
import 'expect-more-jest';
import 'jest-expect-message';
import { TypeGenerator } from '../../src/type-generator/TypeGenerator';
import isEqual from 'lodash.isequal';
import { StringSchema } from '../__mocks__/schemas';
import { z } from 'zod';
import '../__helpers__/customMatchers';
import { Type } from '@sinclair/typebox';

describe('Simple, single objects', () => {
  describe('Primitives', () => {
    let typeGenerator: TypeGenerator;
    let typeGeneratorUsingLiteral: TypeGenerator;

    beforeEach(() => {
      typeGenerator = new TypeGenerator();
      typeGeneratorUsingLiteral = new TypeGenerator({
        literalKeys: ['key'],
      });
    });
    test('TypeGenerator shall handle object key with type string', () => {
      // Setup
      const STRING_VALUE = 'hello';
      typeGenerator.addObject({ key: STRING_VALUE });
      typeGeneratorUsingLiteral.addObject({ key: STRING_VALUE });

      // Run
      const ResultSchema = Type.Object({
        key: Type.String(),
      });
      const LiteralResultSchema = Type.Object({
        key: Type.Literal(STRING_VALUE),
      });

      // Check
      expect(typeGenerator.produce()).toEqualSchema(ResultSchema);
      expect(typeGeneratorUsingLiteral.produce()).toEqualSchema(
        LiteralResultSchema
      );
      expect(typeGenerator.produce()).not.toEqualSchema(LiteralResultSchema);
    });

    test('TypeGenerator shall handle object key with type number', () => {
      const NUMBER_VALUE = 3;
      typeGenerator.addObject({ key: NUMBER_VALUE });
      typeGeneratorUsingLiteral.addObject({ key: NUMBER_VALUE });

      // Run
      const ResultSchema = Type.Object({
        key: Type.Integer(),
      });
      const LiteralResultSchema = Type.Object({
        key: Type.Literal(NUMBER_VALUE),
      });

      // Check
      expect(typeGenerator.produce()).toEqualSchema(ResultSchema);
      expect(typeGeneratorUsingLiteral.produce()).toEqualSchema(
        LiteralResultSchema
      );
      expect(typeGenerator.produce()).not.toEqualSchema(LiteralResultSchema);
    });

    test('TypeGenerator shall handle object key with type boolean', () => {
      const BOOLEAN_VALUE = true;
      typeGenerator.addObject({ key: BOOLEAN_VALUE });
      typeGeneratorUsingLiteral.addObject({ key: BOOLEAN_VALUE });

      // Run
      const ResultSchema = Type.Object({
        key: Type.Boolean(),
      });
      const LiteralResultSchema = Type.Object({
        key: Type.Literal(BOOLEAN_VALUE),
      });

      // Check
      expect(typeGenerator.produce()).toEqualSchema(ResultSchema);
      expect(typeGeneratorUsingLiteral.produce()).toEqualSchema(
        LiteralResultSchema
      );
      expect(typeGenerator.produce()).not.toEqualSchema(LiteralResultSchema);
    });

    test('TypeGenerator shall handle object key with type integer', () => {
      const INTEGER_VALUE = 3.5;
      typeGenerator.addObject({ key: INTEGER_VALUE });
      typeGeneratorUsingLiteral.addObject({ key: INTEGER_VALUE });

      // Run
      const ResultSchema = Type.Object({
        key: Type.Number(),
      });
      const LiteralResultSchema = Type.Object({
        key: Type.Literal(INTEGER_VALUE),
      });

      // Check
      expect(typeGenerator.produce()).toEqualSchema(ResultSchema);
      expect(typeGeneratorUsingLiteral.produce()).toEqualSchema(
        LiteralResultSchema
      );
      expect(typeGenerator.produce()).not.toEqualSchema(LiteralResultSchema);
    });

    test('TypeGenerator shall handle object key with type array', () => {
      const ARRAY_VALUE = [];
      typeGenerator.addObject({ key: ARRAY_VALUE });
      typeGeneratorUsingLiteral.addObject({ key: ARRAY_VALUE });

      // Run
      const ResultSchema = Type.Object({
        key: Type.Array(Type.Unknown()),
      });
      // TODO: Literal not allowed
      // const LiteralResultSchema = Type.Object({
      //   key: Type.Literal(ARRAY_VALUE),
      // });

      // Check
      expect(typeGenerator.produce()).toEqualSchema(ResultSchema);
      // expect(typeGeneratorUsingLiteral.produce()).toEqualSchema(
      //   LiteralResultSchema
      // );
      // expect(typeGenerator.produce()).not.toEqualSchema(LiteralResultSchema);
    });

    test('TypeGenerator shall handle object key with type object', () => {
      const OBJECT_VALUE = {};
      typeGenerator.addObject({ key: OBJECT_VALUE });
      typeGeneratorUsingLiteral.addObject({ key: OBJECT_VALUE });

      // Run
      const ResultSchema = Type.Object({
        key: Type.Object({}),
      });
      // TODO: Literal not allowed
      // const LiteralResultSchema = Type.Object({
      //   key: Type.Literal(OBJECT_VALUE),
      // });

      // Check
      expect(typeGenerator.produce()).toEqualSchema(ResultSchema);
      // expect(typeGeneratorUsingLiteral.produce()).toEqualSchema(
      //   LiteralResultSchema
      // );
      // expect(typeGenerator.produce()).not.toEqualSchema(LiteralResultSchema);
    });

    test('TypeGenerator shall handle object key with type null', () => {
      const NULL_VALUE = null;
      typeGenerator.addObject({ key: NULL_VALUE });
      typeGeneratorUsingLiteral.addObject({ key: NULL_VALUE });

      // Run
      const ResultSchema = Type.Object({
        key: Type.Null(),
      });

      expect(typeGenerator.produce()).toEqualSchema(ResultSchema);
    });

    test('TypeGenerator shall handle object key with type symbol', () => {
      const SYMBOL_VALUE = Symbol('abc');
      typeGenerator.addObject({ key: SYMBOL_VALUE });
      typeGeneratorUsingLiteral.addObject({ key: SYMBOL_VALUE });

      // Run
      const ResultSchema = Type.Object({
        key: Type.Symbol(),
      });

      expect(typeGenerator.produce()).toEqualSchema(ResultSchema);
    });
  });

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
    test('TypeGenerator type shall remain unchanged when a second object is pushed with the same type', () => {
      typeGenerator.addObject(objectWithAllPrimitives);

      expect(typeGenerator.produce()).toEqualSchema(AllPrimitivesSchema);

      typeGenerator.addObject(copyOfObjectWithAllPrimitives);
      expect(typeGenerator.produce()).toEqualSchema(AllPrimitivesSchema);
    });

    test('TypeGenerator type shall remain unchanged when a second object is pushed with the same type', () => {
      typeGenerator.addObject(objectWithAllPrimitives);

      expect(typeGenerator.produce()).toEqualSchema(AllPrimitivesSchema);

      typeGenerator.addObject(objectWAPChanged);
      expect(typeGenerator.produce()).toEqualSchema(
        AllPrimitivesCombinedSchema
      );
    });
  });
});
