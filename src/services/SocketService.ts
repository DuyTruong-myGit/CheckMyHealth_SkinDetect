import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../utils/api'; 
// import { Buffer } from 'buffer'; // Nếu cần thiết, nhưng thường React Native có sẵn atob hoặc dùng cách dưới

const SOCKET_URL = API_URL.replace('/api', ''); 

class SocketService {
    private socket: Socket | null = null;

    // [MỚI] Hàm giải mã Token để lấy User ID (Không cần thư viện ngoài)
    private parseJwt(token: string) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            return JSON.parse(jsonPayload);
        } catch (e) {
            return null;
        }
    };

    async connect() {
        const token = await AsyncStorage.getItem('USER_TOKEN');
        if (!token) {
            console.log('❌ Chưa có Token -> Chưa đăng nhập');
            return;
        }

        // [MỚI] Giải mã và in User ID ra Log
        const userData = this.parseJwt(token);
        if (userData && userData.userId) { // Hoặc userData.id tùy cấu trúc token của bạn
            console.log('🔑 Đang kết nối với User ID:', userData.userId || userData.id);
        } else {
            console.log('⚠️ Token không hợp lệ hoặc không chứa User ID');
        }

        if (this.socket?.connected) return;

        console.log('Socket: Connecting to', SOCKET_URL);

        this.socket = io(SOCKET_URL, {
            transports: ['websocket'], 
            auth: { token },
            autoConnect: true,
            reconnection: true,
            reconnectionDelay: 1000,
        });

        this.socket.on('connect', () => console.log('✅ Socket Connected! ID:', this.socket?.id));
        this.socket.on('disconnect', () => console.log('❌ Socket Disconnected'));
        this.socket.on('connect_error', (err) => console.log('⚠️ Socket Error:', err.message));
    }

    // ... (Giữ nguyên các hàm emitLiveHealth, emitLiveWorkout, sendMeasurement như cũ)
    
    // 1. Gửi Realtime Sức khỏe
    emitLiveHealth(data: any) {
        if (this.socket?.connected) {
            console.log(`💓 Stream Health: HR:${data.heartRate} | SpO2:${data.spO2}`);
            this.socket.emit('watch:live:health', data);
        }
    }

    // 2. Gửi Realtime Luyện tập
    emitLiveWorkout(data: any) {
        if (this.socket?.connected) {
            console.log(`🏃 Stream Workout: Steps:${data.steps}`);
            this.socket.emit('watch:live:workout', data);
        }
    }

    // 3. Gửi Lưu trữ
    sendMeasurement(data: any) {
        if (!this.socket?.connected) return false;
        console.log('💾 Sending to Save DB...');
        this.socket.emit('watch:measurement', data);
        return true; 
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
}

export default new SocketService();