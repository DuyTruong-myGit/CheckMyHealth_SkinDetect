import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { DataService } from '../services/DataService';

const HomeScreen = ({ navigation }: { navigation: any }) => {
  const [alertMsg, setAlertMsg] = useState('Đang kết nối Server...');

  const checkHealthStatus = async () => {
    try {
      const records = await DataService.getRecords();
      
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      const statsToday = DataService.calculateDailyStats(records, today);
      const statsYesterday = DataService.calculateDailyStats(records, yesterday);

      if (statsToday.avgHeartRate === 0 && statsToday.totalSteps === 0) {
        setAlertMsg('⚠️ Bạn chưa đo sức khỏe hôm nay!');
        return;
      }

      if (statsYesterday.avgHeartRate > 0 && statsToday.avgHeartRate > statsYesterday.avgHeartRate + 5) {
        setAlertMsg('⚠️ Nhịp tim tăng cao hơn hôm qua!');
        return;
      }

      if (statsYesterday.totalSteps > 0 && statsToday.totalSteps < statsYesterday.totalSteps - 500) {
        setAlertMsg('📉 Bạn vận động ít hơn hôm qua.');
        return;
      }

      setAlertMsg('✅ Sức khỏe hôm nay ổn định.');
    } catch (e) {
      setAlertMsg('❌ Không thể kết nối Server');
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', checkHealthStatus);
    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.appName}>MyHealth Watch</Text>
        <View style={[styles.alertBox, alertMsg.includes('✅') ? styles.alertGood : styles.alertWarn]}>
            <Text style={styles.alertText}>{alertMsg}</Text>
        </View>

        <ScrollView style={styles.menuContainer} contentContainerStyle={styles.menuContent}>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('HealthMeasure')}>
                <Text style={styles.menuText}>❤️ Đo Sức khỏe</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Workout')}>
                <Text style={styles.menuText}>🏃 Chạy bộ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('History')}>
                <Text style={styles.menuText}>📅 Lịch sử</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Analysis')}>
                <Text style={styles.menuText}>📊 Phân tích</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Weather')}>
                <Text style={styles.menuText}>☁️ Thời tiết</Text>
            </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  card: { width: 192, height: 192, borderRadius: 96, backgroundColor: '#E6F7FF', alignItems: 'center', paddingTop: 15, overflow: 'hidden' },
  appName: { fontSize: 12, fontWeight: '900', color: '#003366', marginBottom: 5, textTransform: 'uppercase' },
  alertBox: { width: '85%', paddingVertical: 5, paddingHorizontal: 8, borderRadius: 8, marginBottom: 5, alignItems: 'center', justifyContent: 'center' },
  alertWarn: { backgroundColor: '#FFF3CD', borderWidth: 1, borderColor: '#FFEEBA' },
  alertGood: { backgroundColor: '#D4EDDA', borderWidth: 1, borderColor: '#C3E6CB' },
  alertText: { fontSize: 9, color: '#333', textAlign: 'center', fontWeight: '600' },
  menuContainer: { width: '100%', flex: 1 },
  menuContent: { alignItems: 'center', paddingBottom: 20 },
  menuItem: { width: 140, backgroundColor: '#fff', paddingVertical: 8, borderRadius: 20, marginBottom: 5, alignItems: 'center', elevation: 1 },
  menuText: { fontSize: 11, fontWeight: 'bold', color: '#333' }
});

export default HomeScreen;