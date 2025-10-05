import swaggerJsdoc from 'swagger-jsdoc';
import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';

export function setupSwagger(app: Express) {
  const options = {
    definition: {
      openapi: '3.0.3',
      info: { title: 'Đà Lạt Travel API', version: '1.0.0' },
      servers: [{ url: 'http://localhost:3000' }],
      components: {
        securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
      },
      security: [{ bearerAuth: [] }],
    },
    apis: ['src/routes/*.ts'], // đọc JSDoc trong các route
  };
  const specs = swaggerJsdoc(options);
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs));
}
