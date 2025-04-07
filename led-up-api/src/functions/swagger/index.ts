// import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
// const fs = require('fs');
// const path = require('path');

// const handler = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
//   context.log(`Http function processed request for url "${request.url}"`);

//   const requestedFile = request.params.file || 'index.html';
//   const filePath = path.join(__dirname, '../../../api-docs', requestedFile);

//   try {
//     const fileContent = fs.readFileSync(filePath);

//     const ext = path.extname(filePath).toLowerCase();
//     let contentType = 'text/html';

//     if (ext === '.yaml' || ext === '.yml') {
//       contentType = 'application/x-yaml';
//     } else if (ext === '.json') {
//       contentType = 'application/json';
//     }

//     return {
//       status: 200,
//       headers: {
//         'Content-Type': contentType,
//         'Access-Control-Allow-Origin': '*', // Allow any origin
//         'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
//         'Access-Control-Allow-Headers': 'Content-Type',
//       },
//       body: fileContent,
//     };
//   } catch (error: any) {
//     context.log(`Error fetching data: ${error}`);
//     return {
//       status: 500,
//       jsonBody: {
//         error: error.message,
//         message: 'Failed to retrieve file',
//       },
//     };
//   }
// };

// app.http('SwaggerUI', {
//   methods: ['GET'],
//   route: 'docs/{file?}',
//   authLevel: 'anonymous',
//   handler,
// });
