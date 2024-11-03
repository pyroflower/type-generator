import { expect } from '@jest/globals';
import 'expect-more-jest';
import 'jest-expect-message';
import { TypeGenerator } from '../../../src/type-generator/TypeGenerator';
import '../../__helpers__/customMatchers';
import { Type } from '@sinclair/typebox';

const MOCK_OBJECT1 = { key: 'str' } as const;
const MOCK_OBJECT2 = { key: 5 } as const;
const MOCK_OBJECT3 = { key: true, optionalKey: Symbol('optional') } as const;
const MOCK_OBJECT4 = {
  key: { key: 'nested str' },
  optionalKey: false,
} as const;
const MOCK_OBJECT5 = { key: 'str', nestedKey: { key: 'nested str' } } as const;

test(`Adding the same object twice will result in the same output`, () => {
  const typeGenerator = new TypeGenerator();
  const expected = Type.Object({
    key: Type.String(),
  });

  typeGenerator.addObject(MOCK_OBJECT1);
  const firstResult = typeGenerator.produce();

  typeGenerator.addObject(MOCK_OBJECT1);
  const secondResult = typeGenerator.produce();

  expect(firstResult).toEqualSchema(expected);
  expect(secondResult).toEqualSchema(expected);
});

test(`TypeGenerator.produce() shall produce a copy of the current state`, () => {
  const typeGenerator = new TypeGenerator();
  const expectedFirst = Type.Object({
    key: Type.String(),
  });

  typeGenerator.addObject(MOCK_OBJECT1);
  const firstResult = typeGenerator.produce();
  expect(firstResult).toEqualSchema(expectedFirst);

  typeGenerator.addObject(MOCK_OBJECT2);
  expect(firstResult).toEqualSchema(expectedFirst);
});

test(`Adding object which same key but different type wil unionize that key`, () => {
  const typeGenerator = new TypeGenerator();
  const expected = Type.Object({
    key: Type.Union([Type.String(), Type.Integer()]),
  });

  typeGenerator.addObject(MOCK_OBJECT1);
  typeGenerator.addObject(MOCK_OBJECT2);
  const secondResult = typeGenerator.produce();

  expect(secondResult).toEqualSchema(expected);
});

test(`Adding object which nested key will transform also the nested key`, () => {
  const typeGenerator = new TypeGenerator();
  const expected = Type.Object({
    key: Type.String(),
    nestedKey: Type.Optional(Type.Object({ key: Type.String() })),
  });

  typeGenerator.addObject(MOCK_OBJECT1);
  typeGenerator.addObject(MOCK_OBJECT5);
  const secondResult = typeGenerator.produce();

  expect(secondResult).toEqualSchema(expected);
});

test(`Adding object which nested key will transform also the nested key`, () => {
  const typeGenerator = new TypeGenerator();
  const expected = Type.Object({
    key: Type.Union([Type.String(), Type.Object({ key: Type.String() })]),
    optionalKey: Type.Optional(Type.Boolean()),
  });

  typeGenerator.addObject(MOCK_OBJECT1);
  typeGenerator.addObject(MOCK_OBJECT4);
  const secondResult = typeGenerator.produce();

  expect(secondResult).toEqualSchema(expected);
});

test(`Adding object which nested key will transform also the nested key`, () => {
  const typeGenerator = new TypeGenerator();
  const expected = Type.Object({
    key: Type.Union([Type.String(), Type.Boolean()]),
    optionalKey: Type.Optional(Type.Symbol()),
  });

  typeGenerator.addObject(MOCK_OBJECT1);
  typeGenerator.addObject(MOCK_OBJECT3);
  const secondResult = typeGenerator.produce();

  expect(secondResult).toEqualSchema(expected);
});

test(`Configurations will be propagated to nested objects [Object with nested object First]`, () => {
  const typeGenerator = new TypeGenerator({ literalKeys: ['key'] });
  const expected = Type.Object({
    key: Type.Union([
      Type.Literal('str'),
      Type.Object({ key: Type.Literal('nested str') }),
    ]),
    optionalKey: Type.Optional(Type.Boolean()),
  });

  typeGenerator.addObject(MOCK_OBJECT1);
  typeGenerator.addObject(MOCK_OBJECT4);
  const secondResult = typeGenerator.produce();

  expect(secondResult).toEqualSchema(expected);
});

test(`Configurations will be propagated to nested objects [Object with nested object Second]`, () => {
  const typeGenerator = new TypeGenerator({ literalKeys: ['key'] });
  const expected = Type.Object({
    key: Type.Union([
      Type.Literal('str'),
      Type.Object({ key: Type.Literal('nested str') }),
    ]),
    optionalKey: Type.Optional(Type.Boolean()),
  });

  typeGenerator.addObject(MOCK_OBJECT4);
  typeGenerator.addObject(MOCK_OBJECT1);
  const result = typeGenerator.produce();

  expect(result).toEqualSchema(expected);
});
