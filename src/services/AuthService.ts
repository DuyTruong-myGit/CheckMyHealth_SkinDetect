import { API_URL, getHeaders } from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthService = {
  // 1. Đăng nhập để lấy Token
  login: async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Đăng nhập thất bại');

      // Lưu Token quan trọng này lại
      if (data.token) {
        await AsyncStorage.setItem('USER_TOKEN', data.token);
        // Lưu thêm thông tin user nếu cần
        if (data.user) {
          await AsyncStorage.setItem('USER_INFO', JSON.stringify(data.user));
        }
      }
      return data;
    } catch (error) {
      throw error;
    }
  },

  // 2. Lấy thông tin Profile (Tên, Avatar...)
  getProfile: async () => {
    try {
      const headers = await getHeaders();
      const response = await fetch(`${API_URL}/profile`, { // Route này khớp với BE của bạn
        method: 'GET',
        headers: headers,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Lỗi lấy hồ sơ');
      
      return data;
    } catch (error) {
      console.log("Get Profile Error:", error);
      return null;
    }
  }
};