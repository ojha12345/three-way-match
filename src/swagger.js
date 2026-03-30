module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'Three-Way Match Backend API',
    version: '1.0.0',
    description: 'Upload PO, GRN, and Invoice documents, parse them with Gemini, and compute three-way match results.'
  },
  servers: [
   { url: 'http://127.0.0.1:6000' }
  ],
  paths: {
    '/health': {
      get: {
        summary: 'Health check',
        responses: { 200: { description: 'OK' } }
      }
    },
    '/documents/upload': {
      post: {
        summary: 'Upload and parse a document',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['file', 'documentType'],
                properties: {
                  file: { type: 'string', format: 'binary' },
                  documentType: { type: 'string', enum: ['po', 'grn', 'invoice'] }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Document parsed and stored' },
          400: { description: 'Bad request' },
          409: { description: 'Duplicate PO or duplicate document' }
        }
      }
    },
    '/documents/{id}': {
      get: {
        summary: 'Get a parsed document by id',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Document found' }, 404: { description: 'Document not found' } }
      }
    },
    '/match/{poNumber}': {
      get: {
        summary: 'Get latest match state for a PO number',
        parameters: [{ name: 'poNumber', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Match state found' }, 404: { description: 'No documents found' } }
      }
    }
  }
};
