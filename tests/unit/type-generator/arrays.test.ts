import { expect } from '@jest/globals';
import 'expect-more-jest';
import 'jest-expect-message';
import { TypeGenerator } from '../../../src/type-generator/TypeGenerator';
import '../../__helpers__/customMatchers';
import { Type } from '@sinclair/typebox';

const ARRAY = 'array';

const STRING_VALUE = 'str';
const KEY_VALUE = [];
const MOCK_OBJECT = { key: KEY_VALUE };
const MOCK_OBJECT_STRING_ARRAY = { key: [STRING_VALUE] };

describe(`${ARRAY[0].toUpperCase()}${ARRAY.slice(1)}s`, () => {
  test(`When given an object with a key whose value is an empty ${ARRAY}, TypeGenerator shall translate the key to an array of Type.Unknown().`, () => {
    const typeGenerator = new TypeGenerator();

    typeGenerator.addObject(MOCK_OBJECT);

    const result = Type.Object({
      key: Type.Array(Type.Unknown()),
    });

    expect(typeGenerator.produce()).toEqualSchema(result);
  });

  test(`When given an object with a key whose value is an ${ARRAY} containing string(s), TypeGenerator shall translate the key to an array of Type.String().`, () => {
    const typeGenerator = new TypeGenerator();
    const typeGeneratorMultiple = new TypeGenerator();

    typeGenerator.addObject(MOCK_OBJECT_STRING_ARRAY);
    typeGeneratorMultiple.addObject({
      key: ['str1', 'str2', 'str3', 'str4', 'str5', 'str6'],
    });

    const result = Type.Object({
      key: Type.Array(Type.String()),
    });

    expect(typeGenerator.produce()).toEqualSchema(result);
    expect(typeGeneratorMultiple.produce()).toEqualSchema(result);
  });

  // test(`When TypeGenerator has configured a key to result in literal type, and that key contains an ${ARRAY}, the result will be an ${ARRAY} of the literal values inside the ${ARRAY}.`, () => {
  //   const typeGenerator = new TypeGenerator({literalKeys: ['key']});

  //   typeGenerator.addObject(MOCK_OBJECT_STRING_ARRAY);

  //   const result = Type.Object({
  //     key: Type.Array(Type.Literal(STRING_VALUE)),
  //   });
  //   console.log(typeGenerator.produce())

  //   expect(typeGenerator.produce()).toEqualSchema(result);
  // });
});
