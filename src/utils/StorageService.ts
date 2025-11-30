import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'HEALTH_HISTORY';

export const StorageService = {
  // Hàm lưu lẻ 1 bản ghi (Dùng khi đo xong mà mất mạng)
  saveToStorage: async (newItem: any) => {
    try {
      const existing = await AsyncStorage.getItem(STORAGE_KEY);
      const history = existing ? JSON.parse(existing) : [];
      
      const record = {
        id: Date.now().toString(),
        ...newItem
      };
      
      history.unshift(record); 
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.error("Lỗi lưu Storage:", e);
    }
  },

  // [MỚI] Hàm quan trọng: Lưu dữ liệu từ Server về máy (Cache)
  // Giúp xem được lịch sử kể cả khi Offline
  syncServerData: async (serverData: any[]) => {
    try {
      // 1. Lấy dữ liệu cũ trong máy để tìm các item chưa đồng bộ
      const existing = await AsyncStorage.getItem(STORAGE_KEY);
      const localList = existing ? JSON.parse(existing) : [];
      
      // Giữ lại những cái chưa gửi đi (isSynced = false)
      const unsyncedItems = localList.filter((item: any) => item.isSynced === false);

      // 2. Chuẩn bị dữ liệu từ Server (Đánh dấu là đã synced)
      const serverItems = serverData.map(item => ({ ...item, isSynced: true }));
      
      // 3. Gộp lại: Chưa gửi (Mới nhất) + Đã gửi (Server trả về)
      // Sắp xếp theo thời gian mới nhất lên đầu (nếu có trường createdDate hoặc timestamp)
      const mergedList = [...unsyncedItems, ...serverItems];

      // 4. Lưu đè vào bộ nhớ máy
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mergedList));
      
      return mergedList;
    } catch (e) {
      console.error("Lỗi sync cache:", e);
      return serverData; // Lỗi thì trả về data server gốc
    }
  },

  getLocalHistory: async () => {
    try {
      const existing = await AsyncStorage.getItem(STORAGE_KEY);
      return existing ? JSON.parse(existing) : [];
    } catch (e) {
      return [];
    }
  },
  
  getUnsynced: async () => {
    const all = await StorageService.getLocalHistory();
    return all.filter((item: any) => item.isSynced === false);
  },

  markAllSynced: async () => {
    const all = await StorageService.getLocalHistory();
    const updated = all.map((item: any) => ({ ...item, isSynced: true }));
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  saveMeasurement: async (data: any) => {}
};