import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { WeatherService } from '../services/WeatherService';

interface WeatherData {
  temp: number;
  city: string;
  desc: string;
  humidity: number;
  windSpeed: number;
}

const WeatherScreen = ({ navigation }: { navigation?: any }) => {
  const [weather, setWeather] = useState<WeatherData>({
    temp: 0,
    city: 'Đang tải...',
    desc: '',
    humidity: 0,
    windSpeed: 0,
  });

  const [loading, setLoading] = useState(true);

  const fetchWeather = async () => {
    try {
      setLoading(true);
      const data = await WeatherService.getWeatherByCity('Ho Chi Minh City');
      setWeather(data);
    } catch (error) {
      setWeather(prev => ({ ...prev, city: 'Lỗi kết nối' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  const formatCityName = (name: string) => {
    // Rút gọn tên để hiển thị to hơn không bị tràn
    return name.replace('Thành phố ', '').replace('Tỉnh ', '');
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        
        {/* 1. Tên thành phố (Đưa lên trên cùng) */}
        <Text style={styles.cityText} numberOfLines={1}>
          {formatCityName(weather.city)}
        </Text>

        {/* 2. Nhiệt độ + Icon (Phóng to hết cỡ) */}
        <View style={styles.mainContent}>
            <Text style={styles.thermometerIcon}>🌡️</Text>
            <Text style={styles.tempText}>{weather.temp}°C</Text>
        </View>

        {/* 3. Mô tả thời tiết */}
        <Text style={styles.descText}>
          {weather.desc ? weather.desc.charAt(0).toUpperCase() + weather.desc.slice(1) : ''}
        </Text>

        {/* 4. Chi tiết (Ghi rõ chữ Độ ẩm / Gió) */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>💧 Độ ẩm:</Text>
            <Text style={styles.detailValue}>{weather.humidity}%</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>💨 Gió:</Text>
            <Text style={styles.detailValue}>{weather.windSpeed} m/s</Text>
          </View>
        </View>

        {/* 5. Nút Quay lại (Giữ nguyên style chuẩn) */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  card: { width: 192, height: 192, borderRadius: 96, backgroundColor: '#E6F7FF', alignItems: 'center', paddingTop: 18, overflow: 'hidden' },
  
  // Tăng cỡ chữ thành phố
  cityText: { fontSize: 14, fontWeight: '900', color: '#003366', marginBottom: 2, textAlign: 'center', width: '90%' },
  
  // Cụm nhiệt độ to
  mainContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  thermometerIcon: { fontSize: 32, marginRight: 5 }, 
  tempText: { fontSize: 36, fontWeight: 'bold', color: '#FF9500', includeFontPadding: false }, // Font cực to
  
  descText: { fontSize: 11, color: '#555', fontStyle: 'italic', marginBottom: 8, fontWeight: '500' },
  
  // Container chi tiết
  detailsContainer: { width: '80%', alignItems: 'center', marginBottom: 5 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', width: '90%', marginBottom: 2 },
  detailLabel: { fontSize: 10, color: '#666' },
  detailValue: { fontSize: 10, fontWeight: 'bold', color: '#333' },

  backButton: { 
    marginTop: 'auto', 
    paddingVertical: 8, 
    width: '100%', 
    alignItems: 'center', 
    backgroundColor: '#D0EBFF', 
    borderTopWidth: 1, 
    borderTopColor: '#C1E1FF' 
  },
  backButtonText: { fontSize: 11, color: '#003366', fontWeight: 'bold' }
});

export default WeatherScreen;