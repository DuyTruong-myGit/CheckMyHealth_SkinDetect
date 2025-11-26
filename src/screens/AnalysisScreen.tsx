import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { DataService } from '../services/DataService';

const AnalysisScreen = ({ navigation, onBack }: { navigation?: any, onBack?: () => void }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ hrToday: 0, hrYesterday: 0, stepsToday: 0, stepsYesterday: 0 });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const records = await DataService.getRecords();
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      const dToday = DataService.calculateDailyStats(records, today);
      const dYesterday = DataService.calculateDailyStats(records, yesterday);

      setStats({
        hrToday: dToday.avgHeartRate,
        hrYesterday: dYesterday.avgHeartRate,
        stepsToday: dToday.totalSteps,
        stepsYesterday: dYesterday.totalSteps,
      });
      setLoading(false);
    };
    loadData();
  }, []);

  const handleGoBack = () => {
    if (navigation?.goBack) navigation.goBack();
    else if (onBack) onBack();
  };

  const renderTrend = (curr: number, prev: number, isBadIfHigh: boolean) => {
    if (!curr || !prev) return <Text style={{fontSize:9, color:'#aaa'}}>--</Text>;
    const diff = curr - prev;
    if (diff === 0) return <Text style={{fontSize:9, color:'#aaa'}}>-</Text>;
    const isGood = isBadIfHigh ? diff < 0 : diff > 0;
    return <Text style={{fontSize:9, fontWeight:'bold', color: isGood ? '#2ecc71' : '#e74c3c'}}>{diff > 0 ? '▲' : '▼'} {Math.abs(diff)}</Text>;
  };

  if (loading) return <View style={styles.container}><ActivityIndicator size="large" color="#007AFF"/></View>;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.headerTitle}>PHÂN TÍCH NGÀY</Text>

        <View style={styles.subCard}>
            <View style={styles.row}><Text style={styles.title}>❤️ Nhịp tim TB</Text>{renderTrend(stats.hrToday, stats.hrYesterday, true)}</View>
            <View style={styles.rowSpace}>
                <View><Text style={styles.label}>Hôm qua</Text><Text style={styles.valGray}>{stats.hrYesterday}</Text></View>
                <View><Text style={styles.label}>Hôm nay</Text><Text style={styles.valBold}>{stats.hrToday}</Text></View>
            </View>
        </View>

        <View style={styles.subCard}>
            <View style={styles.row}><Text style={styles.title}>👣 Bước chân</Text>{renderTrend(stats.stepsToday, stats.stepsYesterday, false)}</View>
            <View style={styles.rowSpace}>
                <View><Text style={styles.label}>Hôm qua</Text><Text style={styles.valGray}>{stats.stepsYesterday}</Text></View>
                <View><Text style={styles.label}>Hôm nay</Text><Text style={styles.valBold}>{stats.stepsToday}</Text></View>
            </View>
        </View>

        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}><Text style={styles.backText}>Quay lại</Text></TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  card: { width: 192, height: 192, borderRadius: 96, backgroundColor: '#E6F7FF', alignItems: 'center', paddingTop: 15, overflow: 'hidden' },
  headerTitle: { fontSize: 11, fontWeight: 'bold', color: '#003366', marginBottom: 5 },
  subCard: { backgroundColor: '#fff', width: '85%', borderRadius: 8, padding: 6, marginBottom: 6, elevation: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4, borderBottomWidth: 0.5, borderBottomColor: '#eee', paddingBottom: 2 },
  rowSpace: { flexDirection: 'row', justifyContent: 'space-around' },
  title: { fontSize: 9, color: '#555', fontWeight: 'bold' },
  label: { fontSize: 8, color: '#999' },
  valGray: { fontSize: 12, fontWeight: '600', color: '#7f8c8d' },
  valBold: { fontSize: 13, fontWeight: 'bold', color: '#003366' },
  backButton: { paddingVertical: 8, width: '100%', alignItems: 'center', marginTop: 'auto', backgroundColor: '#D0EBFF', borderTopWidth: 1, borderTopColor: '#C1E1FF' },
  backText: { fontSize: 11, color: '#003366', fontWeight: '600' }
});

export default AnalysisScreen;