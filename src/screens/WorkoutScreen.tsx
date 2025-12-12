import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppContext } from '../context/AppContext'; 

const WorkoutScreen = ({ navigation }: { navigation: any }) => {
  const { isWorkoutRunning, workoutData, toggleWorkout } = useAppContext();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        
        <Text style={styles.headerTitle}>CHẠY BỘ</Text>

        <View style={[styles.stepContainer, isWorkoutRunning ? styles.runningBorder : null]}>
            <Text style={styles.stepCount}>{workoutData.steps}</Text>
            <Text style={styles.stepLabel}>bước</Text>
        </View>

        <View style={styles.infoRow}>
            <View style={styles.infoItem}>
                <Text style={styles.infoValue}>{workoutData.calories}</Text>
                <Text style={styles.infoLabel}>🔥 Calo</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoItem}>
                <Text style={styles.infoValue}>{formatTime(workoutData.duration)}</Text>
                <Text style={styles.infoLabel}>⏱️ Thời gian</Text>
            </View>
        </View>

        <View style={styles.buttonContainer}>
            <TouchableOpacity 
                style={[styles.mainButton, isWorkoutRunning ? styles.pauseBtn : styles.startBtn]} 
                onPress={toggleWorkout}
                activeOpacity={0.7}
            >
                <Text style={styles.btnText}>
                    {isWorkoutRunning ? "DỪNG & LƯU" : "BẮT ĐẦU"}
                </Text>
            </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>Quay lại</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  card: { width: 192, height: 192, borderRadius: 96, backgroundColor: '#E6F7FF', alignItems: 'center', paddingTop: 2, overflow: 'hidden' },
  headerTitle: { fontSize: 10, fontWeight: 'bold', color: '#003366', marginBottom: 1, marginTop: 2 },
  stepContainer: { alignItems: 'center', justifyContent: 'center', width: 78, height: 78, borderRadius: 39, borderWidth: 3, borderColor: '#fff', backgroundColor: '#fff', marginBottom: 2, elevation: 2 },
  runningBorder: { borderColor: '#2ecc71' },
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