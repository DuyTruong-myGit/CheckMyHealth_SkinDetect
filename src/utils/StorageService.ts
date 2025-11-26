import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'HEALTH_HISTORY';

// Định nghĩa kiểu dữ liệu tổng hợp cho cả 2 loại
export interface HealthSession {
  id: string;
  type: 'MEASURE' | 'DIAGNOSIS'; // Phân loại
  
  // Dữ liệu đo sức khỏe (Có thể undefined nếu là Diagnosis)
  heartRate?: number;
  spO2?: number;
  stress?: number;
  
  // Dữ liệu chẩn đoán (Có thể undefined nếu là Measure)
  diagnosisResult?: string;
  confidence?: string;
  
  timestamp: number;
  isSynced: boolean;
}

export const StorageService = {
  // 1. Hàm lưu cho màn hình ĐO SỨC KHỎE
  saveMeasurement: async (data: { heartRate: number; spO2: number; stress: number }) => {
    await StorageService.saveToStorage({
      type: 'MEASURE',
      ...data
    });
  },

  // 2. Hàm lưu cho màn hình CHẨN ĐOÁN (Sửa lỗi saveRecord is not a function)
  saveRecord: async (data: { type: string; value: string; note: string; timestamp: number }) => {
    await StorageService.saveToStorage({
      type: 'DIAGNOSIS',
      diagnosisResult: data.value, // Lưu tên bệnh
      confidence: data.note,       // Lưu độ tin cậy
      timestamp: data.timestamp
    });
  },

  // Hàm nội bộ: Thực hiện việc lưu xuống bộ nhớ
  saveToStorage: async (newItem: any) => {
    try {
      const existing = await AsyncStorage.getItem(STORAGE_KEY);
      const history: HealthSession[] = existing ? JSON.parse(existing) : [];
      
      const record: HealthSession = {
        id: Date.now().toString(),
        isSynced: false,
        ...newItem
      };
      
      history.unshift(record); // Thêm vào đầu danh sách
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      console.log("Đã lưu Storage:", record.type);
    } catch (e) {
      console.error("Lỗi lưu Storage:", e);
    }
  },

  // Lấy toàn bộ lịch sử (Dùng cho màn hình History)
  getLocalHistory: async () => {
    try {
      const existing = await AsyncStorage.getItem(STORAGE_KEY);
      return existing ? JSON.parse(existing) : [];
    } catch (e) {
      return [];
    }
  },

  // Lấy dữ liệu chưa đồng bộ (Dùng cho nút Sync)
  getUnsynced: async () => {
    const all = await StorageService.getLocalHistory();
    return all.filter((item: HealthSession) => !item.isSynced);
  },

  // Đánh dấu tất cả đã đồng bộ
  markAllSynced: async () => {
    const all = await StorageService.getLocalHistory();
    const updated = all.map((item: HealthSession) => ({ ...item, isSynced: true }));
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
};