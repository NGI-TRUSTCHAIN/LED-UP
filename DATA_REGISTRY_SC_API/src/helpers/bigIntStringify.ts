export const stringifyBigInt = (data: any): any => {
  if (typeof data === 'bigint') {
    return Number(data);
  } else if (Array.isArray(data)) {
    return data.map((item) => stringifyBigInt(item));
  } else if (data !== null && typeof data === 'object') {
    return Object.fromEntries(Object.entries(data).map(([key, value]) => [key, stringifyBigInt(value)]));
  }
  return data;
};
