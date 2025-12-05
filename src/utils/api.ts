import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_URL = 'https://checkmyhealth-api.onrender.com/api'; 

export const getHeaders = async (isMultipart = false) => {
  const token = await AsyncStorage.getItem('USER_TOKEN');
  const headers: any = {
    'Authorization': token ? `Bearer ${token}` : '',
  };
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};