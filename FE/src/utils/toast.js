import { toast } from 'react-toastify'

/**
 * Toast notification utilities
 * Simple wrapper around react-toastify for consistent styling
 */

const defaultOptions = {
    position: 'top-right',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
}

export const showToast = {
    success: (message, options = {}) => {
        toast.success(message, { ...defaultOptions, ...options })
    },

    error: (message, options = {}) => {
        toast.error(message, { ...defaultOptions, ...options })
    },

    info: (message, options = {}) => {
        toast.info(message, { ...defaultOptions, ...options })
    },

    warning: (message, options = {}) => {
        toast.warning(message, { ...defaultOptions, ...options })
    },

    promise: (promise, messages, options = {}) => {
        return toast.promise(
            promise,
            {
                pending: messages.pending || 'Đang xử lý...',
                success: messages.success || 'Thành công!',
                error: messages.error || 'Có lỗi xảy ra!',
            },
            { ...defaultOptions, ...options }
        )
    },
}

export default showToast
