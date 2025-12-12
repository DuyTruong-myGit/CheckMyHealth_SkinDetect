import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'HEALTH_HISTORY';

export const StorageService = {
  saveToStorage: async (newItem: any) => {
    try {
      const existing = await AsyncStorage.getItem(STORAGE_KEY);
      const history = existing ? JSON.parse(existing) : [];
      
      const record = {
        ...newItem,
        isSynced: newItem.isSynced || false
      };
      
      history.unshift(record); 
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.error("Lỗi lưu Storage:", e);
    }
  },

  syncServerData: async (serverData: any[]) => {
    try {
      const existing = await AsyncStorage.getItem(STORAGE_KEY);
      const localList = existing ? JSON.parse(existing) : [];
      
      const serverIds = new Set(serverData.map((d: any) => d.id));
      
      const unsyncedItems = localList.filter((item: any) => 
          item.isSynced === false && !serverIds.has(item.id)
      );

      const serverItems = serverData.map(item => ({ ...item, isSynced: true }));
      const mergedList = [...unsyncedItems, ...serverItems];

      mergedList.sort((a: any, b: any) => {
         const timeA = new Date(a.created_at || a.timestamp || 0).getTime();
         const timeB = new Date(b.created_at || b.timestamp || 0).getTime();
         return timeB - timeA;
      });

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mergedList));
      return mergedList;
    } catch (e) {
      return serverData;
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

  // [MỚI] Hàm này dùng để đánh dấu 1 bản ghi cụ thể là đã gửi thành công
  markAsSynced: async (id: string) => {
    try {
        const all = await StorageService.getLocalHistory();
        const updated = all.map((item: any) => {
            if (item.id === id) {
                return { ...item, isSynced: true };
            }
            return item;
        });
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
        console.error("Lỗi update status:", e);
    }
  }
};