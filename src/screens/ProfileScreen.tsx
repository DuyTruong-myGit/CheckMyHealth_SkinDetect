import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDataSync } from '../hooks/useDataSync';

const ProfileScreen = ({ onBack }: { onBack: () => void }) => {
  const [deviceId, setDeviceId] = useState<string>('...');
  const { isSyncing, syncStatus, userName, syncData, resetLink } = useDataSync(deviceId);

  useEffect(() => {
    const getID = async () => {
      const id = await AsyncStorage.getItem('MY_DEVICE_ID');
      if (id) setDeviceId(id);
    };
    getID();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>HỒ SƠ THIẾT BỊ</Text>
      
      {/* ID Card */}
      <View style={[styles.idCircle, userName ? styles.idCircleLinked : {}]}>
        <Text style={styles.label}>ID KẾT NỐI</Text>
        <Text style={styles.idValue}>#{deviceId}</Text>
        <Text style={styles.statusTag}>
          {userName ? '● Online' : '○ Offline'}
        </Text>
      </View>

      <View style={styles.infoBox}>
        {userName ? (
          <>
            <Text style={styles.linkedTitle}>ĐÃ KẾT NỐI VỚI</Text>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.phoneIcon}>📱 iPhone 15 Pro</Text>
          </>
        ) : (
          <Text style={styles.waitingText}>Chưa liên kết điện thoại</Text>
        )}
      </View>

      <TouchableOpacity 
        style={[styles.syncButton, isSyncing && styles.disabledBtn]} 
        onPress={syncData}
        disabled={isSyncing}
      >
        {isSyncing ? (
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
            <ActivityIndicator color="white" size="small" />
            <Text style={styles.syncText}>ĐANG KẾT NỐI...</Text>
          </View>
        ) : (
          <Text style={styles.syncText}>
            {userName ? "ĐỒNG BỘ DỮ LIỆU ☁️" : "TÌM ĐIỆN THOẠI 🔍"}
          </Text>
        )}
      </TouchableOpacity>

      {userName && (
        <TouchableOpacity onPress={resetLink} style={{marginTop: 5}}>
           <Text style={{color: '#888', fontSize: 8}}>Hủy liên kết (Test)</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backText}>Quay lại</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#E6F2FF', // Nền xanh nhạt
    alignItems: 'center',
    paddingVertical: 10,
  },
  header: {
    color: '#00509E',
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 8,
    letterSpacing: 1,
  },
  idCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF', // Nền trắng
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#E0E0E0', // Viền xám nhạt
    marginBottom: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
  },
  idCircleLinked: {
    borderColor: '#30D158', // Viền xanh lá khi active
    backgroundColor: '#F0FFF4', // Nền xanh lá siêu nhạt
  },
  label: {
    color: '#999',
    fontSize: 7,
    fontWeight: '600',
  },
  idValue: {
    color: '#333', // Số màu đen
    fontSize: 20,
    fontWeight: 'bold',
  },
  statusTag: {
    fontSize: 8,
    color: '#30D158',
    marginTop: 2,
    fontWeight: '600',
  },
  infoBox: {
    minHeight: 40,
    alignItems: 'center',
    marginBottom: 10,
  },
  linkedTitle: {
    color: '#888',
    fontSize: 8,
  },
  userName: {
    color: '#007AFF', // Tên màu xanh dương chuẩn iOS
    fontSize: 14,
    fontWeight: 'bold',
    marginVertical: 2,
  },
  phoneIcon: {
    color: '#666',
    fontSize: 9,
  },
  waitingText: {
    color: '#888',
    fontSize: 10,
    fontStyle: 'italic',
    marginTop: 5,
  },
  syncButton: {
    backgroundColor: '#007AFF', // Nút màu xanh dương tươi
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    width: '85%',
    alignItems: 'center',
    marginBottom: 5,
    elevation: 3,
  },
  disabledBtn: {
    backgroundColor: '#A0A0A0',
  },
  syncText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 10,
  },
  backBtn: {
    padding: 5,
    marginTop: 5,
  },
  backText: {
    color: '#666',
    fontSize: 10,
  },
});

export default ProfileScreen;