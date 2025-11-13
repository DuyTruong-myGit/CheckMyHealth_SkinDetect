import { apiClient } from './apiClient.js'

/**
 * Chẩn đoán bệnh da qua hình ảnh
 * @param {File} imageFile - File ảnh cần chẩn đoán
 * @returns {Promise<Object>} Kết quả chẩn đoán
 */
export const diagnose = async (imageFile) => {
  try {
    // Tạo FormData để upload file
    const formData = new FormData()
    formData.append('image', imageFile)

    // Lấy token từ localStorage
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('Bạn cần đăng nhập để sử dụng tính năng này')
    }

    // Gọi API với FormData (không set Content-Type, browser sẽ tự set với boundary)
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/diagnose`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Không set Content-Type, browser sẽ tự động thêm boundary cho multipart/form-data
      },
      body: formData,
    })

    if (!response.ok) {
      let errorMessage
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorData.error || `Request failed with status ${response.status}`
      } catch {
        errorMessage = await response.text() || `Request failed with status ${response.status}`
      }
      
      if (response.status === 401) {
        localStorage.removeItem('token')
        throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
      }
      
      throw new Error(errorMessage)
    }

    return response.json()
  } catch (error) {
    throw new Error(error.message || 'Chẩn đoán thất bại')
  }
}

/**
 * Lấy lịch sử chẩn đoán của người dùng
 * @returns {Promise<Array>} Danh sách lịch sử chẩn đoán
 */
export const getHistory = async () => {
  try {
    const response = await apiClient('/api/diagnose/history', {
      method: 'GET',
    })
    return Array.isArray(response) ? response : []
  } catch (error) {
    if (error.message.includes('401') || error.message.includes('hết hạn')) {
      throw error
    }
    throw new Error(error.message || 'Không thể lấy lịch sử chẩn đoán')
  }
}

