import React, { createContext, useState, useContext, useRef, ReactNode } from 'react';
import { DataService } from '../services/DataService';

// Định nghĩa kiểu dữ liệu cho Context
interface AppContextType {
  // --- SỨC KHỎE ---
  isHealthMeasuring: boolean;
  healthData: { heartRate: number | string; spO2: number | string; stress: number | string };
  toggleHealthMeasure: () => void;

  // --- LUYỆN TẬP ---
  isWorkoutRunning: boolean;
  workoutData: { duration: number; steps: number; calories: number };
  toggleWorkout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  // 1. STATE SỨC KHỎE
  const [isHealthMeasuring, setIsHealthMeasuring] = useState(false);
  const [healthData, setHealthData] = useState<any>({ heartRate: '--', spO2: '--', stress: '--' });
  const healthTimer = useRef<NodeJS.Timeout | null>(null);

  // 2. STATE LUYỆN TẬP
  const [isWorkoutRunning, setIsWorkoutRunning] = useState(false);
  const [workoutData, setWorkoutData] = useState({ duration: 0, steps: 0, calories: 0 });
  const workoutTimer = useRef<NodeJS.Timeout | null>(null);

  // --- LOGIC SỨC KHỎE ---
  const toggleHealthMeasure = () => {
    if (isHealthMeasuring) {
      // DỪNG ĐO -> LƯU DỮ LIỆU
      if (healthTimer.current) clearInterval(healthTimer.current);
      setIsHealthMeasuring(false);
      
      // Lưu vào DataService nếu có dữ liệu hợp lệ
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
      // Reset về mặc định
      setHealthData({ heartRate: '--', spO2: '--', stress: '--' });

    } else {
      // BẮT ĐẦU ĐO
      setIsHealthMeasuring(true);
      healthTimer.current = setInterval(() => {
        setHealthData({
            heartRate: Math.floor(65 + Math.random() * 45),
            spO2: Math.floor(96 + Math.random() * 3),
            stress: Math.floor(20 + Math.random() * 30)
        });
      }, 1000);
    }
  };

  // --- LOGIC LUYỆN TẬP ---
  const toggleWorkout = () => {
    if (isWorkoutRunning) {
      // DỪNG TẬP -> LƯU DỮ LIỆU
      if (workoutTimer.current) clearInterval(workoutTimer.current);
      setIsWorkoutRunning(false);

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
      // Reset
      setWorkoutData({ duration: 0, steps: 0, calories: 0 });

    } else {
      // BẮT ĐẦU TẬP
      setIsWorkoutRunning(true);
      workoutTimer.current = setInterval(() => {
        setWorkoutData(prev => {
            const nextSteps = prev.steps + Math.floor(Math.random() * 3) + 1;
            return {
                duration: prev.duration + 1,
                steps: nextSteps,
                calories: Math.floor(nextSteps * 0.04)
            };
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