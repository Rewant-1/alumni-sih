const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Alumni Management System API',
      version: '1.0.0',
      description: 'API documentation for the Alumni Management System - connecting alumni, students, and institutions',
      contact: {
        name: 'API Support',
        email: 'support@alumni-system.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000/api/v1',
        description: 'Development server'
      },
      {
        url: 'https://api.alumni-system.com/api/v1',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token'
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
              type: 'string',
              example: 'Detailed error information'
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
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            email: {
              type: 'string',
              example: 'user@example.com'
            },
            userType: {
              type: 'string',
              enum: ['Alumni', 'Student'],
              example: 'Alumni'
            },
            collegeId: {
              type: 'string',
              example: 'COL12345'
            },
            isVerified: {
              type: 'boolean',
              example: true
            }
          }
        },
        Alumni: {
          type: 'object',
          properties: {
            _id: {
              type: 'string'
            },
            userId: {
              type: 'string',
              description: 'Reference to User'
            },
            verified: {
              type: 'boolean',
              example: true
            },
            graduationYear: {
              type: 'number',
              example: 2020
            },
            department: {
              type: 'string',
              example: 'Computer Science'
            },
            bio: {
              type: 'string',
              example: 'Software Engineer at Tech Corp'
            },
            headline: {
              type: 'string',
              example: 'Full Stack Developer'
            },
            skills: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['JavaScript', 'React', 'Node.js']
            },
            experience: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  company: { type: 'string' },
                  position: { type: 'string' },
                  startDate: { type: 'string', format: 'date' },
                  endDate: { type: 'string', format: 'date' },
                  description: { type: 'string' }
                }
              }
            }
          }
        },
        Event: {
          type: 'object',
          properties: {
            _id: {
              type: 'string'
            },
            title: {
              type: 'string',
              example: 'Alumni Meetup 2024'
            },
            description: {
              type: 'string'
            },
            date: {
              type: 'string',
              format: 'date-time'
            },
            location: {
              type: 'string',
              example: 'Main Campus Auditorium'
            },
            organizer: {
              type: 'string',
              description: 'Reference to User'
            },
            attendees: {
              type: 'array',
              items: {
                type: 'string'
              }
            },
            maxAttendees: {
              type: 'number',
              example: 100
            }
          }
        },
        Job: {
          type: 'object',
          properties: {
            _id: {
              type: 'string'
            },
            title: {
              type: 'string',
              example: 'Senior Software Engineer'
            },
            company: {
              type: 'string',
              example: 'Tech Corp'
            },
            description: {
              type: 'string'
            },
            requirements: {
              type: 'array',
              items: {
                type: 'string'
              }
            },
            salary: {
              type: 'object',
              properties: {
                min: { type: 'number' },
                max: { type: 'number' },
                currency: { type: 'string', example: 'USD' }
              }
            },
            location: {
              type: 'string',
              example: 'Remote'
            },
            postedBy: {
              type: 'string',
              description: 'Reference to Alumni'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.js', './src/controller/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  swaggerSpec
};
