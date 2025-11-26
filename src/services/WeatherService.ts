
const API_KEY = 'c0930196bf59254845917989db64a4e3';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

export const WeatherService = {
  getWeatherByCity: async (city: string = 'Ho Chi Minh City') => {
    try {
      const url = `${BASE_URL}?q=${encodeURIComponent(city)}&units=metric&lang=vi&appid=${API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.cod && Number(data.cod) !== 200) {
        throw new Error(data.message);
      }

      if (response.ok) {
        return {
          temp: Math.round(data.main.temp),
          city: data.name,
          desc: data.weather[0].description,
          humidity: data.main.humidity,
          windSpeed: data.wind.speed,
          // THÊM DÒNG NÀY: Lấy mã icon (ví dụ: "10d" là mưa)
          icon: data.weather[0].icon, 
        };
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      throw error;
    }
  },
};