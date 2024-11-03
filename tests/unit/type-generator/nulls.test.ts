import { expect } from '@jest/globals';
import 'expect-more-jest';
import 'jest-expect-message';
import { TypeGenerator } from '../../../src/type-generator/TypeGenerator';
import '../../__helpers__/customMatchers';
import { Type } from '@sinclair/typebox';

const TEST_FOCUS = 'null';

const KEY_VALUE = null;
const MOCK_OBJECT = { key: KEY_VALUE };

describe(`${TEST_FOCUS[0].toUpperCase()}${TEST_FOCUS.slice(1)}s`, () => {
  test(`TypeGenerator shall handle object key with ${TEST_FOCUS} value`, () => {
    const typeGenerator = new TypeGenerator();

    typeGenerator.addObject(MOCK_OBJECT);

    const result = Type.Object({
      key: Type.Null(),
    });

    expect(typeGenerator.produce()).toEqualSchema(result);
  });
});
