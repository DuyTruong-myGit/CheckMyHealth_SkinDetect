const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// -----------------------------------------------------------------
// BẮT ĐẦU SỬA LỖI
// -----------------------------------------------------------------
// Thêm 2 dòng này để file này tự đọc được file .env
// mà không cần phụ thuộc vào app.js
const path = require('path');
// Chỉ định đường dẫn .env ở thư mục gốc BE/
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') }); 

// Bây giờ process.env.PORT sẽ là '8000' (từ file .env)
const PORT = process.env.PORT || 8000; // Dùng 8000 làm dự phòng
// -----------------------------------------------------------------
// KẾT THÚC SỬA LỖI
// -----------------------------------------------------------------

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
        // -----------------------------------------------------------------
        // CẬP NHẬT SERVERS
        // -----------------------------------------------------------------
        servers: [
            {
                // Sửa thành PORT (đã được định nghĩa ở trên)
                url: `http://localhost:${PORT}`, 
                description: 'Development server (Local)'
            },
            {
                // Thêm server production (Render)
                // (Hãy thêm BACKEND_URL vào Environment Variables trên Render
                // với giá trị là https://checkmyhealth-skindetect.onrender.com)
                url: process.env.BACKEND_URL || 'https://checkmyhealth-skindetect.onrender.com',
                description: 'Production server (Render)'
            }
        ],
        // -----------------------------------------------------------------
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