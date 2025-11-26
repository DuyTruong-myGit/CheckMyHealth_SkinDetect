import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { WeatherService } from '../services/WeatherService';

interface WeatherData {
  temp: number;
  city: string;
  desc: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

const WeatherScreen = ({ navigation, onBack }: { navigation?: any, onBack?: () => void }) => {
  
  const [weather, setWeather] = useState<WeatherData>({
    temp: 0,
    city: 'Đang tải...',
    desc: '',
    humidity: 0,
    windSpeed: 0,
    icon: '01d',
  });

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchWeather = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const data = await WeatherService.getWeatherByCity('Ho Chi Minh City');
      setWeather(data);
    } catch (error) {
      console.error(error);
      setErrorMsg('Lỗi kết nối');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  const handleGoBack = () => {
    if (navigation && navigation.goBack) {
      navigation.goBack();
    } else if (onBack) {
      onBack();
    }
  };

  const formatCityName = (name: string) => {
    return name.replace('Thành phố ', '').replace('Tỉnh ', '');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    // QUAY VỀ SỬ DỤNG VIEW (Không cuộn)
    <View style={styles.container}>
      <View style={styles.card}>
        
        {/* 1. Tiêu đề */}
        <Text style={styles.headerTitle}>THỜI TIẾT</Text>

        {/* 2. Tên thành phố */}
        <Text style={styles.cityText}>{formatCityName(weather.city)}</Text>

        {/* 3. Cụm Icon + Nhiệt độ */}
        <View style={styles.tempContainer}>
            <Image 
              source={{ uri: `https://openweathermap.org/img/wn/${weather.icon}@2x.png` }}
              style={styles.weatherIcon}
            />
            <Text style={styles.tempText}>{weather.temp}°</Text>
        </View>

        {/* 4. Mô tả */}
        <Text style={styles.descText}>
          {weather.desc.charAt(0).toUpperCase() + weather.desc.slice(1)}
        </Text>

        <View style={styles.divider} />

        {/* 5. Thông tin chi tiết (Độ ẩm/Gió) */}
        <View style={styles.detailsContainer}>
          <View style={styles.infoBox}>
            <Text style={styles.emoji}>💧</Text>
            <Text style={styles.value}>{weather.humidity}%</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.emoji}>💨</Text>
            <Text style={styles.value}>{weather.windSpeed} m/s</Text>
          </View>
        </View>

        {/* 6. Nút Quay lại (Nằm gọn trong hình tròn) */}
        <TouchableOpacity 
          onPress={errorMsg ? fetchWeather : handleGoBack} 
          style={styles.footerButton}
          activeOpacity={0.6}
        >
          <Text style={styles.footerText}>
            {errorMsg ? "↻ Thử lại" : "Quay lại"}
          </Text>
        </TouchableOpacity>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000', // Nền đen bao quanh
  },
  card: {
    width: 192,  // Kích thước cố định cho đồng hồ
    height: 192,
    borderRadius: 96, // Bo tròn hoàn hảo
    backgroundColor: '#fff',
    alignItems: 'center',
    // Căn giữa nội dung theo chiều dọc, phân bổ đều khoảng trống
    justifyContent: 'center', 
    paddingVertical: 5, // Padding nhỏ để nội dung sát mép hơn nhưng vẫn an toàn
  },
  headerTitle: {
    fontSize: 9,
    color: '#007AFF',
    fontWeight: 'bold',
    marginTop: 8, // Đẩy xuống một chút khỏi mép trên cùng
    marginBottom: 0,
  },
  cityText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 0,
  },
  tempContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -4, // Kéo các phần tử lại gần nhau hơn
    marginBottom: -4,
  },
  weatherIcon: {
    width: 46, // Kích thước vừa vặn
    height: 46,
  },
  tempText: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#FF9500',
    marginLeft: -2,
  },
  descText: {
    fontSize: 10,
    color: '#666',
    marginBottom: 3,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingHorizontal: 10, // Tránh chữ dài chạm mép cong
  },
  divider: {
    width: '40%',
    height: 1,
    backgroundColor: '#eee',
    marginBottom: 3,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 4,
  },
  infoBox: {
    alignItems: 'center',
    width: 50, // Cố định chiều rộng để cân đối
  },
  emoji: {
    fontSize: 12,
    marginBottom: 0,
  },
  value: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#333',
  },
  footerButton: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginBottom: 8, // Đẩy lên khỏi mép dưới cùng
  },
  footerText: {
    fontSize: 10,
    color: '#555',
    fontWeight: '600',
  }
});

export default WeatherScreen;