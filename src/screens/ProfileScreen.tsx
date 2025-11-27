import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Import Hook xử lý dữ liệu thật
import { useDataSync } from '../hooks/useDataSync';

const ProfileScreen = ({ navigation, onBack }: { navigation?: any, onBack?: () => void }) => {
  const [deviceId, setDeviceId] = useState<string>('...');
  
  // Sử dụng Hook thật: Lấy trạng thái sync, tên user, và hàm syncData từ logic thực tế
  const { isSyncing, syncStatus, userName, syncData, resetLink } = useDataSync(deviceId);

  useEffect(() => {
    const getID = async () => {
      // Lấy ID thiết bị thật (nếu có lưu) hoặc random
      let id = await AsyncStorage.getItem('MY_DEVICE_ID');
      if (!id) {
        id = Math.floor(Math.random() * 1000).toString();
        await AsyncStorage.setItem('MY_DEVICE_ID', id);
      }
      setDeviceId(id);
    };
    getID();
  }, []);

  // Xử lý hiển thị thông báo khi đồng bộ xong
  useEffect(() => {
    if (syncStatus === 'SUCCESS') {
      Alert.alert("Thành công", "Đã kết nối và đồng bộ dữ liệu lên Server!");
    } else if (syncStatus === 'ERROR') {
      Alert.alert("Lỗi", "Không thể kết nối Server. Vui lòng kiểm tra Wifi/IP.");
    }
  }, [syncStatus]);

  return (
    <View style={styles.mainWrapper}>
      <ScrollView 
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.header}>HỒ SƠ THIẾT BỊ</Text>
        
        {/* Vòng tròn ID: Xanh nếu đã có userName (đã kết nối), Xám nếu chưa */}
        <View style={[styles.idCircle, userName ? styles.idCircleLinked : {}]}>
          <Text style={styles.label}>ID KẾT NỐI</Text>
          <Text style={styles.idValue}>#{deviceId}</Text>
          <Text style={[styles.statusTag, userName ? {color: '#30D158'} : {color: '#999'}]}>
            {userName ? '● Online' : '○ Offline'}
          </Text>
        </View>

        <View style={styles.infoBox}>
          {userName ? (
            <>
              <Text style={styles.linkedTitle}>ĐÃ LIÊN KẾT:</Text>
              <Text style={styles.userName} numberOfLines={1}>{userName}</Text>
            </>
          ) : (
            <Text style={styles.waitingText}>Chưa liên kết ĐT</Text>
          )}
        </View>

        {/* Nút bấm thực hiện hành động thật */}
        <TouchableOpacity 
          style={[styles.syncButton, isSyncing && styles.disabledBtn]} 
          onPress={syncData}
          disabled={isSyncing}
        >
          {isSyncing ? (
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
               <ActivityIndicator color="white" size="small" />
               <Text style={styles.syncText}> ĐANG XỬ LÝ...</Text>
            </View>
          ) : (
            <Text style={styles.syncText}>
              {userName ? "ĐỒNG BỘ DỮ LIỆU ☁️" : "KẾT NỐI & ĐỒNG BỘ 🔗"}
            </Text>
          )}
        </TouchableOpacity>

        {/* Nút hủy liên kết thật */}
        {userName && (
          <TouchableOpacity onPress={resetLink} style={styles.linkAction}>
             <Text style={styles.linkActionText}>Đăng xuất / Hủy</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
            style={styles.backBtn} 
            onPress={onBack || (() => navigation?.goBack())}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
        >
          <Text style={styles.backText}>Quay lại</Text>
        </TouchableOpacity>
        
        <View style={{height: 50}} /> 
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainWrapper: { flex: 1, backgroundColor: '#E6F2FF' },
  container: { alignItems: 'center', paddingTop: 15, paddingHorizontal: 10, paddingBottom: 40 },
  header: { color: '#00509E', fontSize: 9, fontWeight: 'bold', marginBottom: 5, letterSpacing: 0.5 },
  
  idCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#E0E0E0', marginBottom: 5, elevation: 3 },
  idCircleLinked: { borderColor: '#30D158', backgroundColor: '#F0FFF4' },
  
  label: { color: '#999', fontSize: 6, fontWeight: '600', marginBottom: -2 },
  idValue: { color: '#333', fontSize: 16, fontWeight: 'bold', lineHeight: 20 },
  statusTag: { fontSize: 7, fontWeight: '600' },

  infoBox: { alignItems: 'center', marginBottom: 5, minHeight: 25, justifyContent: 'center' },
  linkedTitle: { color: '#888', fontSize: 8 },
  userName: { color: '#007AFF', fontSize: 11, fontWeight: 'bold' },
  waitingText: { color: '#888', fontSize: 9, fontStyle: 'italic' },

  syncButton: { backgroundColor: '#007AFF', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, minWidth: 110, alignItems: 'center', marginBottom: 5, elevation: 2 },
  disabledBtn: { backgroundColor: '#A0A0A0' },
  syncText: { color: 'white', fontWeight: 'bold', fontSize: 8 },

  linkAction: { marginBottom: 5 },
  linkActionText: { color: '#FF3B30', fontSize: 8, textDecorationLine: 'underline' },

  backBtn: { paddingVertical: 6, paddingHorizontal: 25, backgroundColor: '#D0EBFF', borderRadius: 15, marginTop: 5, elevation: 1 },
  backText: { color: '#003366', fontSize: 9, fontWeight: 'bold' },
});

export default ProfileScreen;