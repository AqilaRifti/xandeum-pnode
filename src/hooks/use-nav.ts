'use client';

/**
 * Simplified hook for filtering navigation items
 * (Clerk RBAC removed - returns all items)
 */

import { useMemo } from 'react';
import type { NavItem } from '@/types';

/**
 * Hook to filter navigation items
 * Returns all items since RBAC is not used
 *
 * @param items - Array of navigation items to filter
 * @returns Filtered items
 */
export function useFilteredNavItems(items: NavItem[]) {
  const filteredItems = useMemo(() => {
    return items.map((item) => {
      // Recursively include child items
      if (item.items && item.items.length > 0) {
        return {
          ...item,
          items: item.items
        };
      }
      return item;
    });
  }, [items]);

  return filteredItems;
}
