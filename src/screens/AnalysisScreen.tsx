import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { DataService } from '../services/DataService';

const AnalysisScreen = ({ navigation }: { navigation?: any }) => {
  const [loading, setLoading] = useState(true);
  // Khởi tạo giá trị mặc định an toàn để tránh crash
  const [stats, setStats] = useState<any>({ 
      today: { avgHeartRate: 0, avgSpO2: 0, avgStress: 0, avgSteps: 0, avgCalories: 0 }, 
      yesterday: { avgHeartRate: 0, avgSpO2: 0, avgStress: 0, avgSteps: 0, avgCalories: 0 }, 
      evaluation: { status: 'NO_DATA', msg: 'Đang tải...' } 
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const records = await DataService.getRecords();
        
        const todayDate = new Date();
        const yesterdayDate = new Date();
        yesterdayDate.setDate(todayDate.getDate() - 1);

        const dToday = DataService.calculateDailyStats(records, todayDate);
        const dYesterday = DataService.calculateDailyStats(records, yesterdayDate);
        const evalResult = DataService.evaluateHealth(dToday, dYesterday);

        setStats({ today: dToday, yesterday: dYesterday, evaluation: evalResult });
      } catch (e) {
        console.log("Analysis Error:", e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const renderTrend = (curr: number, prev: number, lowerIsBetter: boolean = false) => {
    // Ép kiểu về số để tránh lỗi so sánh undefined
    const c = Number(curr) || 0;
    const p = Number(prev) || 0;
    
    if (c === 0 || p === 0) return <Text style={{fontSize:9, color:'#888'}}>-</Text>;
    
    const diff = c - p;
    if (diff === 0) return <Text style={{fontSize:9, color:'#888'}}>-</Text>;
    
    const isBad = lowerIsBetter ? diff > 0 : diff < 0;
    const color = isBad ? '#FF3B30' : '#30D158'; 
    const arrow = diff > 0 ? '▲' : '▼';
    
    return <Text style={{fontSize:8, fontWeight:'bold', color}}>{arrow} {Math.abs(diff)}</Text>;
  };

  const displayVal = (val: any) => (val && Number(val) > 0) ? val : '--';

  const StatRow = ({ title, valToday, valYesterday, unit, lowerIsBetter }: any) => (
    <View style={styles.statCard}>
        <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{title}</Text>
            {renderTrend(valToday, valYesterday, lowerIsBetter)}
        </View>
        <View style={styles.row}>
            <View style={styles.col}>
                <Text style={styles.label}>Hôm qua</Text>
                <Text style={styles.valueOld}>{displayVal(valYesterday)}</Text>
            </View>
            <View style={styles.col}>
                <Text style={styles.label}>Hôm nay</Text>
                <Text style={styles.valueNew}>{displayVal(valToday)} <Text style={{fontSize:8}}>{unit}</Text></Text>
            </View>
        </View>
    </View>
  );

  if (loading) return <View style={styles.container}><ActivityIndicator size="small" color="#007AFF"/></View>;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.headerTitle}>PHÂN TÍCH NGÀY</Text>

        <View style={[styles.statusBox, stats.evaluation?.status === 'STABLE' ? styles.bgGreen : (stats.evaluation?.status === 'UNSTABLE' ? styles.bgRed : styles.bgGray)]}>
            <Text style={styles.statusText}>{stats.evaluation?.msg || 'Chưa có dữ liệu'}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <StatRow title="❤️ Nhịp tim" valToday={stats.today?.avgHeartRate} valYesterday={stats.yesterday?.avgHeartRate} unit="bpm" lowerIsBetter={true} />
            <StatRow title="💧 Oxy máu (SpO2)" valToday={stats.today?.avgSpO2} valYesterday={stats.yesterday?.avgSpO2} unit="%" lowerIsBetter={false} />
            <StatRow title="⚡ Stress" valToday={stats.today?.avgStress} valYesterday={stats.yesterday?.avgStress} unit="" lowerIsBetter={true} />
            <StatRow title="👣 Bước chân" valToday={stats.today?.avgSteps} valYesterday={stats.yesterday?.avgSteps} unit="" lowerIsBetter={false} />
            <StatRow title="🔥 Calo tiêu thụ" valToday={stats.today?.avgCalories} valYesterday={stats.yesterday?.avgCalories} unit="cal" lowerIsBetter={false} />
        </ScrollView>

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  card: { width: 192, height: 192, borderRadius: 96, backgroundColor: '#E6F7FF', alignItems: 'center', paddingTop: 12, overflow: 'hidden' },
  headerTitle: { fontSize: 10, fontWeight: 'bold', color: '#003366', marginBottom: 3 },
  scrollContent: { alignItems: 'center', width: 150, paddingBottom: 40 },
  statusBox: { width: '80%', paddingVertical: 2, borderRadius: 4, marginBottom: 5, alignItems: 'center' },
  bgGreen: { backgroundColor: '#D4EDDA' },
  bgRed: { backgroundColor: '#F8D7DA' },
  bgGray: { backgroundColor: '#EEE' },
  statusText: { fontSize: 8, fontWeight: 'bold', color: '#333' },
  statCard: { backgroundColor: '#FFF', width: '95%', borderRadius: 6, padding: 5, marginBottom: 4, elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  cardTitle: { fontSize: 9, fontWeight: 'bold', color: '#555' },
  row: { flexDirection: 'row', justifyContent: 'space-around' },
  col: { alignItems: 'center' },
  label: { fontSize: 7, color: '#999' },
  valueOld: { fontSize: 10, fontWeight: '500', color: '#888' },
  valueNew: { fontSize: 12, fontWeight: 'bold', color: '#003366' },
  backButton: { marginTop: 'auto', paddingVertical: 8, width: '100%', alignItems: 'center', backgroundColor: '#D0EBFF', borderTopWidth: 1, borderTopColor: '#C1E1FF' },
  backText: { fontSize: 10, color: '#003366', fontWeight: '600' }
});

export default AnalysisScreen;