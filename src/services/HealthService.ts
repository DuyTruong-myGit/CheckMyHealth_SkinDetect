import { API_URL, getHeaders } from '../utils/api';

export const HealthService = {
  getHistory: async () => {
    try {
      const headers = await getHeaders();
      const response = await fetch(`${API_URL}/health/history`, {
        method: 'GET',
        headers: headers,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Lỗi lấy lịch sử');
      
      return data; 
    } catch (error) {
      console.error("Health History Error:", error);
      throw error;
    }
  }
};