package com.checkmyhealthwatch; // Đảm bảo package name đúng với dự án của bạn

import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.content.Context;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;

public class HeartRateModule extends ReactContextBaseJavaModule implements SensorEventListener {
    private final ReactApplicationContext reactContext;
    private SensorManager sensorManager;
    private Sensor heartRateSensor;

    public HeartRateModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        this.sensorManager = (SensorManager) reactContext.getSystemService(Context.SENSOR_SERVICE);
        this.heartRateSensor = sensorManager.getDefaultSensor(Sensor.TYPE_HEART_RATE);
    }

    @Override
    public String getName() {
        return "HeartRateModule";
    }

    // Hàm gửi sự kiện sang React Native
    private void sendEvent(String eventName, int heartRate) {
        WritableMap params = Arguments.createMap();
        params.putInt("heartRate", heartRate);
        
        // Giả lập thêm SpO2 và Stress vì Sensor thật chỉ trả về Tim
        // Trong thực tế SpO2 cần cảm biến khác, ở đây ta tính toán tương đối để demo
        params.putInt("spO2", 95 + (int)(Math.random() * 4)); 
        params.putInt("stress", 10 + (int)(Math.random() * 20));

        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            .emit(eventName, params);
    }

    @ReactMethod
    public void startMonitoring() {
        if (heartRateSensor != null) {
            sensorManager.registerListener(this, heartRateSensor, SensorManager.SENSOR_DELAY_NORMAL);
        } else {
            // Nếu máy không có cảm biến (máy ảo), ta gửi dữ liệu giả lập để không bị crash
            // Đây là fallback mode
            new Thread(() -> {
                try {
                    while(true) {
                        Thread.sleep(1000);
                        int mockHeartRate = 60 + (int)(Math.random() * 40);
                        sendEvent("HeartRateUpdate", mockHeartRate);
                    }
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }).start();
        }
    }

    @ReactMethod
    public void stopMonitoring() {
        if (heartRateSensor != null) {
            sensorManager.unregisterListener(this);
        }
    }

    @Override
    public void onSensorChanged(SensorEvent event) {
        if (event.sensor.getType() == Sensor.TYPE_HEART_RATE) {
            int heartRate = (int) event.values[0];
            sendEvent("HeartRateUpdate", heartRate);
        }
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) {
        // Không cần xử lý
    }
}