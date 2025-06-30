const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Tour My Holiday API',
      version: '1.0.0',
      description: 'A comprehensive API for tourism and holiday booking platform',
      contact: {
        name: 'API Support',
        email: 'support@tourmyholiday.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://api.tourmyholiday.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error message'
            },
            error: {
              type: 'object'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Operation successful'
            },
            data: {
              type: 'object'
            }
          }
        },
        Village: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            name: {
              type: 'string',
              example: 'Sample Village'
            },
            slug: {
              type: 'string',
              example: 'sample-village'
            },
            description: {
              type: 'string',
              example: 'A beautiful village description'
            },
            location: {
              type: 'string',
              example: 'Located in the mountains'
            },
            population: {
              type: 'integer',
              example: 5000
            },
            main_occupation: {
              type: 'string',
              example: 'Agriculture'
            },
            cultural_significance: {
              type: 'string',
              example: 'Rich cultural heritage'
            },
            attractions: {
              type: 'string',
              example: 'Temple, Lake, Mountains'
            },
            how_to_reach: {
              type: 'string',
              example: 'By road from nearest city'
            },
            best_time_to_visit: {
              type: 'string',
              example: 'March to June'
            },
            featured_image: {
              type: 'string',
              example: 'uploads/village-image.jpg'
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive'],
              example: 'active'
            },
            meta_title: {
              type: 'string',
              example: 'SEO Title'
            },
            meta_description: {
              type: 'string',
              example: 'SEO Description'
            },
            meta_keywords: {
              type: 'string',
              example: 'village, tourism, culture'
            },
            highlights: {
              type: 'string',
              example: 'Cultural heritage, Natural beauty'
            },
            state_id: {
              type: 'integer',
              example: 1
            },
            district_id: {
              type: 'integer',
              example: 1
            },
            subdistrict_id: {
              type: 'integer',
              example: 1
            },
            state_name: {
              type: 'string',
              example: 'Uttarakhand'
            },
            district_name: {
              type: 'string',
              example: 'Almora'
            },
            subdistrict_name: {
              type: 'string',
              example: 'Almora'
            },
            images: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: {
                    type: 'integer',
                    example: 1
                  },
                  image_path: {
                    type: 'string',
                    example: 'uploads/village-image.jpg'
                  },
                  display_order: {
                    type: 'integer',
                    example: 1
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  apis: [
    './routes/*.js',
    './controllers/*.js',
    './swagger.js'
  ]
};

const specs = swaggerJsdoc(options);

module.exports = specs; 