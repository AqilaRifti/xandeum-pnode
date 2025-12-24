'use client';

import { useMemo, useState } from 'react';
import { Search, Trophy } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Gauge } from '@/components/ui/gauge';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { getHealthInfo } from '@/lib/colors';
import type { Node } from '@/lib/nodeData';

const RANK_MEDALS: Record<number, string> = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
};

export function Leaderboard({
  rankedNodes,
  latestVersion,
}: {
  rankedNodes: Node[];
  latestVersion: string;
}) {
  const [query, setQuery] = useState('');

  const topNodes = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? rankedNodes.filter(
        (n) =>
          n.pubkey.toLowerCase().includes(q) ||
          n.ip.toLowerCase().includes(q)
      )
      : rankedNodes;
    return filtered.slice(0, 10);
  }, [query, rankedNodes]);

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            <CardTitle className="text-base">Top Performing Nodes</CardTitle>
          </div>
          <div className="relative w-full sm:w-[220px]">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search pubkey / IP"
              className="h-8 pl-8 text-sm"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto -mx-6 px-6">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[60px]">Rank</TableHead>
                <TableHead>Node</TableHead>
                <TableHead>Health</TableHead>
                <TableHead className="text-right">Uptime</TableHead>
                <TableHead className="text-right">Storage</TableHead>
                <TableHead>Version</TableHead>
                <TableHead className="text-right">Percentile</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topNodes.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No nodes found
                  </TableCell>
                </TableRow>
              ) : (
                topNodes.map((node) => (
                  <LeaderboardRow
                    key={node.pubkey}
                    node={node}
                    latestVersion={latestVersion}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function LeaderboardRow({
  node,
  latestVersion,
}: {
  node: Node;
  latestVersion: string;
}) {
  const { color } = getHealthInfo(node.healthScore || 0);
  const isLatest = node.version === latestVersion;
  const medal = node.rank ? RANK_MEDALS[node.rank] : null;
  const storagePercent =
    node.storageTotal > 0
      ? ((node.storageUsed / node.storageTotal) * 100).toFixed(1)
      : '0';

  return (
    <TableRow className="group">
      <TableCell>
        <div className="flex items-center gap-1.5 font-medium">
          {medal && <span className="text-base">{medal}</span>}
          <span className="tabular-nums text-muted-foreground">
            {node.rank}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <span className="font-mono text-xs">
          {node.pubkey.slice(0, 6)}...{node.pubkey.slice(-4)}
        </span>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <div className="w-16">
            <Gauge
              value={node.healthScore || 0}
              size="sm"
              showValue={false}
              className="h-1.5"
            />
          </div>
          <span className={`font-medium tabular-nums ${color}`}>
            {node.healthScore}
          </span>
        </div>
      </TableCell>
      <TableCell className="text-right">
        <span className="tabular-nums">{node.uptime.toFixed(1)}d</span>
      </TableCell>
      <TableCell className="text-right">
        <span className="tabular-nums text-muted-foreground">
          {storagePercent}%
        </span>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-xs">v{node.version}</span>
          {isLatest ? (
            <Badge
              variant="secondary"
              className="h-5 px-1.5 text-[10px] font-medium"
            >
              Latest
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="h-5 px-1.5 text-[10px] font-medium text-muted-foreground"
            >
              Outdated
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell className="text-right">
        <span className="text-sm text-muted-foreground">
          {node.percentile ?? '-'}
        </span>
      </TableCell>
    </TableRow>
  );
}
