import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../utils/api';
import { StorageService } from '../utils/StorageService';
import SocketService from './SocketService'; // [MỚI] Import SocketService

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
  created_at?: string;
  isSynced?: boolean; 
}

const formatDate = (dateInput: string | number) => {
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return 'Mới đo';

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${hours}:${minutes} - ${day}/${month}`;
  } catch (e) {
    return 'Mới đo';
  }
};

const parseDurationToSeconds = (durationStr?: string) => {
    if (!durationStr) return 0;
    try {
        const parts = durationStr.split(':');
        if (parts.length === 2) {
            return Number(parts[0]) * 60 + Number(parts[1]);
        }
    } catch (e) { return 0; }
    return 0;
};

const formatSecondsToDisplay = (totalSeconds: number) => {
    if (totalSeconds <= 0) return '--';
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) return `${h}h ${m}p`;
    return `${m}p ${s}s`;
};

export const DataService = {
  
  getRecords: async (): Promise<HealthRecord[]> => {
    try {
      const response = await fetch(`${API_URL}/watch/measurements`);
      const rawData = await response.json();
      
      if (Array.isArray(rawData)) {
          const mappedData = rawData.map((item: any) => ({
              ...item,
              id: item.id ? item.id.toString() : Math.random().toString(),
              type: item.type ? item.type.toUpperCase() : 'HEALTH',
              heartRate: Number(item.heart_rate || item.heartRate || 0),
              spO2: Number(item.spo2 || item.spO2 || 0),
              stress: Number(item.stress || 0),
              steps: Number(item.steps || 0),
              calories: Number(item.calories || 0),
              duration: item.duration || '00:00',
              timestamp: (item.timestamp && item.timestamp.includes('/')) 
                         ? item.timestamp 
                         : formatDate(item.created_at || item.createdDate || Number(item.timestamp))
          }));

          const finalData = await StorageService.syncServerData(mappedData);
          return finalData;
      }
      return await StorageService.getLocalHistory();
    } catch (error) {
      console.log("Offline mode: Dùng dữ liệu máy.", error);
      return await StorageService.getLocalHistory();
    }
  },

  // [LOGIC MỚI] Gửi qua Socket hoặc HTTP
  addRecord: async (record: HealthRecord) => {
    const now = new Date();
    const newRecord = {
        ...record,
        id: Date.now().toString(),
        createdDate: now.toISOString(),
        created_at: now.toISOString(),
        isSynced: false
    };

    // 1. Luôn lưu Offline trước
    await StorageService.saveToStorage(newRecord);

    // 2. Thử gửi
    try {
      const token = await AsyncStorage.getItem('USER_TOKEN');
      if (token) {
          // [ƯU TIÊN] Thử gửi bằng Socket trước
          const sentBySocket = SocketService.sendMeasurement(newRecord);

          if (sentBySocket) {
              console.log("🚀 Đã gửi dữ liệu qua Socket!");
              await StorageService.markAsSynced(newRecord.id);
          } else {
              // [FALLBACK] Nếu Socket chưa kết nối, dùng HTTP truyền thống
              console.log("⚠️ Socket chưa sẵn sàng, chuyển sang dùng HTTP...");
              const response = await fetch(`${API_URL}/watch/measurements`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newRecord),
              });

              if (response.ok) {
                  console.log("✅ Gửi HTTP thành công!");
                  await StorageService.markAsSynced(newRecord.id);
              } else {
                  console.log("❌ Gửi HTTP thất bại, để dành sync sau.");
              }
          }
      }
    } catch (error) {
      console.log("Offline: Dữ liệu đã lưu an toàn trong máy.");
    }
  },

  calculateDailyStats: (records: any[], targetDate: Date) => {
    const targetDay = targetDate.getDate();
    const targetMonth = targetDate.getMonth() + 1;
    
    const dailyRecords = records.filter(r => {
      try {
        if (r.timestamp && r.timestamp.includes('/')) {
             const parts = r.timestamp.split(' - '); 
             if (parts.length > 1) {
                 const datePart = parts[1].split('/'); 
                 return Number(datePart[0]) === targetDay && Number(datePart[1]) === targetMonth;
             }
        }
        const dateStr = r.created_at || r.createdDate;
        if (dateStr) {
            const rDate = new Date(dateStr);
            return rDate.getDate() === targetDay && (rDate.getMonth() + 1) === targetMonth;
        }
      } catch (e) { return false; }
      return false;
    });

    const healthRecords = dailyRecords.filter(r => r.type === 'HEALTH');
    const workoutRecords = dailyRecords.filter(r => r.type === 'WORKOUT');

    let avgHeartRate = 0, avgSpO2 = 0, avgStress = 0;
    if (healthRecords.length > 0) {
      const totalHR = healthRecords.reduce((sum, r) => sum + (Number(r.heartRate) || 0), 0);
      const totalSpO2 = healthRecords.reduce((sum, r) => sum + (Number(r.spO2) || 0), 0);
      const totalStress = healthRecords.reduce((sum, r) => sum + (Number(r.stress) || 0), 0);

      avgHeartRate = Math.round(totalHR / healthRecords.length);
      avgSpO2 = Math.round(totalSpO2 / healthRecords.length);
      avgStress = Math.round(totalStress / healthRecords.length);
    }

    let totalSteps = 0, totalCalories = 0, totalDurationSec = 0;
    if (workoutRecords.length > 0) {
        totalSteps = workoutRecords.reduce((sum, r) => sum + (Number(r.steps) || 0), 0);
        totalCalories = workoutRecords.reduce((sum, r) => sum + (Number(r.calories) || 0), 0);
        totalDurationSec = workoutRecords.reduce((sum, r) => sum + parseDurationToSeconds(r.duration), 0);
    }

    return { 
        avgHeartRate, avgSpO2, avgStress, 
        totalSteps, totalCalories, 
        totalDurationSec,
        totalDurationDisplay: formatSecondsToDisplay(totalDurationSec),
        hasData: healthRecords.length > 0 || workoutRecords.length > 0 
    };
  },

  evaluateHealth: (currentStats: any, prevStats: any) => {
    if (!currentStats?.hasData) return { status: 'NO_DATA', msg: 'Chưa có dữ liệu' };

    let warnings = [];
    if (prevStats?.hasData && prevStats.avgHeartRate > 0) {
        const diff = Math.abs(currentStats.avgHeartRate - prevStats.avgHeartRate);
        if (diff > 15) warnings.push('Nhịp tim biến động mạnh');
    }
    if (currentStats.avgHeartRate > 100) warnings.push('Nhịp tim TB cao');
    if (currentStats.avgSpO2 > 0 && currentStats.avgSpO2 < 95) warnings.push('Oxy máu thấp');
    if (currentStats.avgStress > 70) warnings.push('Căng thẳng cao');

    return warnings.length > 0 
        ? { status: 'UNSTABLE', msg: warnings[0] } 
        : { status: 'STABLE', msg: 'Sức khỏe ổn định' };
  }
};