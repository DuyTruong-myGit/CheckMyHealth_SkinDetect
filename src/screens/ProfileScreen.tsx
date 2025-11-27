import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useDataSync } from '../hooks/useDataSync'; // Tạm thời comment hook thật

const ProfileScreen = ({ navigation }: { navigation: any }) => {
  const [deviceId, setDeviceId] = useState<string>('...');
  
  // --- PHẦN GIẢ LẬP STATE ---
  const [isSyncing, setIsSyncing] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false); // Thêm state trạng thái kết nối

  useEffect(() => {
    const getID = async () => {
      // Giả lập ID cố định cho đẹp
      setDeviceId('888'); 
    };
    getID();
  }, []);

  // Hàm giả lập hành động kết nối
  const simulateConnection = () => {
    if (isConnected) return; // Nếu đang kết nối rồi thì thôi

    setIsSyncing(true); // 1. Bật trạng thái đang xoay xoay...
    
    // 2. Sau 2 giây sẽ giả vờ kết nối thành công
    setTimeout(() => {
        setIsSyncing(false); // Tắt xoay
        setUserName("Nguyễn Văn A"); // Cập nhật tên người dùng giả
        setIsConnected(true); // Đánh dấu là đã online
    }, 2000);
  };

  // Hàm giả lập hủy kết nối
  const simulateDisconnect = () => {
      setUserName(null);
      setIsConnected(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.headerTitle}>HỒ SƠ THIẾT BỊ</Text>
        
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Vòng tròn ID đổi màu khi kết nối */}
            <View style={[styles.idCircle, isConnected ? styles.idCircleLinked : {}]}>
                <Text style={styles.label}>ID KẾT NỐI</Text>
                <Text style={styles.idValue}>#{deviceId}</Text>
                {/* Đổi chữ Offline -> Online màu xanh */}
                <Text style={[styles.statusTag, isConnected ? {color: '#30D158'} : {color: '#999'}]}>
                    {isConnected ? '● Online' : '○ Offline'}
                </Text>
            </View>

            <View style={styles.infoBox}>
            {userName ? (
                <>
                    <Text style={{fontSize:8, color:'#666'}}>Đã liên kết với:</Text>
                    <Text style={styles.userName} numberOfLines={1}>{userName}</Text>
                    <Text style={{fontSize:8, color:'#30D158', fontStyle:'italic'}}>Đang đồng bộ...</Text>
                </>
            ) : (
                <Text style={styles.waitingText}>Chưa liên kết ĐT</Text>
            )}
            </View>

            {/* Nút bấm để test */}
            <TouchableOpacity 
                style={[styles.syncButton, isSyncing && styles.disabledBtn, isConnected && styles.connectedBtn]} 
                onPress={simulateConnection}
                disabled={isSyncing || isConnected}
            >
            {isSyncing ? (
                <ActivityIndicator color="white" size="small" />
            ) : (
                <Text style={styles.syncText}>
                    {isConnected ? "ĐÃ KẾT NỐI ✅" : "MÔ PHỎNG KẾT NỐI 🔌"}
                </Text>
            )}
            </TouchableOpacity>

            {/* Nút hủy kết nối giả lập */}
            {isConnected && (
                <TouchableOpacity onPress={simulateDisconnect} style={{padding: 5}}>
                    <Text style={styles.linkActionText}>Hủy kết nối (Test)</Text>
                </TouchableOpacity>
            )}
        </ScrollView>

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  card: { width: 192, height: 192, borderRadius: 96, backgroundColor: '#E6F7FF', alignItems: 'center', paddingTop: 10, overflow: 'hidden' },
  headerTitle: { fontSize: 9, fontWeight: 'bold', color: '#003366', marginBottom: 2 },
  scrollContent: { alignItems: 'center', paddingBottom: 10, width: 160 },

  idCircle: { width: 55, height: 55, borderRadius: 27.5, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#E0E0E0', marginBottom: 3 },
  idCircleLinked: { borderColor: '#30D158', backgroundColor: '#F0FFF4' }, // Viền xanh khi kết nối
  label: { color: '#999', fontSize: 5, fontWeight: '600' },
  idValue: { color: '#333', fontSize: 14, fontWeight: 'bold' },
  statusTag: { fontSize: 6, fontWeight: '600' },

  infoBox: { alignItems: 'center', marginBottom: 3, minHeight: 25, justifyContent: 'center' },
  userName: { color: '#007AFF', fontSize: 11, fontWeight: 'bold' },
  waitingText: { color: '#888', fontSize: 8, fontStyle: 'italic' },

  syncButton: { backgroundColor: '#007AFF', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 15, minWidth: 100, alignItems: 'center', marginBottom: 3 },
  disabledBtn: { backgroundColor: '#A0A0A0' },
  connectedBtn: { backgroundColor: '#30D158' }, // Nút chuyển xanh lá khi xong
  syncText: { color: 'white', fontWeight: 'bold', fontSize: 7 },
  
  linkActionText: { color: '#FF3B30', fontSize: 7, textDecorationLine: 'underline' },

  backButton: { 
    marginTop: 'auto', 
    paddingVertical: 8, 
    width: '100%', 
    alignItems: 'center', 
    backgroundColor: '#D0EBFF', 
    borderTopWidth: 1, 
    borderTopColor: '#C1E1FF' 
  },
  backButtonText: { fontSize: 10, color: '#003366', fontWeight: '600' }
});

export default ProfileScreen;