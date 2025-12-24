'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
    AlertCircle,
    CheckCircle2,
    FileUp,
    Upload,
    XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    detectFileType,
    generateImportPreview,
    parseFileContent,
    type ImportPreviewData,
} from '@/lib/import';

interface ImportDialogProps {
    onImport?: (data: Record<string, unknown>[]) => void;
    trigger?: React.ReactNode;
}

export function ImportDialog({ onImport, trigger }: ImportDialogProps) {
    const [open, setOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<ImportPreviewData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const resetState = () => {
        setFile(null);
        setPreview(null);
        setError(null);
    };

    const processFile = async (f: File) => {
        setIsProcessing(true);
        setError(null);

        try {
            const content = await f.text();
            const fileType = detectFileType(content);

            if (fileType === 'unknown') {
                setError('Unable to detect file format. Please use CSV or JSON files.');
                setPreview(null);
                return;
            }

            const rows = parseFileContent(content, fileType);
            const previewData = generateImportPreview(rows, 5);
            setPreview(previewData);
            setFile(f);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : 'Failed to parse file'
            );
            setPreview(null);
        } finally {
            setIsProcessing(false);
        }
    };

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const f = acceptedFiles[0];
        if (f) {
            processFile(f);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/csv': ['.csv'],
            'application/json': ['.json'],
        },
        maxFiles: 1,
        maxSize: 10 * 1024 * 1024, // 10MB
    });

    const handleImport = async () => {
        if (!file || !preview) return;

        try {
            setIsProcessing(true);
            const content = await file.text();
            const rows = parseFileContent(content);

            if (onImport) {
                onImport(rows);
            }

            toast.success(
                `Imported ${preview.validRows} nodes (${preview.invalidRows} skipped)`
            );
            setOpen(false);
            resetState();
        } catch (err) {
            toast.error('Import failed. Please try again.');
            console.error('Import error:', err);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) {
            resetState();
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <Button variant="outline" size="sm" className="gap-2">
                        <Upload className="h-4 w-4" />
                        Import
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Import Node Data</DialogTitle>
                    <DialogDescription>
                        Upload a CSV or JSON file containing node data.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Drop Zone */}
                    <div
                        {...getRootProps()}
                        className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
              transition-colors duration-200
              ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
              ${error ? 'border-destructive' : ''}
            `}
                    >
                        <input {...getInputProps()} />
                        <FileUp className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                        {isDragActive ? (
                            <p className="text-sm text-primary">Drop the file here...</p>
                        ) : (
                            <>
                                <p className="text-sm text-muted-foreground mb-1">
                                    Drag & drop a file here, or click to browse
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Supported formats: CSV, JSON (max 10MB)
                                </p>
                            </>
                        )}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* File Info */}
                    {file && !error && (
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                            <div className="flex items-center gap-2">
                                <FileUp className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium truncate max-w-[200px]">
                                    {file.name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    ({(file.size / 1024).toFixed(1)} KB)
                                </span>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    resetState();
                                }}
                            >
                                Remove
                            </Button>
                        </div>
                    )}

                    {/* Preview */}
                    {preview && (
                        <div className="space-y-3">
                            {/* Summary */}
                            <div className="flex items-center gap-4">
                                <Badge variant="secondary" className="gap-1">
                                    <CheckCircle2 className="h-3 w-3" />
                                    {preview.validRows} valid
                                </Badge>
                                {preview.invalidRows > 0 && (
                                    <Badge variant="destructive" className="gap-1">
                                        <XCircle className="h-3 w-3" />
                                        {preview.invalidRows} invalid
                                    </Badge>
                                )}
                                <span className="text-xs text-muted-foreground">
                                    {preview.totalRows} total rows
                                </span>
                            </div>

                            {/* Preview Table */}
                            <div className="border rounded-lg">
                                <ScrollArea className="h-[200px]">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[50px]">#</TableHead>
                                                {preview.headers.slice(0, 4).map((header) => (
                                                    <TableHead key={header} className="truncate max-w-[100px]">
                                                        {header}
                                                    </TableHead>
                                                ))}
                                                {preview.headers.length > 4 && (
                                                    <TableHead>...</TableHead>
                                                )}
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {preview.rows.map((row, idx) => {
                                                const rowErrors = preview.errors.filter(
                                                    (e) => e.row === idx + 1
                                                );
                                                const hasError = rowErrors.length > 0;

                                                return (
                                                    <TableRow
                                                        key={idx}
                                                        className={hasError ? 'bg-destructive/5' : ''}
                                                    >
                                                        <TableCell className="font-mono text-xs">
                                                            {idx + 1}
                                                            {hasError && (
                                                                <XCircle className="h-3 w-3 text-destructive inline ml-1" />
                                                            )}
                                                        </TableCell>
                                                        {preview.headers.slice(0, 4).map((header) => (
                                                            <TableCell
                                                                key={header}
                                                                className="truncate max-w-[100px] text-xs"
                                                            >
                                                                {String(row[header] ?? '')}
                                                            </TableCell>
                                                        ))}
                                                        {preview.headers.length > 4 && (
                                                            <TableCell className="text-muted-foreground">
                                                                ...
                                                            </TableCell>
                                                        )}
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </ScrollArea>
                            </div>

                            {/* Errors */}
                            {preview.errors.length > 0 && (
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-destructive">
                                        Validation Errors:
                                    </p>
                                    <ScrollArea className="h-[80px]">
                                        <div className="space-y-1">
                                            {preview.errors.slice(0, 10).map((err, idx) => (
                                                <p key={idx} className="text-xs text-muted-foreground">
                                                    Row {err.row}, {err.field}: {err.message}
                                                </p>
                                            ))}
                                            {preview.errors.length > 10 && (
                                                <p className="text-xs text-muted-foreground">
                                                    ... and {preview.errors.length - 10} more errors
                                                </p>
                                            )}
                                        </div>
                                    </ScrollArea>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => handleOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleImport}
                        disabled={!preview || preview.validRows === 0 || isProcessing}
                        className="gap-2"
                    >
                        {isProcessing ? (
                            <>Processing...</>
                        ) : (
                            <>
                                <Upload className="h-4 w-4" />
                                Import {preview?.validRows ?? 0} nodes
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
