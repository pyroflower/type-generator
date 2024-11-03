/* eslint-disable import/no-extraneous-dependencies */
import { expect } from '@jest/globals';
import { Kind, OptionalKind, TSchema } from '@sinclair/typebox';
import type { MatcherFunction } from 'expect';
import 'jest-expect-message';
import { getAjv } from './ajv';
import isEqual from 'lodash/isequal';
import sortBy from 'lodash/sortBy';

const toMatchSchema: MatcherFunction<
  [schemaDefinition: TSchema, options?: { message?: string }]
> =
  // `floor` and `ceiling` get types from the line above
  // it is recommended to type them as `unknown` and to validate the values
  function (actual, expected, options) {
    const validate = getAjv().compile(expected);

    const pass = validate(actual);
    if (pass) {
      return {
        message: () => `Object does not match schema.
Object:   ${this.utils.printReceived(actual)}
Error: ${validate.errors}
${options?.message ? `\nCustom message:${options.message}` : ''}`,
        pass: true,
      };
    }
    return {
      message: () => `Object does not match schema.
Object:   ${this.utils.printReceived(actual)}
Error: ${JSON.stringify(validate.errors)}
${options?.message ? `\nCustom message:${options.message}` : ''}`,
      pass: false,
    };
  };

const toEqualSchema: MatcherFunction<
  [schemaDefinition: TSchema, options?: { message?: string }]
> =
  // `floor` and `ceiling` get types from the line above
  // it is recommended to type them as `unknown` and to validate the values
  function (actual, expected, options) {
    const pass = deepEqual(actual, expected);

    // console.log(
    //   reduce(
    //     actual,
    //     function (result, value, key) {
    //       return isEqual(value, expected[key]) ? result : result.concat(key);
    //     },
    //     []
    //   )
    // );

    if (pass) {
      return {
        message: () => `Object matches schema.
Object:   ${this.utils.printReceived(actual)}
Error: ${expected}
${options?.message ? `\nCustom message:${options.message}` : ''}`,
        pass: true,
      };
    }
    return {
      message: () => `Object does not match schema.
Object:   ${this.utils.printReceived(actual)}
Error: ${this.utils.printReceived(expected)}
    -------
Diff: ${this.utils.diff(actual, expected)}
${options?.message ? `\nCustom message:${options.message}` : ''}`,
      pass: false,
    };
  };

expect.extend({
  toMatchSchema,
  toEqualSchema,
});

declare module 'expect' {
  interface AsymmetricMatchers {
    toMatchSchema(
      schemaDefinition: TSchema,
      options?: { message?: string }
    ): void;
    toEqualSchema(
      schemaDefinition: TSchema,
      options?: { message?: string }
    ): void;
  }
  interface Matchers<R> {
    toMatchSchema(schemaDefinition: TSchema, options?: { message?: string }): R;
    toEqualSchema(schemaDefinition: TSchema, options?: { message?: string }): R;
  }
}

function deepEqual(obj1, obj2) {
  if (obj1 === obj2)
    // it's just the same object. No need to compare.
    return true;

  if (isPrimitive(obj1) && isPrimitive(obj2))
    // compare primitives
    return obj1 === obj2;

  if (Object.keys(obj1).length !== Object.keys(obj2).length) return false;

  // Handle arrays - order doesn't matter
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (obj1.length !== obj2.length) return false;

    if (!isEqual(sortBy(obj1, ['type']), sortBy(obj2, ['type']))) return false;
    return true;
  }

  // compare objects with same number of keys
  for (let key in obj1) {
    if (!(key in obj2)) return false; //other object doesn't have this prop

    if (!deepEqual(obj1[key], obj2[key])) return false;
  }

  if (obj1[Kind] !== obj2[Kind]) return false;
  if (obj1[OptionalKind] !== obj2[OptionalKind]) return false;

  return true;
}

//check if value is primitive
function isPrimitive(obj) {
  return obj !== Object(obj);
}
