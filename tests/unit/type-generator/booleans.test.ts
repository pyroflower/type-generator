import { expect } from '@jest/globals';
import 'expect-more-jest';
import 'jest-expect-message';
import { TypeGenerator } from '../../../src/type-generator/TypeGenerator';
import '../../__helpers__/customMatchers';
import { Type } from '@sinclair/typebox';

const TEST_FOCUS = 'boolean';

const KEY_VALUE = true;
const MOCK_OBJECT = { key: KEY_VALUE };
const CONFIG_WITH_LITERAL_KEY = { literalKeys: ['key'] };

describe(`${TEST_FOCUS[0].toUpperCase()}${TEST_FOCUS.slice(1)}s`, () => {
  test(`TypeGenerator shall handle object key with ${TEST_FOCUS} value`, () => {
    const typeGenerator = new TypeGenerator();

    typeGenerator.addObject(MOCK_OBJECT);

    const result = Type.Object({
      key: Type.Boolean(),
    });

    expect(typeGenerator.produce()).toEqualSchema(result);
  });

  test(`TypeGenerator shall handle object key with ${TEST_FOCUS} literal value`, () => {
    const typeGeneratorUsingLiteral = new TypeGenerator(
      CONFIG_WITH_LITERAL_KEY
    );
    typeGeneratorUsingLiteral.addObject(MOCK_OBJECT);

    const result = Type.Object({
      key: Type.Literal(KEY_VALUE),
    });

    expect(typeGeneratorUsingLiteral.produce()).toEqualSchema(result);
  });
});
