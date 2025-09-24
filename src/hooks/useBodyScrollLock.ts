import { useEffect } from 'react';

/**
 * Custom hook to lock/unlock body scroll when modals are open
 * Prevents background scrolling when modal is displayed
 */
export const useBodyScrollLock = (isLocked: boolean) => {
  useEffect(() => {
    if (isLocked) {
      // Store original overflow value
      const originalOverflow = document.body.style.overflow;
      
      // Lock scroll
      document.body.style.overflow = 'hidden';
      
      // Cleanup function to restore scroll
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isLocked]);
};