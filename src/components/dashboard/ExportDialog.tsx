'use client';

import { useState } from 'react';
import { Download, FileJson, FileSpreadsheet } from 'lucide-react';
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
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import {
    exportAndDownload,
    EXPORT_COLUMNS,
    type ExportColumnKey,
    type ExportOptions,
    type NetworkStats,
} from '@/lib/export';
import type { Node } from '@/lib/nodeData';

interface ExportDialogProps {
    nodes: Node[];
    filteredNodes?: Node[];
    selectedNodes?: Node[];
    networkStats?: NetworkStats;
    trigger?: React.ReactNode;
}

type ExportScope = 'all' | 'filtered' | 'selected';

const DEFAULT_COLUMNS: ExportColumnKey[] = [
    'rank',
    'pubkey',
    'status',
    'healthScore',
    'uptime',
    'storageUsed',
    'storageTotal',
    'version',
];

export function ExportDialog({
    nodes,
    filteredNodes,
    selectedNodes,
    networkStats,
    trigger,
}: ExportDialogProps) {
    const [open, setOpen] = useState(false);
    const [format, setFormat] = useState<'csv' | 'json'>('csv');
    const [scope, setScope] = useState<ExportScope>('all');
    const [columns, setColumns] = useState<ExportColumnKey[]>(DEFAULT_COLUMNS);
    const [isExporting, setIsExporting] = useState(false);

    const getNodeCount = (s: ExportScope) => {
        switch (s) {
            case 'all':
                return nodes.length;
            case 'filtered':
                return filteredNodes?.length ?? nodes.length;
            case 'selected':
                return selectedNodes?.length ?? 0;
        }
    };

    const getNodesToExport = () => {
        switch (scope) {
            case 'all':
                return nodes;
            case 'filtered':
                return filteredNodes ?? nodes;
            case 'selected':
                return selectedNodes ?? [];
        }
    };

    const handleColumnToggle = (column: ExportColumnKey) => {
        setColumns((prev) =>
            prev.includes(column)
                ? prev.filter((c) => c !== column)
                : [...prev, column]
        );
    };

    const handleSelectAll = () => {
        setColumns(Object.keys(EXPORT_COLUMNS) as ExportColumnKey[]);
    };

    const handleSelectNone = () => {
        setColumns([]);
    };

    const handleExport = async () => {
        const nodesToExport = getNodesToExport();

        if (nodesToExport.length === 0) {
            toast.error('No nodes to export');
            return;
        }

        if (columns.length === 0) {
            toast.error('Please select at least one column');
            return;
        }

        try {
            setIsExporting(true);

            const options: ExportOptions = {
                format,
                columns,
                includeHeader: true,
            };

            exportAndDownload(nodesToExport, options, networkStats);
            toast.success(`Exported ${nodesToExport.length} nodes as ${format.toUpperCase()}`);
            setOpen(false);
        } catch (error) {
            toast.error('Export failed. Please try again.');
            console.error('Export error:', error);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <Button variant="outline" size="sm" className="gap-2">
                        <Download className="h-4 w-4" />
                        Export
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Export Node Data</DialogTitle>
                    <DialogDescription>
                        Choose format, scope, and columns to export.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Format Selection */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium">Format</Label>
                        <RadioGroup
                            value={format}
                            onValueChange={(v) => setFormat(v as 'csv' | 'json')}
                            className="flex gap-4"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="csv" id="csv" />
                                <Label
                                    htmlFor="csv"
                                    className="flex items-center gap-2 cursor-pointer"
                                >
                                    <FileSpreadsheet className="h-4 w-4" />
                                    CSV
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="json" id="json" />
                                <Label
                                    htmlFor="json"
                                    className="flex items-center gap-2 cursor-pointer"
                                >
                                    <FileJson className="h-4 w-4" />
                                    JSON
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Scope Selection */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium">Scope</Label>
                        <RadioGroup
                            value={scope}
                            onValueChange={(v) => setScope(v as ExportScope)}
                            className="space-y-2"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="all" id="all" />
                                <Label htmlFor="all" className="cursor-pointer">
                                    All nodes ({getNodeCount('all')})
                                </Label>
                            </div>
                            {filteredNodes && filteredNodes.length !== nodes.length && (
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="filtered" id="filtered" />
                                    <Label htmlFor="filtered" className="cursor-pointer">
                                        Filtered nodes ({getNodeCount('filtered')})
                                    </Label>
                                </div>
                            )}
                            {selectedNodes && selectedNodes.length > 0 && (
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="selected" id="selected" />
                                    <Label htmlFor="selected" className="cursor-pointer">
                                        Selected nodes ({getNodeCount('selected')})
                                    </Label>
                                </div>
                            )}
                        </RadioGroup>
                    </div>

                    {/* Column Selection */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Columns</Label>
                            <div className="flex gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs"
                                    onClick={handleSelectAll}
                                >
                                    All
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs"
                                    onClick={handleSelectNone}
                                >
                                    None
                                </Button>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
                            {(Object.keys(EXPORT_COLUMNS) as ExportColumnKey[]).map((key) => (
                                <div key={key} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={key}
                                        checked={columns.includes(key)}
                                        onCheckedChange={() => handleColumnToggle(key)}
                                    />
                                    <Label
                                        htmlFor={key}
                                        className="text-sm cursor-pointer truncate"
                                    >
                                        {EXPORT_COLUMNS[key].label}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleExport}
                        disabled={isExporting || columns.length === 0}
                        className="gap-2"
                    >
                        {isExporting ? (
                            <>Exporting...</>
                        ) : (
                            <>
                                <Download className="h-4 w-4" />
                                Export {getNodeCount(scope)} nodes
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
