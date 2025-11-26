import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Props = {
  bpm: number;
  isMeasuring: boolean;
};

const HeartRateDisplay = ({ bpm, isMeasuring }: Props) => {
  return (
    <View style={styles.container}>
      {/* Vòng tròn trang trí bên ngoài */}
      <View style={styles.outerCircle}>
        <Text style={styles.value}>
          {isMeasuring ? "..." : bpm > 0 ? bpm : "--"}
        </Text>
        <Text style={styles.unit}>BPM</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  outerCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#32ADE6', // Viền xanh dương
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111', // Nền xám đen nhẹ
  },
  value: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FF453A', // Màu đỏ
  },
  unit: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
    marginTop: -5,
  },
});

export default HeartRateDisplay;