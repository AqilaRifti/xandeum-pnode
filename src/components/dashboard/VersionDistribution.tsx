'use client';

import { useMemo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { getNodesByVersion } from '@/lib/nodeData';

const COLORS = [
  'hsl(142, 76%, 36%)', // emerald
  'hsl(var(--primary))',
  'hsl(38, 92%, 50%)', // amber
  'hsl(262, 83%, 58%)', // violet
  'hsl(174, 72%, 40%)', // teal
  'hsl(330, 81%, 60%)', // pink
  'hsl(24, 95%, 53%)', // orange
  'hsl(0, 84%, 60%)', // red
];

interface VersionData {
  version: string;
  count: number;
  percentage: number;
}

export function VersionDistribution({
  versionDistribution,
  latestVersion,
}: {
  versionDistribution: ReturnType<typeof getNodesByVersion>;
  latestVersion: string;
}) {
  const sortedVersions = useMemo<VersionData[]>(
    () => [...versionDistribution].sort((a, b) => b.count - a.count),
    [versionDistribution]
  );

  const totalNodes = useMemo(
    () => sortedVersions.reduce((sum, v) => sum + v.count, 0),
    [sortedVersions]
  );

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Version Distribution</CardTitle>
          <Badge variant="outline" className="tabular-nums">
            {totalNodes} nodes
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sortedVersions}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="count"
                nameKey="version"
              >
                {sortedVersions.map((entry, index) => (
                  <Cell
                    key={`cell-${entry.version}`}
                    fill={COLORS[index % COLORS.length]}
                    stroke="hsl(var(--background))"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const data = payload[0].payload as VersionData;
                  return (
                    <div className="rounded-lg border bg-background p-3 shadow-md">
                      <p className="font-mono text-sm font-medium mb-1">
                        v{data.version}
                      </p>
                      <div className="text-sm text-muted-foreground">
                        {data.count} nodes ({data.percentage.toFixed(1)}%)
                      </div>
                    </div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="space-y-2 mt-2">
          {sortedVersions.slice(0, 5).map((version, index) => (
            <div
              key={version.version}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="font-mono text-xs">v{version.version}</span>
                {version.version === latestVersion && (
                  <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
                    Latest
                  </Badge>
                )}
              </div>
              <span className="text-muted-foreground tabular-nums text-xs">
                {version.count} ({version.percentage.toFixed(0)}%)
              </span>
            </div>
          ))}
          {sortedVersions.length > 5 && (
            <div className="text-xs text-muted-foreground text-center pt-1">
              +{sortedVersions.length - 5} more versions
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
