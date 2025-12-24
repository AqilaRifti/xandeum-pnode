import type { Node } from './nodeData';

export interface ImportError {
    row: number;
    field: string;
    message: string;
    value: unknown;
}

export interface ImportValidationResult {
    isValid: boolean;
    errors: ImportError[];
    validRows: number;
    invalidRows: number;
}

export interface ImportPreviewData {
    headers: string[];
    rows: Record<string, unknown>[];
    totalRows: number;
    validRows: number;
    invalidRows: number;
    errors: ImportError[];
}

export interface ImportResult {
    success: boolean;
    imported: number;
    updated: number;
    skipped: number;
    errors: ImportError[];
}

// Required fields for a valid node import
const REQUIRED_FIELDS = ['pubkey', 'status'] as const;

// Field validators
const FIELD_VALIDATORS: Record<string, (value: unknown) => { valid: boolean; message?: string }> = {
    pubkey: (value) => {
        if (typeof value !== 'string' || value.trim().length === 0) {
            return { valid: false, message: 'Pubkey is required and must be a non-empty string' };
        }
        if (value.length < 32) {
            return { valid: false, message: 'Pubkey must be at least 32 characters' };
        }
        return { valid: true };
    },
    status: (value) => {
        const validStatuses = ['online', 'offline'];
        if (!validStatuses.includes(String(value).toLowerCase())) {
            return { valid: false, message: `Status must be one of: ${validStatuses.join(', ')}` };
        }
        return { valid: true };
    },
    healthScore: (value) => {
        if (value === undefined || value === null || value === '') return { valid: true };
        const num = Number(value);
        if (!Number.isFinite(num) || num < 0 || num > 100) {
            return { valid: false, message: 'Health score must be a number between 0 and 100' };
        }
        return { valid: true };
    },
    uptime: (value) => {
        if (value === undefined || value === null || value === '') return { valid: true };
        const num = Number(value);
        if (!Number.isFinite(num) || num < 0) {
            return { valid: false, message: 'Uptime must be a non-negative number' };
        }
        return { valid: true };
    },
    storageUsed: (value) => {
        if (value === undefined || value === null || value === '') return { valid: true };
        const num = Number(value);
        if (!Number.isFinite(num) || num < 0) {
            return { valid: false, message: 'Storage used must be a non-negative number' };
        }
        return { valid: true };
    },
    storageTotal: (value) => {
        if (value === undefined || value === null || value === '') return { valid: true };
        const num = Number(value);
        if (!Number.isFinite(num) || num < 0) {
            return { valid: false, message: 'Storage total must be a non-negative number' };
        }
        return { valid: true };
    },
    isPublic: (value) => {
        if (value === undefined || value === null || value === '') return { valid: true };
        const strVal = String(value).toLowerCase();
        const validValues = ['true', 'false', 'yes', 'no', '1', '0'];
        if (!validValues.includes(strVal)) {
            return { valid: false, message: 'Public access must be true/false, yes/no, or 1/0' };
        }
        return { valid: true };
    },
    ip: (value) => {
        if (value === undefined || value === null || value === '') return { valid: true };
        // Basic IP validation (IPv4)
        const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
        if (!ipRegex.test(String(value))) {
            return { valid: false, message: 'Invalid IP address format' };
        }
        return { valid: true };
    },
    rpcPort: (value) => {
        if (value === undefined || value === null || value === '') return { valid: true };
        const num = Number(value);
        if (!Number.isInteger(num) || num < 1 || num > 65535) {
            return { valid: false, message: 'RPC port must be an integer between 1 and 65535' };
        }
        return { valid: true };
    },
};

/**
 * Parse CSV content to array of objects
 */
export function parseCSV(content: string): Record<string, string>[] {
    const lines = content.split(/\r?\n/).filter(line => line.trim());
    if (lines.length < 1) return [];

    // Parse header
    const headers = parseCSVLine(lines[0]);

    // Parse data rows
    const results: Record<string, string>[] = [];
    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length === 0 || (values.length === 1 && values[0] === '')) continue;

        const obj: Record<string, string> = {};
        headers.forEach((header, idx) => {
            obj[header.trim()] = values[idx]?.trim() ?? '';
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
                i++;
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
 * Parse JSON content to array of objects
 */
export function parseJSON(content: string): Record<string, unknown>[] {
    const data = JSON.parse(content);

    // Handle both array format and object with nodes array
    if (Array.isArray(data)) {
        return data;
    }

    if (data && typeof data === 'object' && Array.isArray(data.nodes)) {
        return data.nodes;
    }

    throw new Error('Invalid JSON format: expected array or object with nodes array');
}

/**
 * Validate a single row of import data
 */
function validateRow(row: Record<string, unknown>, rowIndex: number): ImportError[] {
    const errors: ImportError[] = [];

    // Check required fields
    for (const field of REQUIRED_FIELDS) {
        if (row[field] === undefined || row[field] === null || row[field] === '') {
            errors.push({
                row: rowIndex,
                field,
                message: `Missing required field: ${field}`,
                value: row[field],
            });
        }
    }

    // Validate each field that has a validator
    for (const [field, validator] of Object.entries(FIELD_VALIDATORS)) {
        if (row[field] !== undefined && row[field] !== null && row[field] !== '') {
            const result = validator(row[field]);
            if (!result.valid) {
                errors.push({
                    row: rowIndex,
                    field,
                    message: result.message ?? `Invalid value for ${field}`,
                    value: row[field],
                });
            }
        }
    }

    return errors;
}

/**
 * Validate import data and return validation results
 */
export function validateImportData(rows: Record<string, unknown>[]): ImportValidationResult {
    const allErrors: ImportError[] = [];
    let validRows = 0;
    let invalidRows = 0;

    for (let i = 0; i < rows.length; i++) {
        const rowErrors = validateRow(rows[i], i + 1); // 1-indexed for user display
        if (rowErrors.length > 0) {
            allErrors.push(...rowErrors);
            invalidRows++;
        } else {
            validRows++;
        }
    }

    return {
        isValid: invalidRows === 0,
        errors: allErrors,
        validRows,
        invalidRows,
    };
}

/**
 * Generate a preview of import data with validation
 */
export function generateImportPreview(
    rows: Record<string, unknown>[],
    limit = 10
): ImportPreviewData {
    const validation = validateImportData(rows);
    const headers = rows.length > 0 ? Object.keys(rows[0]) : [];

    return {
        headers,
        rows: rows.slice(0, limit),
        totalRows: rows.length,
        validRows: validation.validRows,
        invalidRows: validation.invalidRows,
        errors: validation.errors.slice(0, 50), // Limit errors shown
    };
}

/**
 * Convert a parsed row to a partial Node object
 */
function rowToNode(row: Record<string, unknown>): Partial<Node> {
    const parseBoolean = (val: unknown): boolean => {
        if (typeof val === 'boolean') return val;
        const str = String(val).toLowerCase();
        return str === 'true' || str === 'yes' || str === '1';
    };

    return {
        pubkey: String(row.pubkey ?? ''),
        status: (String(row.status ?? 'offline').toLowerCase() as 'online' | 'offline'),
        version: String(row.version ?? '0.0.0'),
        storageUsed: Number(row.storageUsed) || 0,
        storageTotal: Number(row.storageTotal) || 0,
        storageCommitted: Number(row.storageCommitted) || 0,
        storageUsagePercent: Number(row.storageUsagePercent) || 0,
        uptime: Number(row.uptime) || 0,
        ip: String(row.ip ?? ''),
        lastSeen: String(row.lastSeen ?? new Date().toISOString()),
        address: String(row.address ?? ''),
        isPublic: parseBoolean(row.isPublic),
        rpcPort: Number(row.rpcPort) || 8899,
        lastSeenTimestamp: Number(row.lastSeenTimestamp) || Date.now(),
        healthScore: row.healthScore !== undefined ? Number(row.healthScore) : undefined,
        rank: row.rank !== undefined ? Number(row.rank) : undefined,
        percentile: row.percentile !== undefined ? String(row.percentile) : undefined,
    };
}

/**
 * Process import and return results
 */
export function processImport(
    rows: Record<string, unknown>[],
    existingNodes: Node[] = []
): ImportResult {
    const validation = validateImportData(rows);
    const existingPubkeys = new Set(existingNodes.map(n => n.pubkey));

    let imported = 0;
    let updated = 0;
    let skipped = 0;
    const validRowIndices = new Set<number>();

    // Find which rows are valid
    const errorRowIndices = new Set(validation.errors.map(e => e.row));
    for (let i = 0; i < rows.length; i++) {
        if (!errorRowIndices.has(i + 1)) {
            validRowIndices.add(i);
        }
    }

    // Process valid rows
    Array.from(validRowIndices).forEach((idx) => {
        const row = rows[idx];
        const pubkey = String(row.pubkey);

        if (existingPubkeys.has(pubkey)) {
            updated++;
        } else {
            imported++;
        }
    });

    skipped = validation.invalidRows;

    return {
        success: validation.isValid || validation.validRows > 0,
        imported,
        updated,
        skipped,
        errors: validation.errors,
    };
}

/**
 * Get valid nodes from import data
 */
export function getValidNodesFromImport(rows: Record<string, unknown>[]): Partial<Node>[] {
    const validation = validateImportData(rows);
    const errorRowIndices = new Set(validation.errors.map(e => e.row));

    const validNodes: Partial<Node>[] = [];
    for (let i = 0; i < rows.length; i++) {
        if (!errorRowIndices.has(i + 1)) {
            validNodes.push(rowToNode(rows[i]));
        }
    }

    return validNodes;
}

/**
 * Detect file type from content
 */
export function detectFileType(content: string): 'csv' | 'json' | 'unknown' {
    const trimmed = content.trim();

    // Check for JSON
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        try {
            JSON.parse(trimmed);
            return 'json';
        } catch {
            // Not valid JSON
        }
    }

    // Check for CSV (has commas and multiple lines)
    if (trimmed.includes(',') && trimmed.includes('\n')) {
        return 'csv';
    }

    return 'unknown';
}

/**
 * Parse file content based on detected or specified type
 */
export function parseFileContent(
    content: string,
    type?: 'csv' | 'json'
): Record<string, unknown>[] {
    const fileType = type ?? detectFileType(content);

    if (fileType === 'json') {
        return parseJSON(content);
    }

    if (fileType === 'csv') {
        return parseCSV(content);
    }

    throw new Error('Unable to detect file format. Please use CSV or JSON.');
}
