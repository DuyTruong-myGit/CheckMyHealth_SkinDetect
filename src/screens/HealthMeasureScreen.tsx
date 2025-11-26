import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DataService } from '../services/DataService';

const HealthMeasureScreen = ({ navigation, onBack }: { navigation?: any, onBack?: () => void }) => {
  const [isMeasuring, setIsMeasuring] = useState(false);
  // Khởi tạo là '--' (string)
  const [heartRate, setHeartRate] = useState<number | string>('--');
  const [spO2, setSpO2] = useState<number | string>('--');
  const [stress, setStress] = useState<number | string>('--');

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const getRandomInt = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const toggleMeasure = () => {
    if (isMeasuring) {
      stopMeasuring();
    } else {
      startMeasuring();
    }
  };

  const startMeasuring = () => {
    setIsMeasuring(true);
    intervalRef.current = setInterval(() => {
      setHeartRate(getRandomInt(65, 110));
      setSpO2(getRandomInt(96, 99));
      setStress(getRandomInt(20, 50));
    }, 1000);
  };

  const stopMeasuring = () => {
    setIsMeasuring(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleGoBack = () => {
    stopMeasuring();
    
    // Kiểm tra nếu đã có số liệu
    if (heartRate !== '--') {
      const now = new Date();
      const timeString = `${now.getHours()}:${now.getMinutes()} - ${now.getDate()}/${now.getMonth() + 1}`;
      
      DataService.addRecord({
        id: Math.random().toString(),
        type: 'HEALTH',
        timestamp: timeString,
        // SỬA LỖI Ở ĐÂY: Ép kiểu về Number
        heartRate: Number(heartRate),
        spO2: Number(spO2),
        stress: Number(stress)
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
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        
        <Text style={styles.headerTitle}>ĐO SỨC KHỎE</Text>

        <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
                <Text style={styles.metricIcon}>💧</Text>
                <Text style={[styles.metricValue, {color: '#3498db'}]}>{spO2}</Text>
                <Text style={styles.metricLabel}>%SpO2</Text>
            </View>

            <View style={styles.metricItem}>
                <Text style={styles.metricIcon}>❤️</Text>
                <Text style={[styles.metricValue, {color: '#e74c3c'}]}>{heartRate}</Text>
                <Text style={styles.metricLabel}>BPM</Text>
            </View>

            <View style={styles.metricItem}>
                <Text style={styles.metricIcon}>⚡</Text>
                <Text style={[styles.metricValue, {color: '#f1c40f'}]}>{stress}</Text>
                <Text style={styles.metricLabel}>Stress</Text>
            </View>
        </View>

        <Text style={styles.statusText}>
            {isMeasuring ? "Đang đo..." : "Sẵn sàng"}
        </Text>

        <View style={styles.buttonContainer}>
            <TouchableOpacity 
                style={[styles.mainButton, isMeasuring ? styles.stopButton : styles.startButton]} 
                onPress={toggleMeasure}
                activeOpacity={0.7}
            >
                <Text style={styles.mainButtonText}>
                    {isMeasuring ? "Dừng lại" : "Đo ngay"}
                </Text>
            </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  card: { width: 192, height: 192, borderRadius: 96, backgroundColor: '#E6F7FF', alignItems: 'center', paddingTop: 10, overflow: 'hidden' },
  
  headerTitle: { fontSize: 10, fontWeight: 'bold', color: '#003366', marginBottom: 2 },
  
  metricsRow: { flexDirection: 'row', justifyContent: 'space-evenly', width: '100%', paddingHorizontal: 5, marginBottom: 2 },
  metricItem: { alignItems: 'center', width: 55 },
  metricIcon: { fontSize: 14, marginBottom: 0 },
  metricValue: { fontSize: 24, fontWeight: 'bold', lineHeight: 28 },
  metricLabel: { fontSize: 9, color: '#555', fontWeight: '600', marginTop: 0 },
  
  statusText: { fontSize: 9, color: '#555', fontStyle: 'italic', marginBottom: 2, height: 12 },
  
  buttonContainer: { alignItems: 'center', width: '100%', flex: 1, justifyContent: 'center' },
  mainButton: { paddingVertical: 5, paddingHorizontal: 18, borderRadius: 20, minWidth: 90, alignItems: 'center', elevation: 2 },
  startButton: { backgroundColor: '#2ecc71' },
  stopButton: { backgroundColor: '#e74c3c' },
  mainButtonText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  
  backButton: { paddingVertical: 6, width: '100%', alignItems: 'center', backgroundColor: '#D0EBFF', borderTopWidth: 1, borderTopColor: '#C1E1FF' },
  backButtonText: { fontSize: 10, color: '#003366', fontWeight: '600' }
});

export default HealthMeasureScreen;