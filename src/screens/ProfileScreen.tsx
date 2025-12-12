import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDataSync } from '../hooks/useDataSync';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ProfileScreen = ({ navigation }: { navigation: any }) => {
  const [deviceId, setDeviceId] = useState<string>('...');
  const { isSyncing, syncStatus, userName, syncData, resetLink } = useDataSync(deviceId);
  
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const getID = async () => {
      let id = await AsyncStorage.getItem('MY_DEVICE_ID');
      if (!id || id.length < 3) {
        id = Math.floor(100 + Math.random() * 900).toString();
        await AsyncStorage.setItem('MY_DEVICE_ID', id);
      }
      setDeviceId(id);
    };
    getID();
  }, []);

  useEffect(() => {
    if (syncStatus === 'SUCCESS' || syncStatus === 'ERROR') {
        setShowToast(true);
        const timer = setTimeout(() => {
            setShowToast(false);
        }, 1500); 
        return () => clearTimeout(timer);
    }
  }, [syncStatus]);
  
  return (
    <View style={styles.mainWrapper}>
      <ScrollView 
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.header}>HỒ SƠ THIẾT BỊ</Text>
        
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

        {userName && (
          <TouchableOpacity onPress={resetLink} style={styles.linkAction}>
             <Text style={styles.linkActionText}>Hủy liên kết</Text>
          </TouchableOpacity>
        )}
        
        <View style={{height: 60}} /> 
      </ScrollView>

      {showToast && (
        <View style={styles.toastOverlay}>
            <View style={styles.toastBox}>
                <Text style={styles.toastText}>
                    {syncStatus === 'SUCCESS' ? 'Đã đồng bộ!' : 'Lỗi kết nối!'}
                </Text>
            </View>
        </View>
      )}

      <TouchableOpacity 
          style={styles.backBtn} 
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
      >
        <Text style={styles.backText}>Quay lại</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  mainWrapper: { flex: 1, backgroundColor: '#E6F2FF' },
  container: { alignItems: 'center', paddingTop: 15, paddingHorizontal: 10 },
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

  toastOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)', 
    zIndex: 999, 
  },
  toastBox: {
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    minWidth: 100
  },
  toastText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center'
  },

  backBtn: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0,
    paddingVertical: 10, 
    alignItems: 'center', 
    backgroundColor: '#D0EBFF', 
    borderTopWidth: 1, 
    borderTopColor: '#C1E1FF',
    elevation: 5
  },
  backText: { color: '#003366', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
});

export default ProfileScreen;