/**
 * Recursively converts BigInt values in the given data structure to Number.
 *
 * This function traverses the provided data, checking for BigInt types and converting
 * them to Numbers. It handles arrays and objects, applying the conversion to each element
 * or property. If the data contains other types, they are returned unchanged.
 *
 * @param {any} data - The data to be processed, which may contain BigInt values.
 *
 * @returns {any} The processed data with all BigInt values converted to Number.
 *
 * @example
 * const input = { big: BigInt(123), arr: [BigInt(456), 789] };
 * const output = stringifyBigInt(input);
 * console.log(output); // Output: { big: 123, arr: [456, 789] }
 */
export const stringifyBigInt = (data: any): any => {
  if (typeof data === 'bigint') {
    return Number(data);
  } else if (Array.isArray(data)) {
    return data.map(item => stringifyBigInt(item));
  } else if (data !== null && typeof data === 'object') {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, stringifyBigInt(value)])
    );
  }
  return data;
};
