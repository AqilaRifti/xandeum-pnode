import type { Node } from './nodeData';
import { formatBytes } from './utils';

// Export column definitions
export const EXPORT_COLUMNS = {
    rank: { label: 'Rank', key: 'rank' },
    pubkey: { label: 'Pubkey', key: 'pubkey' },
    status: { label: 'Status', key: 'status' },
    healthScore: { label: 'Health Score', key: 'healthScore' },
    uptime: { label: 'Uptime (days)', key: 'uptime' },
    storageUsed: { label: 'Storage Used', key: 'storageUsed' },
    storageTotal: { label: 'Storage Total', key: 'storageTotal' },
    storageUsagePercent: { label: 'Storage Usage %', key: 'storageUsagePercent' },
    version: { label: 'Version', key: 'version' },
    ip: { label: 'IP Address', key: 'ip' },
    isPublic: { label: 'Public Access', key: 'isPublic' },
    rpcPort: { label: 'RPC Port', key: 'rpcPort' },
    lastSeen: { label: 'Last Seen', key: 'lastSeen' },
    percentile: { label: 'Percentile', key: 'percentile' },
} as const;

export type ExportColumnKey = keyof typeof EXPORT_COLUMNS;

export interface ExportOptions {
    format: 'csv' | 'json';
    columns: ExportColumnKey[];
    filename?: string;
    includeHeader?: boolean;
}

export interface NetworkStats {
    totalNodes: number;
    onlineNodes: number;
    offlineNodes: number;
    totalStorage: number;
    usedStorage: number;
    storageUtilization: number;
    avgUptime: number;
    avgHealthScore: number;
    publicNodes: number;
    privateNodes: number;
    latestVersion: string;
}

/**
 * Generate a filename with timestamp
 */
export function generateFilename(format: 'csv' | 'json' | 'pdf', prefix = 'xandeum-nodes'): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    return `${prefix}-${timestamp}.${format}`;
}

/**
 * Escape a value for CSV (handles commas, quotes, newlines)
 */
function escapeCSVValue(value: unknown): string {
    if (value === null || value === undefined) return '';
    const str = String(value);
    // If contains comma, quote, or newline, wrap in quotes and escape internal quotes
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

/**
 * Format a node value for export based on column type
 */
function formatNodeValue(node: Node, column: ExportColumnKey): string | number | boolean {
    const value = node[column as keyof Node];

    switch (column) {
        case 'storageUsed':
        case 'storageTotal':
            return typeof value === 'number' ? value : 0;
        case 'uptime':
            return typeof value === 'number' ? Number(value.toFixed(2)) : 0;
        case 'storageUsagePercent':
            return typeof value === 'number' ? Number(value.toFixed(2)) : 0;
        case 'healthScore':
            return typeof value === 'number' ? value : 0;
        case 'isPublic':
            return value ? 'Yes' : 'No';
        case 'rank':
            return typeof value === 'number' ? value : '-';
        default:
            return value !== undefined && value !== null ? String(value) : '';
    }
}

/**
 * Export nodes to CSV format
 */
export function exportToCSV(nodes: Node[], options: ExportOptions): string {
    const { columns, includeHeader = true } = options;
    const lines: string[] = [];

    // Add header row
    if (includeHeader) {
        const headerRow = columns.map(col => escapeCSVValue(EXPORT_COLUMNS[col].label));
        lines.push(headerRow.join(','));
    }

    // Add data rows
    for (const node of nodes) {
        const row = columns.map(col => escapeCSVValue(formatNodeValue(node, col)));
        lines.push(row.join(','));
    }

    return lines.join('\n');
}

/**
 * Parse CSV string back to array of objects
 */
export function parseCSVToObjects(csv: string): Record<string, string>[] {
    const lines = csv.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    // Parse header
    const headers = parseCSVLine(lines[0]);

    // Parse data rows
    const results: Record<string, string>[] = [];
    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        const obj: Record<string, string> = {};
        headers.forEach((header, idx) => {
            obj[header] = values[idx] ?? '';
        });
        results.push(obj);
    }

    return results;
}

/**
 * Parse a single CSV line handling quoted values
 */
function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (inQuotes) {
            if (char === '"' && nextChar === '"') {
                current += '"';
                i++; // Skip next quote
            } else if (char === '"') {
                inQuotes = false;
            } else {
                current += char;
            }
        } else {
            if (char === '"') {
                inQuotes = true;
            } else if (char === ',') {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
    }
    result.push(current);

    return result;
}

/**
 * Export nodes to JSON format
 */
export function exportToJSON(
    nodes: Node[],
    options: ExportOptions,
    networkStats?: NetworkStats
): string {
    const { columns } = options;

    // Filter node data to only include selected columns
    const filteredNodes = nodes.map(node => {
        const filtered: Record<string, unknown> = {};
        for (const col of columns) {
            filtered[col] = formatNodeValue(node, col);
        }
        return filtered;
    });

    const exportData = {
        exportedAt: new Date().toISOString(),
        totalNodes: nodes.length,
        ...(networkStats && { networkStats }),
        nodes: filteredNodes,
    };

    return JSON.stringify(exportData, null, 2);
}

/**
 * Parse JSON export back to objects
 */
export function parseJSONExport(json: string): { nodes: Record<string, unknown>[]; networkStats?: NetworkStats } {
    const data = JSON.parse(json);
    return {
        nodes: data.nodes ?? [],
        networkStats: data.networkStats,
    };
}

/**
 * Trigger file download in browser
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Export and download nodes
 */
export function exportAndDownload(
    nodes: Node[],
    options: ExportOptions,
    networkStats?: NetworkStats
): void {
    const { format } = options;
    const filename = options.filename ?? generateFilename(format);

    let content: string;
    let mimeType: string;

    if (format === 'csv') {
        content = exportToCSV(nodes, options);
        mimeType = 'text/csv;charset=utf-8';
    } else {
        content = exportToJSON(nodes, options, networkStats);
        mimeType = 'application/json;charset=utf-8';
    }

    downloadFile(content, filename, mimeType);
}

/**
 * Get default export columns
 */
export function getDefaultExportColumns(): ExportColumnKey[] {
    return ['rank', 'pubkey', 'status', 'healthScore', 'uptime', 'storageUsed', 'storageTotal', 'version'];
}

/**
 * Get all available export columns
 */
export function getAllExportColumns(): ExportColumnKey[] {
    return Object.keys(EXPORT_COLUMNS) as ExportColumnKey[];
}
