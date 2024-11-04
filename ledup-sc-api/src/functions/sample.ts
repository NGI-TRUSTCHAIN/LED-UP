import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

export default async function handler(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);

  return {
    status: 200,
    jsonBody: { message: 'Hello, World!' },
  };
}

/**
 * HTTP route configuration for the Azure Function to share data.
 */
app.http('sample', {
  methods: ['GET'], // Specifies that this function responds to POST requests
  route: 'sample', // Defines the route for the function
  authLevel: 'anonymous', // Sets the authentication level for the function
  handler, // Sets the handler function to process requests
});
