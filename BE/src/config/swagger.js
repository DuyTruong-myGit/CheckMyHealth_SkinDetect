const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'CheckMyHealth Skin Detect API',
            version: '1.0.0',
            description: 'API documentation for Skin Disease Diagnosis System',
            contact: {
                name: 'API Support',
                email: 'support@checkmyhealth.com'
            }
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 3000}`,
                description: 'Development server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Nhập JWT token. Format: Bearer {token}'
                }
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        userId: {
                            type: 'integer',
                            description: 'ID của người dùng'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'Email của người dùng'
                        },
                        fullName: {
                            type: 'string',
                            description: 'Họ và tên'
                        },
                        role: {
                            type: 'string',
                            enum: ['user', 'admin'],
                            description: 'Vai trò của người dùng'
                        }
                    }
                },
                RegisterRequest: {
                    type: 'object',
                    required: ['email', 'password', 'fullName'],
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'Email đăng ký'
                        },
                        password: {
                            type: 'string',
                            format: 'password',
                            description: 'Mật khẩu'
                        },
                        fullName: {
                            type: 'string',
                            description: 'Họ và tên'
                        }
                    }
                },
                LoginRequest: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'Email đăng nhập'
                        },
                        password: {
                            type: 'string',
                            format: 'password',
                            description: 'Mật khẩu'
                        }
                    }
                },
                LoginResponse: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string',
                            example: 'Đăng nhập thành công!'
                        },
                        token: {
                            type: 'string',
                            description: 'JWT token'
                        },
                        user: {
                            $ref: '#/components/schemas/User'
                        }
                    }
                },
                DiagnosisRequest: {
                    type: 'object',
                    required: ['image'],
                    properties: {
                        image: {
                            type: 'string',
                            format: 'binary',
                            description: 'Hình ảnh da cần chẩn đoán'
                        }
                    }
                },
                DiagnosisResponse: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string'
                        },
                        diagnosis: {
                            type: 'object',
                            properties: {
                                disease: {
                                    type: 'string',
                                    description: 'Tên bệnh'
                                },
                                confidence: {
                                    type: 'number',
                                    description: 'Độ tin cậy (%)'
                                },
                                description: {
                                    type: 'string',
                                    description: 'Mô tả bệnh'
                                },
                                recommendations: {
                                    type: 'array',
                                    items: {
                                        type: 'string'
                                    },
                                    description: 'Khuyến nghị điều trị'
                                }
                            }
                        }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string',
                            description: 'Thông báo lỗi'
                        },
                        error: {
                            type: 'string',
                            description: 'Chi tiết lỗi'
                        }
                    }
                }
            }
        }
    },
    apis: ['./src/routes/*.js', './src/app.js'] // Đường dẫn đến các file chứa JSDoc comments
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = {
    swaggerUi,
    swaggerSpec
};

