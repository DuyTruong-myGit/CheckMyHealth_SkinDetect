import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { DataService, HealthRecord } from '../services/DataService';

const HistoryScreen = ({ navigation }: { navigation?: any }) => {
  const [data, setData] = useState<HealthRecord[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const records = await DataService.getRecords();
      setData([...records]);
    };
    loadData();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        
        <Text style={styles.headerTitle}>LỊCH SỬ ĐO</Text>

        <ScrollView 
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {data.length === 0 ? (
            <Text style={styles.emptyText}>Chưa có dữ liệu</Text>
          ) : (
            data.map((item, index) => (
              <View key={index} style={[styles.historyItem, item.type === 'WORKOUT' ? styles.workoutBg : styles.healthBg]}>
                
                {/* Dòng tiêu đề: Thời gian + Loại */}
                <View style={styles.itemHeader}>
                    <Text style={styles.dateText}>{item.timestamp}</Text>
                    <Text style={styles.typeText}>
                        {item.type === 'HEALTH' ? 'SỨC KHỎE' : 'LUYỆN TẬP'}
                    </Text>
                </View>
                
                <View style={styles.divider} />

                {/* Nội dung chi tiết */}
                <View style={styles.itemBody}>
                    {item.type === 'HEALTH' ? (
                      // Hiển thị 3 chỉ số Sức khỏe
                      <View style={styles.statsRow}>
                          <View style={styles.statCol}>
                             <Text style={styles.icon}>❤️</Text>
                             <Text style={styles.val}>{item.heartRate}</Text>
                          </View>
                          <View style={styles.statCol}>
                             <Text style={styles.icon}>💧</Text>
                             <Text style={styles.val}>{item.spO2}%</Text>
                          </View>
                          <View style={styles.statCol}>
                             <Text style={styles.icon}>⚡</Text>
                             <Text style={styles.val}>{item.stress}</Text>
                          </View>
                      </View>
                    ) : (
                      // Hiển thị 3 chỉ số Luyện tập
                      <View style={styles.statsRow}>
                          <View style={styles.statCol}>
                             <Text style={styles.icon}>👣</Text>
                             <Text style={styles.val}>{item.steps}</Text>
                          </View>
                          <View style={styles.statCol}>
                             <Text style={styles.icon}>🔥</Text>
                             <Text style={styles.val}>{item.calories}</Text>
                          </View>
                          <View style={styles.statCol}>
                             <Text style={styles.icon}>⏱️</Text>
                             <Text style={styles.valTime}>{item.duration}</Text>
                          </View>
                      </View>
                    )}
                </View>
              </View>
            ))
          )}
          {/* View đệm để không bị che bởi nút quay lại */}
          <View style={{height: 40}} />
        </ScrollView>

        {/* Nút Quay lại chuẩn style mới */}
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
  headerTitle: { fontSize: 10, fontWeight: 'bold', color: '#003366', marginBottom: 5 },
  
  listContent: { alignItems: 'center', paddingHorizontal: 10, width: 160 },
  
  historyItem: { width: '100%', borderRadius: 8, padding: 6, marginBottom: 5, elevation: 1 },
  healthBg: { backgroundColor: '#FFF' },
  workoutBg: { backgroundColor: '#FFF8E1' }, // Màu vàng nhạt cho luyện tập

  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  dateText: { fontSize: 8, color: '#888' },
  typeText: { fontSize: 8, fontWeight: 'bold', color: '#555' },
  
  divider: { height: 1, backgroundColor: '#EEE', marginBottom: 3 },

  itemBody: {  },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  statCol: { alignItems: 'center', flex: 1 },
  
  icon: { fontSize: 10, marginBottom: 0 },
  val: { fontSize: 11, fontWeight: 'bold', color: '#333' },
  valTime: { fontSize: 9, fontWeight: 'bold', color: '#333' }, // Font nhỏ hơn cho thời gian nếu dài

  emptyText: { fontSize: 10, color: '#999', fontStyle: 'italic', marginTop: 40 },
  
  backButton: { 
    marginTop: 'auto', 
    paddingVertical: 8, 
    width: '100%', 
    alignItems: 'center', 
    backgroundColor: '#D0EBFF', 
    borderTopWidth: 1, 
    borderTopColor: '#C1E1FF' 
  },
  backText: { fontSize: 10, color: '#003366', fontWeight: '600' }
});

export default HistoryScreen;