import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_URL = 'http://10.0.2.2:3000/api'; 

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