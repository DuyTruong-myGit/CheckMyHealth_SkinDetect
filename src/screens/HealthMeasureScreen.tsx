import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppContext } from '../context/AppContext'; 

const HealthMeasureScreen = ({ navigation }: { navigation: any }) => {
  const { isHealthMeasuring, healthData, toggleHealthMeasure } = useAppContext();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        
        {/* [ĐÃ SỬA] Chữ to hơn */}
        <Text style={styles.headerTitle}>ĐO SỨC KHỎE</Text>

        {/* [ĐÃ SỬA] Các icon to ra và căn giữa */}
        <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
                <Text style={styles.metricIcon}>💧</Text>
                <Text style={[styles.metricValue, {color: '#3498db'}]}>{healthData.spO2}</Text>
                <Text style={styles.metricLabel}>%SpO2</Text>
            </View>

            {/* Nhịp tim ở giữa to nhất */}
            <View style={[styles.metricItem, {transform: [{scale: 1.2}]}]}>
                <Text style={styles.metricIcon}>❤️</Text>
                <Text style={[styles.metricValue, {color: '#e74c3c'}]}>{healthData.heartRate}</Text>
                <Text style={styles.metricLabel}>BPM</Text>
            </View>

            <View style={styles.metricItem}>
                <Text style={styles.metricIcon}>⚡</Text>
                <Text style={[styles.metricValue, {color: '#f1c40f'}]}>{healthData.stress}</Text>
                <Text style={styles.metricLabel}>Stress</Text>
            </View>
        </View>

        {/* [ĐÃ SỬA] Nút đo hạ thấp xuống */}
        <View style={styles.buttonContainer}>
            <TouchableOpacity 
                style={[styles.mainButton, isHealthMeasuring ? styles.stopButton : styles.startButton]} 
                onPress={toggleHealthMeasure}
                activeOpacity={0.7}
            >
                <Text style={styles.mainButtonText}>
                    {isHealthMeasuring ? "Dừng & Lưu" : "Đo ngay"}
                </Text>
            </TouchableOpacity>
        </View>

        {/* [ĐÃ SỬA] Sửa lỗi hiển thị chữ Quay lại */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>QUAY LẠI</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  
  card: { 
    width: 192, height: 192, borderRadius: 96, 
    backgroundColor: '#E6F7FF', 
    alignItems: 'center', 
    paddingTop: 18, // Tăng padding top để đẩy nội dung xuống
    overflow: 'hidden' 
  },
  
  // [ĐÃ SỬA] Tăng cỡ chữ tiêu đề
  headerTitle: { 
    fontSize: 12, 
    fontWeight: '900', 
    color: '#003366', 
    marginBottom: 8, // Tăng khoảng cách dưới tiêu đề
    letterSpacing: 0.5 
  },
  
  metricsRow: { 
    flexDirection: 'row', 
    justifyContent: 'center', // Căn giữa row
    width: '100%', 
    paddingHorizontal: 5, 
    marginBottom: 12, // Tăng khoảng cách với nút đo
    gap: 10 // Khoảng cách giữa các icon
  },
  
  metricItem: { alignItems: 'center', width: 50 },
  
  // [ĐÃ SỬA] Tăng kích thước icon và số
  metricIcon: { fontSize: 16, marginBottom: 0 },
  metricValue: { fontSize: 24, fontWeight: 'bold', lineHeight: 28 },
  metricLabel: { fontSize: 9, color: '#555', fontWeight: '600', marginTop: 0 },
  
  buttonContainer: { 
    alignItems: 'center', 
    width: '100%', 
    justifyContent: 'center',
    marginBottom: 5
  },
  
  mainButton: { 
    paddingVertical: 7, // Nút cao hơn chút
    paddingHorizontal: 22, 
    borderRadius: 20, 
    minWidth: 100, 
    alignItems: 'center', 
    elevation: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 2
  },
  startButton: { backgroundColor: '#2ecc71' },
  stopButton: { backgroundColor: '#e74c3c' },
  mainButtonText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  
  // [ĐÃ SỬA] Cố định nút quay lại ở đáy, tăng chiều cao để chữ không bị cắt
  backButton: { 
    position: 'absolute', 
    bottom: 0,
    width: '100%', 
    paddingVertical: 10, // Tăng padding để dễ bấm và hiện đủ chữ
    alignItems: 'center', 
    backgroundColor: '#D0EBFF', 
    borderTopWidth: 1, 
    borderTopColor: '#C1E1FF' 
  },
  backButtonText: { fontSize: 10, color: '#003366', fontWeight: 'bold' }
});

export default HealthMeasureScreen;