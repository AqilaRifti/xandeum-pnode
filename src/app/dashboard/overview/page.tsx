'use client';

import { useEffect, useMemo, useState } from 'react';

import { NetworkStats } from "@/components/dashboard/NetworkStats";
import { HealthScoreCard } from "@/components/dashboard/HealthScoreCard";
import { Leaderboard } from "@/components/dashboard/Leaderboard";
import { NodeMap } from "@/components/dashboard/NodeMap";
import { StorageChart } from "@/components/dashboard/StorageChart";
import { VersionDistribution } from "@/components/dashboard/VersionDistribution";
import {
  getNetworkStats,
  getNodesByVersion,
  rankNodes,
  type Node
} from "@/lib/nodeData";

export default function OverviewPage() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const res = await fetch('/api/pnodes', { cache: 'no-store' });
      if (!res.ok) return;

      const data = (await res.json()) as { nodes?: Node[]; updatedAt?: string };
      if (cancelled) return;

      setNodes(Array.isArray(data.nodes) ? data.nodes : []);
      setUpdatedAt(typeof data.updatedAt === 'string' ? data.updatedAt : null);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const rankedNodes = useMemo(() => rankNodes(nodes), [nodes]);
  const networkStats = useMemo(() => getNetworkStats(nodes), [nodes]);
  const versionDistribution = useMemo(() => getNodesByVersion(nodes), [nodes]);
  const healthScore = useMemo(
    () => Math.round(networkStats.avgHealthScore),
    [networkStats.avgHealthScore]
  );

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Xandeum pNode Analytics</h2>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-0.5 text-sm font-medium text-green-800">
              <span className="h-2 w-2 rounded-full bg-green-500 mr-1.5"></span>
              Live
            </span>
          </div>
        </div>
        
        {/* Network Stats */}
        <NetworkStats networkStats={networkStats} />
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Health Score Card */}
          <HealthScoreCard 
            score={healthScore} // Example calculation
            title="Network Health Score"
            description="Based on uptime, storage efficiency, version, and public accessibility"
            className="lg:col-span-2"
          />
          
          {/* Storage Chart */}
          <div className="lg:col-span-5">
            <StorageChart nodes={nodes} />
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Version Distribution */}
          <div className="lg:col-span-2">
            <VersionDistribution
              versionDistribution={versionDistribution}
              latestVersion={networkStats.latestVersion}
            />
          </div>
          
          {/* Leaderboard */}
          <div className="lg:col-span-5">
            <Leaderboard
              rankedNodes={rankedNodes}
              latestVersion={networkStats.latestVersion}
            />
          </div>
        </div>
        
        {/* Node Map */}
        <NodeMap />
        
        <div className="text-center text-sm text-muted-foreground mt-4">
          Last updated: {updatedAt ? new Date(updatedAt).toLocaleString() : new Date().toLocaleString()}
        </div>
      </div>
    </div>
  );
}
