import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DataService } from '../services/DataService';

const HomeScreen = ({ navigation }: { navigation: any }) => {
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  const checkHealthStatus = async () => {
    try {
      const records = await DataService.getRecords();
      const today = new Date();
      const statsToday = DataService.calculateDailyStats(records, today);

      if (statsToday.avgHeartRate === 0 && statsToday.avgSteps === 0) {
        setAlertMsg('⚠️ Chưa đo hôm nay');
      } else {
        setAlertMsg(null);
      }
    } catch (e) {
      setAlertMsg(null);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', checkHealthStatus);
    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        
        <Text style={styles.appName}> CHECKMYHEALTH</Text>
        <Text style={styles.greetingText}>Xin chào,</Text>
        
        {/* Điều chỉnh phần này để không chiếm chỗ */}
        {alertMsg ? (
            <View style={styles.alertBox}>
                <Text style={styles.alertText}>{alertMsg}</Text>
            </View>
        ) : (
            // [ĐÃ SỬA] Giảm chiều cao khoảng trống dự phòng từ 22 xuống 5
            <View style={{height: 5, marginBottom: 2}} />
        )}

        <View style={styles.gridContainer}>
            <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate('HealthMeasure')}>
                <Text style={styles.icon}>❤️</Text>
                <Text style={styles.menuText}>Sức khỏe</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate('Workout')}>
                <Text style={styles.icon}>🏃</Text>
                <Text style={styles.menuText}>Luyện tập</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate('History')}>
                <Text style={styles.icon}>📅</Text>
                <Text style={styles.menuText}>Lịch sử</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate('Analysis')}>
                <Text style={styles.icon}>📊</Text>
                <Text style={styles.menuText}>Phân tích</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate('Weather')}>
                <Text style={styles.icon}>☁️</Text>
                <Text style={styles.menuText}>Thời tiết</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate('Profile')}>
                <Text style={styles.icon}>👤</Text>
                <Text style={styles.menuText}>Hồ sơ</Text>
            </TouchableOpacity>
        </View>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  
  // [ĐÃ SỬA] Giảm paddingTop từ 15 xuống 8 để kéo nội dung lên
  card: { width: 192, height: 192, borderRadius: 96, backgroundColor: '#E6F7FF', alignItems: 'center', paddingTop: 8, overflow: 'hidden' },
  
  appName: { fontSize: 11, fontWeight: '900', color: '#003366', marginBottom: 0, textTransform: 'uppercase', letterSpacing: 0.5 },
  
  // [ĐÃ SỬA] Giảm marginBottom từ 4 xuống 2
  greetingText: { fontSize: 9, color: '#666', marginBottom: 2, fontStyle: 'italic' },

  alertBox: { width: '80%', paddingVertical: 2, borderRadius: 4, marginBottom: 2, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#DDD' },
  alertText: { fontSize: 8, color: '#333', fontWeight: '600' },

  // [ĐÃ SỬA] Thêm marginTop âm nhỏ để kéo lưới lên một chút nếu cần thiết
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', width: '90%', marginTop: -2 },
  
  gridItem: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', margin: 3, elevation: 2 },
  icon: { fontSize: 16, marginBottom: 0 },
  menuText: { fontSize: 7, fontWeight: 'bold', color: '#333', marginTop: 0 },
});

export default HomeScreen;