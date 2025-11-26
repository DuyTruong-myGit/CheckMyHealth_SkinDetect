import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { DataService, HealthRecord } from '../services/DataService';

const HistoryScreen = ({ navigation, onBack }: { navigation?: any, onBack?: () => void }) => {
  const [data, setData] = useState<HealthRecord[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const records = await DataService.getRecords();
      setData([...records]);
    };
    loadData();
  }, []);

  const handleGoBack = () => {
    if (navigation && navigation.goBack) {
      navigation.goBack();
    } else if (onBack) {
      onBack();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        
        <Text style={styles.headerTitle}>LỊCH SỬ ĐO</Text>

        <ScrollView 
          style={styles.listContainer} 
          contentContainerStyle={styles.listContent}
          indicatorStyle="black"
        >
          {data.length === 0 ? (
            <Text style={styles.emptyText}>Chưa có dữ liệu</Text>
          ) : (
            data.map((item, index) => (
              <View key={index} style={styles.historyItem}>
                <View style={styles.itemHeader}>
                    <Text style={styles.dateText}>{item.timestamp}</Text>
                    <Text style={styles.typeIcon}>{item.type === 'HEALTH' ? '❤️' : '🏃'}</Text>
                </View>
                
                {item.type === 'HEALTH' ? (
                  <View style={styles.itemBody}>
                      <Text style={styles.resMain}>{item.heartRate} <Text style={styles.unit}>BPM</Text></Text>
                      <Text style={styles.resSub}>SpO2: {item.spO2}%</Text>
                  </View>
                ) : (
                  <View style={styles.itemBody}>
                      <Text style={styles.resMain}>{item.steps} <Text style={styles.unit}>bước</Text></Text>
                      <Text style={styles.resSub}>{item.calories} cal - {item.duration}</Text>
                  </View>
                )}
              </View>
            ))
          )}
        </ScrollView>

        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Text style={styles.backText}>Quay lại</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  card: { width: 192, height: 192, borderRadius: 96, backgroundColor: '#E6F7FF', alignItems: 'center', paddingTop: 15, overflow: 'hidden' },
  headerTitle: { fontSize: 11, fontWeight: 'bold', color: '#003366', marginBottom: 5 },
  listContainer: { width: '100%', flex: 1 },
  listContent: { alignItems: 'center', paddingBottom: 10, paddingHorizontal: 15 },
  historyItem: { width: 150, backgroundColor: '#fff', borderRadius: 8, padding: 8, marginBottom: 6, elevation: 1 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  dateText: { fontSize: 9, color: '#888' },
  typeIcon: { fontSize: 9 },
  itemBody: { alignItems: 'center' },
  resMain: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  unit: { fontSize: 9, fontWeight: 'normal', color: '#666' },
  resSub: { fontSize: 10, color: '#555' },
  emptyText: { fontSize: 11, color: '#999', fontStyle: 'italic', marginTop: 40 },
  backButton: { paddingVertical: 8, width: '100%', alignItems: 'center', backgroundColor: '#D0EBFF', borderTopWidth: 1, borderTopColor: '#C1E1FF' },
  backText: { fontSize: 11, color: '#003366', fontWeight: '600' }
});

export default HistoryScreen;