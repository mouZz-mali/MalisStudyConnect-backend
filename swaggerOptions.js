// swaggerOptions.js
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MaliStudyConnect API',
      version: '1.0.0',
      description: 'API pour la plateforme d’étude collaborative MaliStudyConnect',
    },
    servers: [
      { url: 'https://malisstudyconnect-backend.onrender.com/api' },
    ],
  },
  apis: ['./routes/*.js'],
};

module.exports = options;