/**
 * Utility functions for handling browser notifications and FCM tokens
 * 
 * LƯU Ý: 
 * - Solution hiện tại sử dụng token identifier đơn giản để tương thích với Firebase Admin
 * - Để sử dụng Firebase SDK thực sự (khuyến nghị cho production):
 *   1. Cài đặt: npm install firebase
 *   2. Tạo file firebase-config.js với Firebase config
 *   3. Uncomment phần Firebase SDK trong getFcmToken()
 *   4. Thêm VITE_FIREBASE_VAPID_KEY vào .env
 */

/**
 * Kiểm tra xem browser có hỗ trợ notifications không
 */
export const isNotificationSupported = () => {
  return 'Notification' in window && 'serviceWorker' in navigator
}

/**
 * Request notification permission từ user
 * @returns {Promise<string>} 'granted', 'denied', hoặc 'default'
 */
export const requestNotificationPermission = async () => {
  if (!isNotificationSupported()) {
    console.warn('Browser không hỗ trợ notifications')
    return 'denied'
  }

  try {
    const permission = await Notification.requestPermission()
    return permission
  } catch (error) {
    console.error('Error requesting notification permission:', error)
    return 'denied'
  }
}

/**
 * Kiểm tra xem user đã cho phép notifications chưa
 * @returns {boolean}
 */
export const hasNotificationPermission = () => {
  if (!isNotificationSupported()) {
    return false
  }
  return Notification.permission === 'granted'
}

/**
 * Lấy FCM token từ Firebase (nếu có Firebase SDK)
 * Hoặc tạo một token identifier đơn giản
 * @returns {Promise<string|null>} FCM token hoặc null
 */
export const getFcmToken = async () => {
  // ============================================
  // OPTION 1: Sử dụng Firebase SDK (Khuyến nghị cho production)
  // ============================================
  // Uncomment phần này nếu đã cài đặt Firebase SDK:
  /*
  try {
    const { getMessaging, getToken } = await import('firebase/messaging')
    const { initializeApp, getApps } = await import('firebase/app')
    
    // Import Firebase config (cần tạo file firebase-config.js)
    const firebaseConfig = await import('../config/firebase-config.js')
    
    // Initialize Firebase nếu chưa có
    if (getApps().length === 0) {
      initializeApp(firebaseConfig.default)
    }
    
    const messaging = getMessaging()
    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
    })
    
    if (token) {
      return token
    }
  } catch (error) {
    console.error('Error getting FCM token from Firebase:', error)
    // Fallback to simple token identifier
  }
  */

  // ============================================
  // OPTION 2: Token identifier đơn giản (Hiện tại đang dùng)
  // ============================================
  // Tạo một token identifier đơn giản dựa trên browser fingerprint
  // Lưu ý: Token này không phải FCM token thực sự, nhưng có thể dùng để identify user
  // Trong production, nên sử dụng Firebase SDK để có FCM token thực sự
  try {
    const userAgent = navigator.userAgent
    const language = navigator.language
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const screenResolution = `${screen.width}x${screen.height}`
    
    // Tạo một hash đơn giản từ thông tin browser
    const tokenData = `${userAgent}-${language}-${timezone}-${screenResolution}`
    
    // Lưu vào localStorage để có thể reuse
    const storedToken = localStorage.getItem('fcm_token_identifier')
    if (storedToken) {
      return storedToken
    }
    
    // Tạo token mới và lưu
    // Format: web_<base64_hash>
    const newToken = `web_${btoa(tokenData).substring(0, 50)}_${Date.now()}`
    localStorage.setItem('fcm_token_identifier', newToken)
    return newToken
  } catch (error) {
    console.error('Error creating FCM token identifier:', error)
    return null
  }
}

/**
 * Khởi tạo và đăng ký FCM token
 * @returns {Promise<string|null>} FCM token hoặc null
 */
export const initializeNotifications = async () => {
  // Kiểm tra hỗ trợ
  if (!isNotificationSupported()) {
    console.warn('Browser không hỗ trợ notifications')
    return null
  }

  // Kiểm tra permission
  if (!hasNotificationPermission()) {
    const permission = await requestNotificationPermission()
    if (permission !== 'granted') {
      console.warn('User đã từ chối notification permission')
      return null
    }
  }

  // Lấy FCM token
  try {
    const token = await getFcmToken()
    return token
  } catch (error) {
    console.error('Error initializing notifications:', error)
    return null
  }
}

/**
 * Hiển thị một notification thủ công (cho testing)
 * @param {string} title - Tiêu đề notification
 * @param {Object} options - Options cho notification
 */
export const showNotification = (title, options = {}) => {
  if (!hasNotificationPermission()) {
    console.warn('Không có permission để hiển thị notification')
    return
  }

  try {
    const notification = new Notification(title, {
      body: options.body || '',
      icon: options.icon || '/vite.svg',
      badge: options.badge || '/vite.svg',
      tag: options.tag || 'default',
      ...options
    })

    // Auto close sau 5 giây
    setTimeout(() => {
      notification.close()
    }, 5000)

    return notification
  } catch (error) {
    console.error('Error showing notification:', error)
  }
}

/**
 * Setup listener cho Firebase push messages (nếu có Firebase SDK)
 * @param {Function} onMessageCallback - Callback khi nhận được message
 * @returns {Function} Cleanup function
 */
export const setupMessageListener = (onMessageCallback) => {
  // Nếu có Firebase SDK
  if (typeof window !== 'undefined' && window.firebase) {
    try {
      const messaging = window.firebase.messaging()
      
      // Lắng nghe foreground messages
      messaging.onMessage((payload) => {
        console.log('📬 Received foreground message:', payload)
        
        // Hiển thị browser notification
        if (payload.notification) {
          showNotification(payload.notification.title, {
            body: payload.notification.body,
            icon: payload.notification.icon,
            tag: payload.data?.notification_id || 'default',
            data: payload.data
          })
        }
        
        // Trigger callback để refresh notifications
        if (onMessageCallback) {
          onMessageCallback(payload)
        }
      })
      
      return () => {
        // Cleanup nếu cần
      }
    } catch (error) {
      console.error('Error setting up Firebase message listener:', error)
    }
  }
  
  // Fallback: Lắng nghe custom events
  const handleCustomNotification = (event) => {
    if (onMessageCallback) {
      onMessageCallback(event.detail)
    }
  }
  
  window.addEventListener('push-notification', handleCustomNotification)
  
  return () => {
    window.removeEventListener('push-notification', handleCustomNotification)
  }
}

/**
 * Setup listener cho browser notification clicks
 * @param {Function} onClickCallback - Callback khi user click vào notification
 */
export const setupNotificationClickHandler = (onClickCallback) => {
  // Lắng nghe khi user click vào notification
  const handleNotificationClick = (event) => {
    console.log('🔔 Notification clicked:', event)
    
    // Trigger callback để refresh notifications
    if (onClickCallback) {
      onClickCallback(event)
    }
    
    // Focus vào window nếu đang ở background tab
    if (window.focus) {
      window.focus()
    }
    
    // Close notification
    event.target.close()
  }
  
  // Lắng nghe service worker notification clicks (nếu có)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'NOTIFICATION_CLICK') {
        if (onClickCallback) {
          onClickCallback(event.data)
        }
      }
    })
  }
  
  return handleNotificationClick
}

/**
 * Trigger custom event để refresh notifications
 * Có thể được gọi từ service worker hoặc các nơi khác
 */
export const triggerNotificationRefresh = () => {
  const event = new CustomEvent('notification-refresh', {
    detail: { timestamp: Date.now() }
  })
  window.dispatchEvent(event)
}

/**
 * Setup tất cả notification listeners
 * @param {Object} callbacks - Object chứa các callbacks
 * @param {Function} callbacks.onMessage - Callback khi nhận message
 * @param {Function} callbacks.onClick - Callback khi click notification
 * @returns {Function} Cleanup function
 */
export const setupNotificationListeners = (callbacks = {}) => {
  const cleanupFunctions = []
  
  // Setup message listener
  if (callbacks.onMessage) {
    const cleanup1 = setupMessageListener(callbacks.onMessage)
    if (cleanup1) cleanupFunctions.push(cleanup1)
  }
  
  // Setup click handler
  if (callbacks.onClick) {
    const clickHandler = setupNotificationClickHandler(callbacks.onClick)
    // Note: clickHandler không return cleanup function, nhưng có thể lưu để remove sau
  }
  
  // Lắng nghe custom refresh event
  const handleRefresh = () => {
    if (callbacks.onRefresh) {
      callbacks.onRefresh()
    }
  }
  
  window.addEventListener('notification-refresh', handleRefresh)
  cleanupFunctions.push(() => {
    window.removeEventListener('notification-refresh', handleRefresh)
  })
  
  // Lắng nghe khi tab được focus (refresh khi user quay lại)
  const handleVisibilityChange = () => {
    if (!document.hidden && callbacks.onVisibilityChange) {
      callbacks.onVisibilityChange()
    }
  }
  
  document.addEventListener('visibilitychange', handleVisibilityChange)
  cleanupFunctions.push(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  })
  
  // Return cleanup function
  return () => {
    cleanupFunctions.forEach(cleanup => {
      if (typeof cleanup === 'function') {
        cleanup()
      }
    })
  }
}

