'use client';

import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatBytes } from '@/lib/utils';
import type { Node } from '@/lib/nodeData';

interface ChartDataPoint {
  name: string;
  pubkey: string;
  used: number;
  available: number;
  total: number;
  usagePercent: number;
}

export function StorageChart({ nodes }: { nodes: Node[] }) {
  const chartData = useMemo<ChartDataPoint[]>(() => {
    // Get top 10 nodes by storage used
    const topNodes = [...nodes]
      .sort((a, b) => b.storageUsed - a.storageUsed)
      .slice(0, 10);

    return topNodes.map((node) => ({
      name: `${node.pubkey.slice(0, 4)}...${node.pubkey.slice(-4)}`,
      pubkey: node.pubkey,
      used: node.storageUsed / 1e9, // GB
      available: (node.storageTotal - node.storageUsed) / 1e9, // GB
      total: node.storageTotal / 1e9, // GB
      usagePercent:
        node.storageTotal > 0
          ? (node.storageUsed / node.storageTotal) * 100
          : 0,
    }));
  }, [nodes]);

  const totalUsed = useMemo(
    () => nodes.reduce((sum, n) => sum + n.storageUsed, 0),
    [nodes]
  );
  const totalCapacity = useMemo(
    () => nodes.reduce((sum, n) => sum + n.storageTotal, 0),
    [nodes]
  );

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Storage Distribution</CardTitle>
            <CardDescription>Top 10 nodes by storage usage</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold tabular-nums">
              {formatBytes(totalUsed, { decimals: 1 })}
            </div>
            <div className="text-xs text-muted-foreground">
              of {formatBytes(totalCapacity, { decimals: 1 })} total
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 40 }}
              barGap={0}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                angle={-45}
                textAnchor="end"
                height={50}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis
                tickFormatter={(value) => `${value}G`}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
                width={45}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const data = payload[0].payload as ChartDataPoint;
                  return (
                    <div className="rounded-lg border bg-background p-3 shadow-md">
                      <p className="font-mono text-xs text-muted-foreground mb-2">
                        {data.pubkey.slice(0, 8)}...{data.pubkey.slice(-6)}
                      </p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Used:</span>
                          <span className="font-medium tabular-nums">
                            {data.used.toFixed(1)} GB
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Total:</span>
                          <span className="font-medium tabular-nums">
                            {data.total.toFixed(1)} GB
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Usage:</span>
                          <span className="font-medium tabular-nums">
                            {data.usagePercent.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
              <Bar
                dataKey="used"
                name="Used"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
                stackId="storage"
              />
              <Bar
                dataKey="available"
                name="Available"
                fill="hsl(var(--muted))"
                radius={[4, 4, 0, 0]}
                stackId="storage"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-primary" />
            <span className="text-muted-foreground">Used</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-muted" />
            <span className="text-muted-foreground">Available</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
