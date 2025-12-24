import type { Node } from './nodeData';

export interface MapNode {
    pubkey: string;
    lat: number;
    lng: number;
    country: string;
    region: string;
    city?: string;
    status: 'online' | 'offline';
    healthScore: number;
    version: string;
    lastSeen?: string;
}

export interface MapFilters {
    statuses: ('online' | 'offline')[];
    healthRange: [number, number];
}

export const DEFAULT_MAP_FILTERS: MapFilters = {
    statuses: ['online', 'offline'],
    healthRange: [0, 100],
};

/**
 * Filter nodes by status
 */
export function filterNodesByStatus<T extends { status: 'online' | 'offline' }>(
    nodes: T[],
    statuses: ('online' | 'offline')[]
): T[] {
    if (statuses.length === 0) return nodes;
    return nodes.filter(node => statuses.includes(node.status));
}

/**
 * Filter nodes by health score range
 */
export function filterNodesByHealthRange<T extends { healthScore: number }>(
    nodes: T[],
    min: number,
    max: number
): T[] {
    return nodes.filter(node => {
        const score = node.healthScore ?? 0;
        return score >= min && score <= max;
    });
}

/**
 * Apply all map filters to nodes
 */
export function applyMapFilters<T extends { status: 'online' | 'offline'; healthScore: number }>(
    nodes: T[],
    filters: MapFilters
): T[] {
    let filtered = nodes;

    // Apply status filter
    if (filters.statuses.length > 0 && filters.statuses.length < 2) {
        filtered = filterNodesByStatus(filtered, filters.statuses);
    }

    // Apply health range filter
    const [min, max] = filters.healthRange;
    if (min > 0 || max < 100) {
        filtered = filterNodesByHealthRange(filtered, min, max);
    }

    return filtered;
}

/**
 * Get filter summary text
 */
export function getFilterSummary(filters: MapFilters, totalNodes: number, filteredCount: number): string {
    const parts: string[] = [];

    if (filters.statuses.length === 1) {
        parts.push(`${filters.statuses[0]} only`);
    }

    const [min, max] = filters.healthRange;
    if (min > 0 || max < 100) {
        parts.push(`health ${min}-${max}`);
    }

    if (parts.length === 0) {
        return `${filteredCount} nodes`;
    }

    return `${filteredCount} of ${totalNodes} nodes (${parts.join(', ')})`;
}

/**
 * Check if filters are at default values
 */
export function isDefaultFilters(filters: MapFilters): boolean {
    return (
        filters.statuses.length === 2 &&
        filters.statuses.includes('online') &&
        filters.statuses.includes('offline') &&
        filters.healthRange[0] === 0 &&
        filters.healthRange[1] === 100
    );
}

/**
 * Reset filters to default values
 */
export function resetFilters(): MapFilters {
    return { ...DEFAULT_MAP_FILTERS };
}
