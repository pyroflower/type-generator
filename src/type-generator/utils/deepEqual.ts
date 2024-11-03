import isEqual from 'lodash/isequal';

export function deepEqual(a: unknown, b: unknown): boolean {
  // Handle arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    const sortedA = [...a].sort((x, y) => {
      const strX = JSON.stringify(x);
      const strY = JSON.stringify(y);
      return strX.localeCompare(strY);
    });
    const sortedB = [...b].sort((x, y) => {
      const strX = JSON.stringify(x);
      const strY = JSON.stringify(y);
      return strX.localeCompare(strY);
    });
    return sortedA.every((val, idx) => deepEqual(val, sortedB[idx]));
  }

  // Handle objects
  if (
    typeof a === 'object' &&
    a !== null &&
    typeof b === 'object' &&
    b !== null
  ) {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    return keysA.every((key) => {
      if (!(key in b)) return false;
      return deepEqual((a as any)[key], (b as any)[key]);
    });
  }

  // Handle primitives
  return isEqual(a, b);
}
