import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../utils/api'; 

const SOCKET_URL = API_URL.replace('/api', ''); 

class SocketService {
    private socket: Socket | null = null;

    async connect() {
        const token = await AsyncStorage.getItem('USER_TOKEN');
        if (!token) return;
        if (this.socket?.connected) return;

        console.log('Socket: Connecting to', SOCKET_URL);

        this.socket = io(SOCKET_URL, {
            transports: ['polling', 'websocket'],
            auth: { token },
            autoConnect: true,
            reconnection: true, 
            reconnectionAttempts: 10,
            reconnectionDelay: 2000,
        });

        this.socket.on('connect', () => console.log('✅ Socket Connected! ID:', this.socket?.id));
        this.socket.on('disconnect', () => console.log('❌ Socket Disconnected'));
        this.socket.on('connect_error', (err) => console.log('⚠️ Socket Error:', err.message));
    }

    // --- CÁC HÀM GỬI DỮ LIỆU ---

    // 1. Gửi Realtime Sức khỏe (Gửi cả cụm 3 chỉ số)
    emitLiveHealth(data: { heartRate: number, spO2: number, stress: number }) {
        if (this.socket?.connected) {
            // Log ra terminal để bạn kiểm tra: "Health: 80 | 98 | 45"
            console.log(`💓 Health Send: HR:${data.heartRate} | SpO2:${data.spO2} | Stress:${data.stress}`);
            
            // Gửi nguyên object data chứa cả 3 chỉ số
            this.socket.emit('watch:live:health', data);
        }
    }

    // 2. Gửi Realtime Luyện tập (Gửi cả cụm 3 chỉ số)
    emitLiveWorkout(data: { steps: number, calories: number, duration: number }) {
        if (this.socket?.connected) {
            // Log ra terminal: "Workout: 120 bước | 5 kcal | 10s"
            console.log(`🏃 Workout Send: Steps:${data.steps} | Cal:${data.calories} | Time:${data.duration}`);
            
            this.socket.emit('watch:live:workout', data);
        }
    }

    // 3. Gửi Lưu trữ (Khi bấm Dừng)
    sendMeasurement(data: any) {
        if (!this.socket?.connected) return false;
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