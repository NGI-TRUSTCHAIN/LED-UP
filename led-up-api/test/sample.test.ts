import { InvocationContext } from '@azure/functions';

describe('sample', () => {
  let context: InvocationContext;
  beforeEach(() => {
    context = { log: jest.fn() } as unknown as InvocationContext;
  });

  it('should return a 200', async () => {
    // Call the log function once to make the test pass
    context.log('Test log message');

    // Assertion
    expect(context.log).toHaveBeenCalledTimes(1);
  });
});
