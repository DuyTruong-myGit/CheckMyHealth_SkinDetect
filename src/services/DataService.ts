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
  createdDate?: string; 
}

const API_URL = 'http://192.168.1.2:3000/api/measurements';

export const DataService = {
  
  getRecords: async (): Promise<HealthRecord[]> => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      return data;
    } catch (error) {
      console.log("Lỗi lấy dữ liệu:", error);
      return [];
    }
  },

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
          duration: record.duration || '',
          createdDate: new Date().toISOString() 
        }),
      });
    } catch (error) {
      console.log("Lỗi lưu:", error);
    }
  },

  // --- LOGIC TÍNH TOÁN ---
  calculateDailyStats: (records: any[], targetDate: Date) => {
    const targetDay = targetDate.getDate();
    const targetMonth = targetDate.getMonth() + 1;
    
    const dailyRecords = records.filter(r => {
      if (r.created_at) {
        const rDate = new Date(r.created_at);
        return rDate.getDate() === targetDay && (rDate.getMonth() + 1) === targetMonth;
      }
      if (r.timestamp && r.timestamp.includes('/')) {
         const parts = r.timestamp.split(' - '); 
         if (parts.length > 1) {
             const datePart = parts[1].split('/'); 
             return Number(datePart[0]) === targetDay && Number(datePart[1]) === targetMonth;
         }
      }
      return false;
    });

    const healthRecords = dailyRecords.filter(r => r.type === 'HEALTH');
    const workoutRecords = dailyRecords.filter(r => r.type === 'WORKOUT');

    // 1. Sức khỏe
    let avgHeartRate = 0;
    let avgSpO2 = 0;
    let avgStress = 0;

    if (healthRecords.length > 0) {
      const totalHR = healthRecords.reduce((sum, r) => sum + (Number(r.heartRate) || 0), 0);
      const totalSpO2 = healthRecords.reduce((sum, r) => sum + (Number(r.spO2) || 0), 0);
      const totalStress = healthRecords.reduce((sum, r) => sum + (Number(r.stress) || 0), 0);

      avgHeartRate = Math.round(totalHR / healthRecords.length);
      avgSpO2 = Math.round(totalSpO2 / healthRecords.length);
      avgStress = Math.round(totalStress / healthRecords.length);
    }

    // 2. Luyện tập (Tính trung bình Bước chân & Calo)
    let avgSteps = 0;
    let avgCalories = 0; // Thêm biến Calo

    if (workoutRecords.length > 0) {
        const totalSteps = workoutRecords.reduce((sum, r) => sum + (Number(r.steps) || 0), 0);
        const totalCalories = workoutRecords.reduce((sum, r) => sum + (Number(r.calories) || 0), 0);
        
        avgSteps = Math.round(totalSteps / workoutRecords.length);
        avgCalories = Math.round(totalCalories / workoutRecords.length);
    }

    return {
      avgHeartRate,
      avgSpO2,
      avgStress,
      avgSteps,
      avgCalories, // Trả về Calo
      hasData: healthRecords.length > 0 || workoutRecords.length > 0
    };
  },

  evaluateHealth: (currentStats: any, prevStats: any) => {
    if (!currentStats.hasData) return { status: 'NO_DATA', msg: 'Chưa có dữ liệu hôm nay' };

    let warnings = [];
    if (prevStats.hasData && prevStats.avgHeartRate > 0) {
        const diff = Math.abs(currentStats.avgHeartRate - prevStats.avgHeartRate);
        if (diff > 15) warnings.push('Nhịp tim biến động mạnh');
    }
    if (currentStats.avgHeartRate > 100) warnings.push('Nhịp tim TB cao');
    if (currentStats.avgSpO2 > 0 && currentStats.avgSpO2 < 95) warnings.push('Oxy máu thấp');
    if (currentStats.avgStress > 70) warnings.push('Căng thẳng cao');

    if (warnings.length > 0) {
        return { status: 'UNSTABLE', msg: warnings[0] }; 
    } else {
        return { status: 'STABLE', msg: 'Sức khỏe ổn định' };
    }
  }
};