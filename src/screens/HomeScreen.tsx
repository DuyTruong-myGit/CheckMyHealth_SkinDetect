import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDataSync } from '../hooks/useDataSync';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppContext } from '../context/AppContext'; // [QUAN TRỌNG] Import Context

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }: { navigation: any }) => {
  const [deviceId, setDeviceId] = useState('...');
  
  // [MỚI] Lấy trạng thái đang chạy từ Context
  const { isHealthMeasuring, isWorkoutRunning } = useAppContext();
  
  const { syncData } = useDataSync(deviceId);

  useEffect(() => {
    const initApp = async () => {
        const id = await AsyncStorage.getItem('MY_DEVICE_ID');
        if (id) {
            setDeviceId(id);
            console.log("Auto-syncing data...");
            syncData(); 
        }
    };
    initApp();
  }, []);

  return (
    <View style={styles.mainContainer}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
           <Text style={styles.headerTitle}>CHECKMYHEALTH</Text>
           <Text style={styles.subHeader}>Xin chào,</Text>
        </View>
        
        {/* Đã bỏ hoàn toàn thông báo "Chưa đo" để màn hình gọn gàng */}
        <View style={{marginBottom: 5}} />

        <View style={styles.gridContainer}>
          {/* Hàng 1 */}
          <View style={styles.row}>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('HealthMeasure')}>
              <View style={styles.iconCircle}>
                 <Text style={{fontSize: 22}}>❤️</Text> 
                 {/* [MỚI] Chấm xanh báo đang đo Sức khỏe */}
                 {isHealthMeasuring && <View style={styles.activeDot} />}
              </View>
              <Text style={styles.menuText}>Sức khỏe</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Workout')}>
              <View style={styles.iconCircle}>
                 <Text style={{fontSize: 22}}>🏃</Text> 
                 {/* [MỚI] Chấm xanh báo đang Luyện tập */}
                 {isWorkoutRunning && <View style={styles.activeDot} />}
              </View>
              <Text style={styles.menuText}>Luyện tập</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('History')}>
              <View style={styles.iconCircle}>
                 <Text style={{fontSize: 22}}>📅</Text> 
              </View>
              <Text style={styles.menuText}>Lịch sử</Text>
            </TouchableOpacity>
          </View>

          {/* Hàng 2 */}
          <View style={styles.row}>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Analysis')}>
              <View style={styles.iconCircle}>
                 <Text style={{fontSize: 22}}>📊</Text> 
              </View>
              <Text style={styles.menuText}>Phân tích</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Weather')}>
              <View style={styles.iconCircle}>
                 <Text style={{fontSize: 22}}>☁️</Text> 
              </View>
              <Text style={styles.menuText}>Thời tiết</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Profile')}>
              <View style={styles.iconCircle}>
                 <Text style={{fontSize: 22}}>👤</Text> 
              </View>
              <Text style={styles.menuText}>Hồ sơ</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={{height: 10}} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#E6F2FF' },
  scrollContent: { alignItems: 'center', paddingTop: 12, paddingBottom: 10 },
  
  headerContainer: { alignItems: 'center', marginBottom: 2, width: '100%' },
  headerTitle: { 
    color: '#003366', fontSize: 11, fontWeight: '900', letterSpacing: 0.5, textAlign: 'center'
  },
  subHeader: { 
    color: '#888', fontSize: 9, fontStyle: 'italic', marginBottom: 2, textAlign: 'center'
  },
  
  gridContainer: { width: width * 0.85, alignItems: 'center' },
  
  row: { flexDirection: 'row', justifyContent: 'space-evenly', width: '100%', marginBottom: 4 },
  
  menuItem: { alignItems: 'center', width: 48 },
  
  iconCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 2,
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1,
    position: 'relative' // Quan trọng để đặt chấm xanh
  },
  menuText: { color: '#003366', fontSize: 7, fontWeight: '600' },

  // [ĐOẠN STYLE ĐƯỢC THÊM VÀO]
  activeDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#30D158', // Màu xanh lá sáng
    borderWidth: 1.5,
    borderColor: '#FFF',
    zIndex: 10,
    elevation: 4
  }
});

export default HomeScreen;