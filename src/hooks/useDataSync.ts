
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageService } from '../utils/StorageService'; 
import { API_URL } from '../utils/api'; 

export const useDataSync = (deviceId: string) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const checkLogin = async () => {
      const name = await AsyncStorage.getItem('LINKED_USER_NAME');
      if (name) setUserName(name);
    };
    checkLogin();
  }, []);

  const syncData = async () => {
    if (isSyncing || deviceId === '...') return;
    setIsSyncing(true);
    setSyncStatus('IDLE');

    try {
      let token = await AsyncStorage.getItem('USER_TOKEN');

      if (!token) {
          console.log("Checking pairing status for ID:", deviceId);
          const statusRes = await fetch(`${API_URL}/watch/status/${deviceId}`);
          const statusData = await statusRes.json();

          if (statusData.status === 'LINKED' && statusData.token) {
              await AsyncStorage.setItem('USER_TOKEN', statusData.token);
              await AsyncStorage.setItem('LINKED_USER_NAME', statusData.user.fullName);

              setUserName(statusData.user.fullName);
              token = statusData.token;
              alert("Kết nối thành công với " + statusData.user.fullName);
          } else {
              alert(`Chưa kết nối! Vui lòng mở App trên điện thoại và nhập ID: ${deviceId}`);
              setIsSyncing(false);
              return; 
          }
      }

      const unsyncedRecords = await StorageService.getUnsynced();

      if (unsyncedRecords.length > 0) {
          for (const record of unsyncedRecords) {
             const response = await fetch(`${API_URL}/watch/measurements`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(record),
             });
             
             if (!response.ok) {
                 if (response.status === 401) {
                     await resetLink(); 
                 }
                 throw new Error('Lỗi gửi dữ liệu');
             }
          }
          await StorageService.markAllSynced();
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
    try {
      await AsyncStorage.removeItem('USER_TOKEN');
      await AsyncStorage.removeItem('LINKED_USER_NAME');      
      setUserName(null);
      setSyncStatus('IDLE');
    } catch (e) {
      console.error("Lỗi khi hủy liên kết:", e);
    }
  };

  return { isSyncing, syncStatus, userName, syncData, resetLink };
};