'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { CheckCircle2, Copy, Globe, Lock, ServerCrash, Server } from 'lucide-react';

import { DataTable } from '@/components/ui/table/data-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatBytes } from '@/lib/utils';
import { getHealthBadgeVariant, getHealthInfo } from '@/lib/colors';
import type { Node } from '@/lib/nodeData';

function getStatusIcon(status: Node['status']) {
  return status === 'online' ? Server : ServerCrash;
}

export function NodeTable({
  nodes,
  onNodeSelect,
  selectedNodePubkey,
}: {
  nodes: Node[];
  onNodeSelect?: (node: Node) => void;
  selectedNodePubkey?: string;
}) {
  const data = useMemo(() => nodes, [nodes]);

  const columns = useMemo<ColumnDef<Node>[]>(
    () => [
      {
        id: 'rank',
        accessorKey: 'rank',
        header: ({ column }) => <DataTableColumnHeader column={column} title='#' />,
        cell: ({ cell }) => {
          const v = cell.getValue<number | undefined>();
          return <div className='tabular-nums text-muted-foreground'>{v ?? '-'}</div>;
        },
        enableSorting: true,
        enableColumnFilter: false,
        size: 60,
      },
      {
        id: 'status',
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
        cell: ({ row }) => {
          const status = row.original.status;
          const Icon = getStatusIcon(status);
          return (
            <Badge variant={status === 'online' ? 'default' : 'destructive'} className='capitalize'>
              <Icon />
              {status}
            </Badge>
          );
        },
        enableSorting: true,
        enableColumnFilter: true,
        filterFn: (row, id, value) => {
          if (!Array.isArray(value) || value.length === 0) return true;
          return value.includes(row.getValue<string>(id));
        },
        meta: {
          label: 'Status',
          variant: 'multiSelect',
          options: [
            { label: 'online', value: 'online', icon: CheckCircle2 },
            { label: 'offline', value: 'offline', icon: ServerCrash },
          ],
        },
      },
      {
        id: 'pubkey',
        accessorKey: 'pubkey',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Pubkey' />,
        cell: ({ row }) => {
          const pk = row.original.pubkey;
          return <div className='font-mono text-xs'>{pk.slice(0, 10)}...{pk.slice(-8)}</div>;
        },
        enableSorting: false,
        enableColumnFilter: true,
        meta: {
          label: 'Pubkey',
          placeholder: 'Search pubkey...',
          variant: 'text',
        },
      },
      {
        id: 'healthScore',
        accessorKey: 'healthScore',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Health' />,
        cell: ({ row }) => {
          const score = row.original.healthScore ?? 0;
          const healthInfo = getHealthInfo(score);
          return (
            <div className='flex items-center gap-2'>
              <Badge variant={getHealthBadgeVariant(score)} className='whitespace-nowrap'>
                {healthInfo.label}
              </Badge>
              <div className='tabular-nums text-sm text-muted-foreground'>{score}/100</div>
            </div>
          );
        },
        enableSorting: true,
        enableColumnFilter: true,
        filterFn: (row, id, value) => {
          if (!Array.isArray(value) || value.length !== 2) return true;
          const min = Number(value[0]);
          const max = Number(value[1]);
          const v = Number(row.getValue<number | undefined>(id) ?? 0);
          if (!Number.isFinite(min) || !Number.isFinite(max) || !Number.isFinite(v)) return true;
          return v >= min && v <= max;
        },
        meta: {
          label: 'Health',
          variant: 'range',
          range: [0, 100],
          unit: '',
        },
      },
      {
        id: 'uptime',
        accessorKey: 'uptime',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Uptime (days)' />,
        cell: ({ cell }) => {
          const raw = cell.getValue<number | undefined>();
          const v = typeof raw === 'number' && Number.isFinite(raw) ? raw : 0;
          return <div className='tabular-nums'>{v.toFixed(1)}</div>;
        },
        enableSorting: true,
        enableColumnFilter: true,
        meta: {
          label: 'Uptime',
          placeholder: 'Min days...',
          variant: 'number',
          unit: 'd',
        },
        filterFn: (row, id, value) => {
          const threshold = Number(Array.isArray(value) ? value[0] : value);
          if (!Number.isFinite(threshold)) return true;
          return Number(row.getValue<number>(id) ?? 0) >= threshold;
        },
      },
      {
        id: 'storage',
        accessorFn: (n) => n.storageUsed,
        header: ({ column }) => <DataTableColumnHeader column={column} title='Storage Used' />,
        cell: ({ row }) => {
          const used = typeof row.original.storageUsed === 'number' && Number.isFinite(row.original.storageUsed) ? row.original.storageUsed : 0;
          const total = typeof row.original.storageTotal === 'number' && Number.isFinite(row.original.storageTotal) ? row.original.storageTotal : 0;
          const pctRaw = row.original.storageUsagePercent;
          const pct = typeof pctRaw === 'number' && Number.isFinite(pctRaw) ? pctRaw : total > 0 ? (used / total) * 100 : 0;
          return (
            <div className='space-y-0.5'>
              <div className='tabular-nums'>{formatBytes(used, { decimals: 1 })}</div>
              <div className='text-xs text-muted-foreground tabular-nums'>
                {pct.toFixed(1)}% of {formatBytes(total, { decimals: 0 })}
              </div>
            </div>
          );
        },
        enableSorting: true,
        enableColumnFilter: false,
      },
      {
        id: 'version',
        accessorKey: 'version',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Version' />,
        cell: ({ cell }) => <div className='font-mono text-xs'>v{cell.getValue<string>()}</div>,
        enableSorting: true,
        enableColumnFilter: true,
        meta: {
          label: 'Version',
          placeholder: 'Search version...',
          variant: 'text',
        },
      },
      {
        id: 'visibility',
        accessorFn: (n) => (n.isPublic ? 'public' : 'private'),
        header: ({ column }) => <DataTableColumnHeader column={column} title='Access' />,
        cell: ({ row }) => {
          const isPublic = row.original.isPublic;
          const Icon = isPublic ? Globe : Lock;
          return (
            <Badge variant={isPublic ? 'secondary' : 'outline'} className='capitalize'>
              <Icon />
              {isPublic ? 'public' : 'private'}
            </Badge>
          );
        },
        enableSorting: false,
        enableColumnFilter: true,
        filterFn: (row, id, value) => {
          if (!Array.isArray(value) || value.length === 0) return true;
          return value.includes(row.getValue<string>(id));
        },
        meta: {
          label: 'Access',
          variant: 'multiSelect',
          options: [
            { label: 'public', value: 'public', icon: Globe },
            { label: 'private', value: 'private', icon: Lock },
          ],
        },
      },
      {
        id: 'ip',
        accessorKey: 'ip',
        header: ({ column }) => <DataTableColumnHeader column={column} title='IP' />,
        cell: ({ cell }) => <div className='font-mono text-xs'>{cell.getValue<string>()}</div>,
        enableSorting: false,
        enableColumnFilter: true,
        meta: {
          label: 'IP',
          placeholder: 'Search IP...',
          variant: 'text',
        },
      },
      {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => {
          const pk = row.original.pubkey;
          return (
            <div className='flex items-center justify-end'>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='h-8 w-8'
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(pk);
                    toast.success('Pubkey copied');
                  } catch {
                    toast.error('Failed to copy');
                  }
                }}
              >
                <Copy />
              </Button>
            </div>
          );
        },
      },
    ],
    []
  );

  const [sorting, setSorting] = useState<SortingState>([
    { id: 'healthScore', desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    ip: false,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
    enableRowSelection: true,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
  });

  return (
    <Card className='col-span-2 bg-background/50 backdrop-blur-sm'>
      <CardHeader className='flex flex-row items-center justify-between gap-2'>
        <CardTitle>All Nodes</CardTitle>
        <Badge variant='outline' className='tabular-nums'>
          {nodes.length} total
        </Badge>
      </CardHeader>
      <CardContent>
        <DataTable
          table={table}
          onRowClick={onNodeSelect}
          selectedRowId={selectedNodePubkey}
          getRowId={(row) => row.pubkey}
        >
          <DataTableToolbar table={table} />
        </DataTable>
      </CardContent>
    </Card>
  );
}
