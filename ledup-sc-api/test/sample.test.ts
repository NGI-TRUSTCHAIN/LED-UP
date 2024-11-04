import { InvocationContext, HttpRequest } from '@azure/functions';
import sample from '../src/functions/sample';

describe('sample', () => {
  let context: InvocationContext;
  beforeEach(() => {
    context = { log: jest.fn() } as unknown as InvocationContext;
  });

  it('should return a 200', async () => {
    // Arrange
    const request = {} as HttpRequest;

    // Action
    const res = await sample(request, context);

    // Assertion
    expect(context.log).toHaveBeenCalledTimes(1);
    expect(res.status).toEqual(200);
  });
});
