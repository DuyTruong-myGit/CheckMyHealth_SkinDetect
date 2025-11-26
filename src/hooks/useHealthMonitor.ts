import { useState, useEffect } from 'react';
import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
import { StorageService } from '../utils/StorageService';

// Lấy module từ Native
const { HeartRateModule } = NativeModules;
const healthEmitter = new NativeEventEmitter(HeartRateModule);

export const useHealthMonitor = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [data, setData] = useState({ heartRate: 0, spO2: 0, stress: 0 });

  const startScanning = () => {
    if (isScanning) return;
    setIsScanning(true);
    
    // Gọi hàm Java để bắt đầu lắng nghe cảm biến
    if (Platform.OS === 'android') {
        HeartRateModule.startMonitoring();
    }
  };

  const stopScanning = () => {
    setIsScanning(false);
    
    // Gọi hàm Java để dừng
    if (Platform.OS === 'android') {
        HeartRateModule.stopMonitoring();
    }

    // Lưu kết quả cuối cùng
    if (data.heartRate > 0) {
        StorageService.saveMeasurement(data);
    }
  };

  useEffect(() => {
    // Đăng ký lắng nghe sự kiện 'HeartRateUpdate' từ Java gửi sang
    const subscription = healthEmitter.addListener('HeartRateUpdate', (event) => {
      setData({
        heartRate: event.heartRate,
        spO2: event.spO2,     // SpO2 được tính kèm trong module Java
        stress: event.stress  // Stress được tính kèm trong module Java
      });
    });

    return () => {
      // Dọn dẹp khi thoát màn hình
      subscription.remove();
      if (isScanning) HeartRateModule.stopMonitoring();
    };
  }, []);

  return { data, isScanning, startScanning, stopScanning };
};