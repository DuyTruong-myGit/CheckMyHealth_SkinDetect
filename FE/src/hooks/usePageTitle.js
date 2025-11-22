import { useEffect } from 'react'

export const usePageTitle = (title) => {
  useEffect(() => {
    document.title = title || 'CheckMyHealth'
    
    return () => {
      document.title = 'CheckMyHealth'
    }
  }, [title])
}

