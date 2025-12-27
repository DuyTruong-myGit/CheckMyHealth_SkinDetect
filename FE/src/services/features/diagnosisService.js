import { apiClient } from '../api/apiClient.js'
import { API_BASE_URL } from '../../config/api.js'

/**
 * Chuẩn đoán bệnh da qua hình ảnh
 * @param {File} imageFile - File ảnh cần chuẩn đoán
 * @returns {Promise<Object>} Kết quả chuẩn đoán
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
    const response = await fetch(`${API_BASE_URL}/api/diagnose`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Không set Content-Type, browser sẽ tự động thêm boundary cho multipart/form-data
      },
      body: formData,
    })

    // Kiểm tra status 401 trước
    if (response.status === 401) {
      localStorage.removeItem('token')
      throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
    }

    if (!response.ok) {
      let errorMessage = `Lỗi ${response.status}: ${response.statusText}`
      let recommendation

      try {
        const contentType = response.headers.get('content-type') || ''

        // Chỉ parse JSON nếu response type là JSON
        if (contentType.includes('application/json')) {
          const errorData = await response.json()
          // Prioritize description from BE for specific errors
          errorMessage = errorData.description || errorData.message || errorData.error || errorMessage
          if (errorData?.recommendation) {
            recommendation = errorData.recommendation
          }
        } else if (contentType.includes('text/html')) {
          // Nếu HTML, chỉ lấy status text
          errorMessage = `Lỗi máy chủ ${response.status}. Vui lòng kiểm tra kết nối.`
        } else {
          // Thử đọc text
          const text = await response.text()
          if (text) {
            errorMessage = text.substring(0, 200) // Chỉ lấy 200 ký tự đầu
          }
        }
      } catch (e) {
        // Nếu không thể đọc response body, giữ nguyên status message
      }

      const error = new Error(errorMessage)
      if (recommendation) {
        error.recommendation = recommendation
      }
      throw error
    }

    // Đọc response thành công
    const result = await response.json()
    return result
  } catch (error) {
    // Log để debug
    console.error('Diagnosis error:', error)
    console.error('Error stack:', error.stack)

    // Nếu là Error object
    if (error instanceof Error) {
      throw error
    }

    throw new Error(error?.message || error?.toString?.() || 'Chuẩn đoán thất bại. Vui lòng thử lại.')
  }
}

/**
 * Lấy lịch sử chuẩn đoán của người dùng
 * @returns {Promise<Array>} Danh sách lịch sử chuẩn đoán
 */
export const getHistory = async () => {
  try {
    const response = await apiClient('/api/diagnose/history', {
      method: 'GET',
    })
    if (!Array.isArray(response)) return []

    const safeParse = (value) => {
      if (!value) return null
      if (typeof value === 'object') return value
      try {
        return JSON.parse(value)
      } catch {
        return null
      }
    }

    return response.map((entry) => {
      const parsed = safeParse(entry.result_json)
      const timestamp =
        entry.diagnosed_at ||
        entry.created_at ||
        entry.createdAt ||
        entry.updated_at ||
        null

      return {
        ...entry,
        result_json: parsed || entry.result_json,
        diagnosed_at: entry.diagnosed_at || null,
        created_at: entry.created_at || timestamp,
      }
    })
  } catch (error) {
    if (error.message.includes('401') || error.message.includes('hết hạn')) {
      throw error
    }
    throw new Error(error.message || 'Không thể lấy lịch sử chuẩn đoán')
  }
}

/**
 * Xóa một mục lịch sử chuẩn đoán
 * @param {number} historyId - ID của lịch sử chuẩn đoán
 * @returns {Promise<Object>} Kết quả xóa
 */
export const deleteHistory = async (historyId) => {
  try {
    const response = await apiClient(`/api/diagnose/${historyId}`, {
      method: 'DELETE',
    })
    return response
  } catch (error) {
    if (error.message.includes('401') || error.message.includes('hết hạn')) {
      throw error
    }
    throw new Error(error.message || 'Không thể xóa lịch sử chuẩn đoán')
  }
}

