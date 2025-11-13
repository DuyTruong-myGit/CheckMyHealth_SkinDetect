const rawBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'

export const API_BASE_URL = rawBaseUrl.replace(/\/$/, '')
export const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT ?? 8000)


