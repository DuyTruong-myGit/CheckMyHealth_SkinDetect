import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// ...existing code...
const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          // animation: 'fade_from_bottom', // <-- loại bỏ hoặc thay bằng 'default' nếu gây lỗi
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        // ...existing code...
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;