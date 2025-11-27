import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DataService } from '../services/DataService';

const HomeScreen = ({ navigation }: { navigation: any }) => {
  const [showWarning, setShowWarning] = useState(false);

  const checkHealthStatus = async () => {
    try {
      const records = await DataService.getRecords();
      const today = new Date();
      const statsToday = DataService.calculateDailyStats(records, today);

      // Nếu chưa có dữ liệu gì (Nhịp tim = 0 và Bước chân = 0) thì hiện cảnh báo
      if (statsToday.avgHeartRate === 0 && statsToday.avgSteps === 0) {
        setShowWarning(true);
      } else {
        setShowWarning(false); // Đã đo rồi thì ẩn luôn
      }
    } catch (e) {
      setShowWarning(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', checkHealthStatus);
    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        
        <Text style={styles.greetingText}>Xin chào,</Text>
        <Text style={styles.appName}>CHECKMYHEALTH</Text>
        
        {/* Chỉ hiện Box này khi chưa có dữ liệu */}
        {showWarning && (
            <View style={styles.alertBox}>
                <Text style={styles.alertText}>⚠️ Chưa có dữ liệu hôm nay</Text>
            </View>
        )}

        {/* Thêm khoảng trống nếu không có thông báo để layout cân đối */}
        {!showWarning && <View style={{height: 10}} />}

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
  card: { width: 192, height: 192, borderRadius: 96, backgroundColor: '#E6F7FF', alignItems: 'center', paddingTop: 10, overflow: 'hidden' },
  greetingText: { fontSize: 8, color: '#666', marginBottom: 0 },
  appName: { fontSize: 11, fontWeight: '900', color: '#003366', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  
  // Style cảnh báo màu vàng
  alertBox: { width: '80%', paddingVertical: 2, borderRadius: 4, marginBottom: 5, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF3CD' },
  alertText: { fontSize: 8, color: '#856404', fontWeight: '600' },

  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', width: '90%' },
  gridItem: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', margin: 3, elevation: 3 },
  icon: { fontSize: 16, marginBottom: 0 },
  menuText: { fontSize: 7, fontWeight: 'bold', color: '#333', marginTop: 0 }
});

export default HomeScreen;