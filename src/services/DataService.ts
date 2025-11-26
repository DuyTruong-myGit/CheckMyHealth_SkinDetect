// src/services/DataService.ts

export interface HealthRecord {
  id?: string;
  type: 'HEALTH' | 'WORKOUT';
  date?: string; 
  timestamp: string;
  heartRate?: number;
  spO2?: number;
  stress?: number;
  steps?: number;
  calories?: number;
  duration?: string;
}

// CẬP NHẬT IP MỚI TỪ HÌNH ẢNH CỦA BẠN (192.168.1.2)
const API_URL = 'http://192.168.1.2:3000/api/measurements';

export const DataService = {
  
  // Lấy dữ liệu từ Database
  getRecords: async (): Promise<HealthRecord[]> => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      return data;
    } catch (error) {
      console.log("Lỗi lấy dữ liệu (Check Server):", error);
      return [];
    }
  },

  // Gửi dữ liệu lên Database
  addRecord: async (record: HealthRecord) => {
    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: record.type,
          heartRate: Number(record.heartRate) || 0,
          spO2: Number(record.spO2) || 0,
          stress: Number(record.stress) || 0,
          steps: Number(record.steps) || 0,
          calories: Number(record.calories) || 0,
          duration: record.duration || ''
        }),
      });
      console.log("Đã lưu lên Server!");
    } catch (error) {
      console.log("Lỗi lưu:", error);
    }
  },

  // Thuật toán tính toán trung bình
  calculateDailyStats: (records: HealthRecord[], date: Date) => {
    const targetRecords = records.filter(r => {
      const rDate = new Date(r.date || new Date());
      return (
        rDate.getDate() === date.getDate() &&
        rDate.getMonth() === date.getMonth() &&
        rDate.getFullYear() === date.getFullYear()
      );
    });

    const healths = targetRecords.filter(r => r.type === 'HEALTH');
    const workouts = targetRecords.filter(r => r.type === 'WORKOUT');

    const avgHeartRate = healths.length > 0 
      ? Math.round(healths.reduce((sum, r) => sum + (Number(r.heartRate) || 0), 0) / healths.length) 
      : 0;

    const totalSteps = workouts.reduce((sum, r) => sum + (Number(r.steps) || 0), 0);

    return { avgHeartRate, totalSteps };
  }
};