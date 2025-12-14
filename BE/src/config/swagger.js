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
                // Socket.IO Events Documentation
                SocketConnection: {
                    type: 'object',
                    description: 'WebSocket connection information',
                    properties: {
                        url: {
                            type: 'string',
                            example: 'ws://localhost:8000',
                            description: 'WebSocket server URL'
                        },
                        authentication: {
                            type: 'object',
                            properties: {
                                method: {
                                    type: 'string',
                                    example: 'JWT Token'
                                },
                                location: {
                                    type: 'string',
                                    example: 'socket.handshake.auth.token'
                                }
                            }
                        }
                    }
                },
                WatchMeasurement: {
                    type: 'object',
                    description: 'Watch measurement data sent from Watch App to Server',
                    properties: {
                        heartRate: {
                            type: 'integer',
                            example: 75,
                            description: 'Heart rate in bpm (optional)'
                        },
                        spO2: {
                            type: 'integer',
                            example: 98,
                            description: 'Blood oxygen level in % (optional)'
                        },
                        stress: {
                            type: 'integer',
                            example: 25,
                            description: 'Stress level 0-100 (optional)'
                        },
                        steps: {
                            type: 'integer',
                            example: 5000,
                            description: 'Step count (optional)'
                        },
                        calories: {
                            type: 'integer',
                            example: 200,
                            description: 'Calories burned (optional)'
                        },
                        duration: {
                            type: 'string',
                            example: '30:00',
                            description: 'Duration in MM:SS format (optional)'
                        },
                        type: {
                            type: 'string',
                            enum: ['manual', 'exercise', 'sleep'],
                            example: 'exercise',
                            description: 'Measurement type (optional)'
                        }
                    }
                },
                WatchMeasurementAck: {
                    type: 'object',
                    description: 'Acknowledgment response from Server to Watch',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: true
                        },
                        id: {
                            type: 'integer',
                            example: 123,
                            description: 'Database record ID'
                        },
                        timestamp: {
                            type: 'string',
                            format: 'date-time',
                            example: '2025-12-13T15:00:00.000Z'
                        }
                    }
                },
                WatchUpdate: {
                    type: 'object',
                    description: 'Broadcast message to all user devices when new measurement received',
                    properties: {
                        id: {
                            type: 'integer',
                            example: 123
                        },
                        userId: {
                            type: 'integer',
                            example: 456
                        },
                        heartRate: {
                            type: 'integer',
                            example: 75
                        },
                        spO2: {
                            type: 'integer',
                            example: 98
                        },
                        stress: {
                            type: 'integer',
                            example: 25
                        },
                        steps: {
                            type: 'integer',
                            example: 5000
                        },
                        calories: {
                            type: 'integer',
                            example: 200
                        },
                        duration: {
                            type: 'string',
                            example: '30:00'
                        },
                        type: {
                            type: 'string',
                            example: 'exercise'
                        },
                        timestamp: {
                            type: 'string',
                            format: 'date-time'
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
            },
            // Thêm tag cho Socket.IO
            tags: [
                {
                    name: 'WebSocket',
                    description: 'Real-time communication via Socket.IO',
                    externalDocs: {
                        description: 'Socket.IO Documentation',
                        url: 'https://socket.io/docs/v4/'
                    }
                }
            ]
        },
        // Thêm WebSocket events documentation
        paths: {
            '/socket.io': {
                get: {
                    tags: ['WebSocket'],
                    summary: 'WebSocket Connection Endpoint',
                    description: `
## 🔌 Socket.IO Events Documentation

### Connection
**URL**: \`ws://localhost:8000\` (Development)  
**Authentication**: JWT Token via \`socket.handshake.auth.token\`

### Events

#### 1️⃣ watch:measurement (Client → Server)
Watch App gửi dữ liệu đo lường.

**Emit**: Watch App  
**Payload**: WatchMeasurement schema  
**Response**: watch:measurement:ack

#### 2️⃣ watch:measurement:ack (Server → Client)
Server xác nhận đã lưu measurement.

**Received by**: Watch App  
**Payload**: WatchMeasurementAck schema

#### 3️⃣ watch:update (Server → All Devices)
Server broadcast measurement mới đến tất cả devices của user.

**Received by**: Mobile App, Watch App  
**Payload**: WatchUpdate schema

#### 4️⃣ phone:requestLatest (Client → Server)
Mobile App yêu cầu measurement mới nhất.

**Emit**: Mobile App  
**Response**: phone:latestData

#### 5️⃣ phone:latestData (Server → Client)
Server trả về measurement mới nhất.

**Received by**: Mobile App  
**Payload**: Latest measurement record hoặc null

#### 6️⃣ ping/pong
Heartbeat để maintain connection.

### Example Integration

\`\`\`javascript
const socket = io('http://localhost:8000', {
    auth: { token: 'your-jwt-token' }
});

socket.on('connect', () => {
    console.log('Connected to WebSocket');
});

// Watch App: Send measurement
socket.emit('watch:measurement', {
    heartRate: 75,
    spO2: 98,
    type: 'exercise'
});

// Mobile App: Listen for updates
socket.on('watch:update', (data) => {
    console.log('New measurement:', data);
});
\`\`\`

**For full API documentation**, see: socket_api_docs.md
                    `,
                    responses: {
                        '101': {
                            description: 'Switching Protocols to WebSocket'
                        },
                        '401': {
                            description: 'Authentication error - Invalid JWT token'
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