import React, { createContext, useState, useContext, useRef, ReactNode, useEffect } from 'react';
import { DataService } from '../services/DataService';
import SocketService from '../services/SocketService';

interface AppContextType {
  isHealthMeasuring: boolean;
  healthData: { heartRate: number | string; spO2: number | string; stress: number | string };
  toggleHealthMeasure: () => void;
  isWorkoutRunning: boolean;
  workoutData: { duration: number; steps: number; calories: number };
  toggleWorkout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isHealthMeasuring, setIsHealthMeasuring] = useState(false);
  const [healthData, setHealthData] = useState<any>({ heartRate: '--', spO2: '--', stress: '--' });
  const healthTimer = useRef<NodeJS.Timeout | null>(null);

  const [isWorkoutRunning, setIsWorkoutRunning] = useState(false);
  const [workoutData, setWorkoutData] = useState({ duration: 0, steps: 0, calories: 0 });
  const workoutTimer = useRef<NodeJS.Timeout | null>(null);

  // Kết nối Socket khi mở App
  useEffect(() => {
    const initSocket = async () => {
        await SocketService.connect();
    };
    initSocket();
    return () => { SocketService.disconnect(); };
  }, []);

  // --- LOGIC SỨC KHỎE ---
  const toggleHealthMeasure = () => {
    if (isHealthMeasuring) {
      // DỪNG ĐO
      if (healthTimer.current) clearInterval(healthTimer.current);
      setIsHealthMeasuring(false);
      
      // Lưu kết quả cuối cùng vào DB
      if (healthData.heartRate !== '--') {
        const now = new Date();
        const timeString = `${now.getHours()}:${now.getMinutes()} - ${now.getDate()}/${now.getMonth() + 1}`;
        DataService.addRecord({
            id: Math.random().toString(),
            type: 'HEALTH',
            timestamp: timeString,
            heartRate: Number(healthData.heartRate),
            spO2: Number(healthData.spO2),
            stress: Number(healthData.stress)
        });
      }
      setHealthData({ heartRate: '--', spO2: '--', stress: '--' });

    } else {
      // BẮT ĐẦU ĐO
      setIsHealthMeasuring(true);
      
      // [QUAN TRỌNG] Vòng lặp chạy mỗi giây
      healthTimer.current = setInterval(() => {
        // 1. Tạo dữ liệu mới
        const newData = {
            heartRate: Math.floor(65 + Math.random() * 45),
            spO2: Math.floor(96 + Math.random() * 3),
            stress: Math.floor(20 + Math.random() * 30)
        };
        
        // 2. Cập nhật màn hình Đồng hồ
        setHealthData(newData);
        
        // 3. Gửi sang Điện thoại (Realtime)
        SocketService.emitLiveHealth(newData);

      }, 1000); 
    }
  };

  // --- LOGIC LUYỆN TẬP ---
  const toggleWorkout = () => {
    if (isWorkoutRunning) {
      // DỪNG TẬP
      if (workoutTimer.current) clearInterval(workoutTimer.current);
      setIsWorkoutRunning(false);

      // Lưu kết quả
      if (workoutData.steps > 0) {
        const now = new Date();
        const timeString = `${now.getHours()}:${now.getMinutes()} - ${now.getDate()}/${now.getMonth() + 1}`;
        const mins = Math.floor(workoutData.duration / 60);
        const secs = workoutData.duration % 60;
        const durationStr = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

        DataService.addRecord({
            id: Math.random().toString(),
            type: 'WORKOUT',
            timestamp: timeString,
            steps: workoutData.steps,
            calories: workoutData.calories,
            duration: durationStr
        });
      }
      setWorkoutData({ duration: 0, steps: 0, calories: 0 });

    } else {
      // BẮT ĐẦU TẬP
      setIsWorkoutRunning(true);
      
      // [QUAN TRỌNG] Vòng lặp chạy mỗi giây
      workoutTimer.current = setInterval(() => {
        setWorkoutData(prev => {
            const nextSteps = prev.steps + Math.floor(Math.random() * 3) + 1;
            
            const newData = {
                duration: prev.duration + 1,
                steps: nextSteps,
                calories: Math.floor(nextSteps * 0.04)
            };

            // Gửi sang Điện thoại (Realtime)
            SocketService.emitLiveWorkout(newData);

            return newData;
        });
      }, 1000); 
    }
  };

  return (
    <AppContext.Provider value={{
        isHealthMeasuring, healthData, toggleHealthMeasure,
        isWorkoutRunning, workoutData, toggleWorkout
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};