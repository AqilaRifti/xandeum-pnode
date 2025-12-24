/**
 * Centralized color utilities for consistent styling across all dashboard components
 */

export type HealthStatus = 'excellent' | 'good' | 'fair' | 'poor';
export type NodeStatus = 'online' | 'offline';

// Health score color definitions
export const HEALTH_COLORS = {
    excellent: {
        hex: '#10b981', // emerald-500
        tailwind: 'text-emerald-500',
        bg: 'bg-emerald-500',
        bgLight: 'bg-emerald-500/10',
        border: 'border-emerald-500',
    },
    good: {
        hex: '#f59e0b', // amber-500
        tailwind: 'text-amber-500',
        bg: 'bg-amber-500',
        bgLight: 'bg-amber-500/10',
        border: 'border-amber-500',
    },
    fair: {
        hex: '#f97316', // orange-500
        tailwind: 'text-orange-500',
        bg: 'bg-orange-500',
        bgLight: 'bg-orange-500/10',
        border: 'border-orange-500',
    },
    poor: {
        hex: '#ef4444', // red-500
        tailwind: 'text-red-500',
        bg: 'bg-red-500',
        bgLight: 'bg-red-500/10',
        border: 'border-red-500',
    },
} as const;

// Status color definitions
export const STATUS_COLORS = {
    online: {
        hex: '#10b981',
        tailwind: 'text-emerald-500',
        bg: 'bg-emerald-500',
        bgLight: 'bg-emerald-500/10',
    },
    offline: {
        hex: '#ef4444',
        tailwind: 'text-red-500',
        bg: 'bg-red-500',
        bgLight: 'bg-red-500/10',
    },
} as const;

/**
 * Get health status from score
 */
export function getHealthStatusFromScore(score: number): HealthStatus {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'poor';
}

/**
 * Get health color (hex) from score - used for map markers
 */
export function getHealthColor(score: number): string {
    const status = getHealthStatusFromScore(score);
    return HEALTH_COLORS[status].hex;
}

/**
 * Get health Tailwind class from score
 */
export function getHealthTailwindClass(score: number): string {
    const status = getHealthStatusFromScore(score);
    return HEALTH_COLORS[status].tailwind;
}

/**
 * Get health background class from score
 */
export function getHealthBgClass(score: number): string {
    const status = getHealthStatusFromScore(score);
    return HEALTH_COLORS[status].bg;
}

/**
 * Get health light background class from score
 */
export function getHealthBgLightClass(score: number): string {
    const status = getHealthStatusFromScore(score);
    return HEALTH_COLORS[status].bgLight;
}

/**
 * Get status color (hex) from status
 */
export function getStatusColor(status: NodeStatus): string {
    return STATUS_COLORS[status].hex;
}

/**
 * Get status Tailwind class from status
 */
export function getStatusTailwindClass(status: NodeStatus): string {
    return STATUS_COLORS[status].tailwind;
}

/**
 * Get full health info including emoji and label
 */
export function getHealthInfo(score: number): {
    status: HealthStatus;
    label: string;
    emoji: string;
    color: string;
    hex: string;
} {
    const status = getHealthStatusFromScore(score);
    const colors = HEALTH_COLORS[status];

    const labels: Record<HealthStatus, string> = {
        excellent: 'Excellent',
        good: 'Good',
        fair: 'Fair',
        poor: 'Poor',
    };

    const emojis: Record<HealthStatus, string> = {
        excellent: '🟢',
        good: '🟡',
        fair: '🟠',
        poor: '🔴',
    };

    return {
        status,
        label: labels[status],
        emoji: emojis[status],
        color: colors.tailwind,
        hex: colors.hex,
    };
}

/**
 * Get badge variant based on health score
 */
export function getHealthBadgeVariant(score: number): 'default' | 'secondary' | 'destructive' | 'outline' {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    if (score >= 40) return 'outline';
    return 'destructive';
}

/**
 * Map legend items for the map component
 */
export const MAP_LEGEND_ITEMS = [
    { status: 'excellent' as const, label: 'Excellent (80-100)', color: HEALTH_COLORS.excellent.hex },
    { status: 'good' as const, label: 'Good (60-79)', color: HEALTH_COLORS.good.hex },
    { status: 'fair' as const, label: 'Fair (40-59)', color: HEALTH_COLORS.fair.hex },
    { status: 'poor' as const, label: 'Poor (0-39)', color: HEALTH_COLORS.poor.hex },
];
