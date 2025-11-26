import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DataService } from '../services/DataService';

const WorkoutScreen = ({ navigation, onBack }: { navigation?: any, onBack?: () => void }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [duration, setDuration] = useState(0);
  const [steps, setSteps] = useState(0);
  const [calories, setCalories] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const toggleWorkout = () => {
    if (isRunning) {
      pauseWorkout();
    } else {
      startWorkout();
    }
  };

  const startWorkout = () => {
    setIsRunning(true);
    timerRef.current = setInterval(() => {
      setDuration(prev => prev + 1);
      setSteps(prevSteps => {
        const nextSteps = prevSteps + Math.floor(Math.random() * 3) + 1;
        setCalories(Math.floor(nextSteps * 0.04)); 
        return nextSteps;
      });
    }, 1000);
  };

  const pauseWorkout = () => {
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleGoBack = () => {
    pauseWorkout();
    if (steps > 0) {
      const now = new Date();
      const timeString = `${now.getHours()}:${now.getMinutes()} - ${now.getDate()}/${now.getMonth() + 1}`;
      DataService.addRecord({
        id: Math.random().toString(),
        type: 'WORKOUT',
        timestamp: timeString,
        steps: steps,
        calories: calories,
        duration: formatTime(duration)
      });
    }
    if (navigation && navigation.goBack) {
      navigation.goBack();
    } else if (onBack) {
      onBack();
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        
        <Text style={styles.headerTitle}>CHẠY BỘ</Text>

        {/* Vòng tròn đã được phóng to */}
        <View style={[styles.stepContainer, isRunning ? styles.runningBorder : null]}>
            <Text style={styles.stepCount}>{steps}</Text>
            <Text style={styles.stepLabel}>bước</Text>
        </View>

        <View style={styles.infoRow}>
            <View style={styles.infoItem}>
                <Text style={styles.infoValue}>{calories}</Text>
                <Text style={styles.infoLabel}>🔥 Calo</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoItem}>
                <Text style={styles.infoValue}>{formatTime(duration)}</Text>
                <Text style={styles.infoLabel}>⏱️ Thời gian</Text>
            </View>
        </View>

        <View style={styles.buttonContainer}>
            <TouchableOpacity 
                style={[styles.mainButton, isRunning ? styles.pauseBtn : styles.startBtn]} 
                onPress={toggleWorkout}
                activeOpacity={0.7}
            >
                <Text style={styles.btnText}>
                    {isRunning ? "TẠM DỪNG" : "BẮT ĐẦU"}
                </Text>
            </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Text style={styles.backText}>Quay lại</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  // Giảm padding top xuống tối thiểu để tận dụng không gian
  card: { width: 192, height: 192, borderRadius: 96, backgroundColor: '#E6F7FF', alignItems: 'center', paddingTop: 2, overflow: 'hidden' },
  
  headerTitle: { fontSize: 10, fontWeight: 'bold', color: '#003366', marginBottom: 1, marginTop: 2 },
  
  // TĂNG KÍCH THƯỚC VÒNG TRÒN: 68 -> 78
  stepContainer: { alignItems: 'center', justifyContent: 'center', width: 78, height: 78, borderRadius: 39, borderWidth: 3, borderColor: '#fff', backgroundColor: '#fff', marginBottom: 2, elevation: 2 },
  runningBorder: { borderColor: '#2ecc71' },
  // Tăng cỡ chữ số bước: 22 -> 26
  stepCount: { fontSize: 26, fontWeight: 'bold', color: '#333', lineHeight: 30 },
  stepLabel: { fontSize: 9, color: '#999' },
  
  infoRow: { flexDirection: 'row', justifyContent: 'center', width: '100%', marginBottom: 2 },
  infoItem: { alignItems: 'center', width: 55 },
  divider: { width: 1, height: 15, backgroundColor: '#ccc', marginTop: 5 },
  infoValue: { fontSize: 13, fontWeight: 'bold', color: '#003366' },
  infoLabel: { fontSize: 8, color: '#666' },
  
  buttonContainer: { alignItems: 'center', width: '100%', flex: 1, justifyContent: 'center' },
  
  mainButton: { paddingVertical: 4, paddingHorizontal: 15, borderRadius: 15, minWidth: 80, alignItems: 'center', elevation: 2 },
  startBtn: { backgroundColor: '#2ecc71' },
  pauseBtn: { backgroundColor: '#e74c3c' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 10 },
  
  backButton: { paddingVertical: 6, width: '100%', alignItems: 'center', backgroundColor: '#D0EBFF', borderTopWidth: 1, borderTopColor: '#C1E1FF' },
  backText: { fontSize: 10, color: '#003366', fontWeight: '600' }
});

export default WorkoutScreen;