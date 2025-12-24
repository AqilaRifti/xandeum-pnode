'use client';

import {
  Activity,
  Database,
  Globe,
  HardDrive,
  Server,
  TrendingUp,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import type { getNetworkStats } from '@/lib/nodeData';
import { formatBytes } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

function StatCard({ title, value, description, icon }: StatCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tabular-nums tracking-tight">
              {value}
            </p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function NetworkStats({
  networkStats,
}: {
  networkStats: ReturnType<typeof getNetworkStats>;
}) {
  const onlinePercent =
    networkStats.totalNodes > 0
      ? Math.round((networkStats.onlineNodes / networkStats.totalNodes) * 100)
      : 0;

  const publicPercent =
    networkStats.onlineNodes > 0
      ? Math.round((networkStats.publicNodes / networkStats.onlineNodes) * 100)
      : 0;

  const stats: StatCardProps[] = [
    {
      title: 'Total Nodes',
      value: networkStats.totalNodes,
      description: `${networkStats.onlineNodes} online (${onlinePercent}%)`,
      icon: <Server className="h-5 w-5" />,
    },
    {
      title: 'Total Storage',
      value: formatBytes(networkStats.totalStorage, { decimals: 1 }),
      description: `${formatBytes(networkStats.usedStorage, { decimals: 1 })} used`,
      icon: <HardDrive className="h-5 w-5" />,
    },
    {
      title: 'Storage Utilization',
      value: `${networkStats.storageUtilization.toFixed(1)}%`,
      description: 'Network capacity usage',
      icon: <Database className="h-5 w-5" />,
    },
    {
      title: 'Average Uptime',
      value: `${networkStats.avgUptime.toFixed(1)}d`,
      description: 'Across all online nodes',
      icon: <Activity className="h-5 w-5" />,
    },
    {
      title: 'Public Nodes',
      value: networkStats.publicNodes,
      description: `${publicPercent}% of online nodes`,
      icon: <Globe className="h-5 w-5" />,
    },
    {
      title: 'Latest Version',
      value: `v${networkStats.latestVersion}`,
      description: 'Current network version',
      icon: <TrendingUp className="h-5 w-5" />,
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
}
