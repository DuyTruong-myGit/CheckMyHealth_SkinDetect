import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthService } from '../services/AuthService';
import { StorageService, HealthSession } from '../utils/StorageService';
import { API_URL, getHeaders } from '../utils/api';

export const useDataSync = (deviceId: string) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const savedName = await AsyncStorage.getItem('LINKED_USER_NAME');
      if (savedName) setUserName(savedName);
    };
    loadUser();
  }, []);

  const syncData = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setSyncStatus('IDLE');

    try {
      // 1. Đăng nhập nếu cần
      const token = await AsyncStorage.getItem('USER_TOKEN');
      if (!token) {
          await AuthService.login("duytruongton@gmail.com", "123456");
          const profile = await AuthService.getProfile();
          if (profile?.fullName) {
              await AsyncStorage.setItem('LINKED_USER_NAME', profile.fullName);
              setUserName(profile.fullName);
          }
      }

      // 2. Lấy các bản ghi chưa Sync
      const unsyncedRecords = await StorageService.getUnsynced();
      
      if (unsyncedRecords.length > 0) {
          console.log(`Đang đồng bộ ${unsyncedRecords.length} bản ghi...`);
          
          // Gửi từng bản ghi lên Server (Hoặc gửi mảng nếu API hỗ trợ)
          for (const record of unsyncedRecords) {
             const response = await fetch(`${API_URL}/health`, {
                method: 'POST',
                headers: await getHeaders(),
                body: JSON.stringify({
                    heartRate: record.heartRate,
                    spO2: record.spO2,
                    stress: record.stress
                }),
             });
             
             if (!response.ok) throw new Error('Lỗi gửi dữ liệu');
          }

          // 3. Đánh dấu tất cả đã Sync thành công
          await StorageService.markAllSynced();
          console.log("✅ Đồng bộ hoàn tất!");
      } else {
          console.log("⚠ Không có dữ liệu mới để gửi.");
      }

      setSyncStatus('SUCCESS');

    } catch (error) {
      console.error("Sync Error:", error);
      setSyncStatus('ERROR');
    } finally {
      setIsSyncing(false);
    }
  };

  const resetLink = async () => {
    await AsyncStorage.clear();
    setUserName(null);
    setSyncStatus('IDLE');
  };

  return { isSyncing, syncStatus, userName, syncData, resetLink };
};