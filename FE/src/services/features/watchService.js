import { apiClient } from '../api/apiClient.js'

/**
 * Lịch sử đo lường từ smartwatch
 */
export const getWatchMeasurements = async (limit = 100) => {
  return await apiClient(`/api/watch/measurements?limit=${limit}`, {
    method: 'GET',
  })
}

/**
 * Dữ liệu đo lường hôm nay
 */
export const getWatchToday = async () => {
  return await apiClient('/api/watch/measurements/today', {
    method: 'GET',
  })
}

/**
 * Thống kê dữ liệu đo lường
 * period: today | week | month | all
 */
export const getWatchStats = async (period = 'all') => {
  return await apiClient(`/api/watch/measurements/stats?period=${period}`, {
    method: 'GET',
  })
}


