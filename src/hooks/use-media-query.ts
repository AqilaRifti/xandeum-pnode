import { useSyncExternalStore } from 'react';

export function useMediaQuery() {
  const query = '(max-width: 768px)';

  const isOpen = useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === 'undefined') return () => {};

      const mediaQuery = window.matchMedia(query);
      const handler = () => onStoreChange();

      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    },
    () => (typeof window === 'undefined' ? false : window.matchMedia(query).matches),
    () => false
  );

  return { isOpen };
}
