'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Upload, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

import { HealthScoreCard } from '@/components/dashboard/HealthScoreCard';
import { Leaderboard } from '@/components/dashboard/Leaderboard';
import { NetworkStats } from '@/components/dashboard/NetworkStats';
import { NodeMap } from '@/components/dashboard/NodeMap';
import { NodeTable } from '@/components/dashboard/NodeTable';
import { StorageChart } from '@/components/dashboard/StorageChart';
import { VersionDistribution } from '@/components/dashboard/VersionDistribution';
import { NodeDetailsSidebar } from '@/components/dashboard/NodeDetailsSidebar';
import { ExportDialog } from '@/components/dashboard/ExportDialog';
import { ImportDialog } from '@/components/dashboard/ImportDialog';
import { Button } from '@/components/ui/button';
import { exportAndDownload, getDefaultExportColumns } from '@/lib/export';
import type { DashboardData } from '@/lib/nodeData.server';
import type { Node } from '@/lib/nodeData';

export function DashboardClient({
  initialData,
}: {
  initialData: DashboardData;
}) {
  const [data, setData] = useState<DashboardData>(initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sidebar state
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Map highlight state
  const [highlightedNodePubkey, setHighlightedNodePubkey] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    const refresh = async () => {
      try {
        setIsRefreshing(true);
        const res = await fetch('/api/pnodes', { cache: 'no-store' });
        if (!res.ok) return;
        const next = (await res.json()) as DashboardData;
        if (!cancelled) setData(next);
      } finally {
        if (!cancelled) setIsRefreshing(false);
      }
    };

    const id = window.setInterval(refresh, 15_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  const healthScore = useMemo(
    () => Math.round(data.networkStats.avgHealthScore),
    [data.networkStats.avgHealthScore]
  );

  // Sidebar handlers
  const handleNodeSelect = useCallback((node: Node) => {
    setSelectedNode(node);
    setIsSidebarOpen(true);
  }, []);

  const handleSidebarClose = useCallback(() => {
    setIsSidebarOpen(false);
    // Delay clearing selected node for animation
    setTimeout(() => setSelectedNode(null), 300);
  }, []);

  const handleViewOnMap = useCallback((pubkey: string) => {
    setHighlightedNodePubkey(pubkey);
    setIsSidebarOpen(false);
    // Scroll to map
    mapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // Clear highlight after a few seconds
    setTimeout(() => setHighlightedNodePubkey(null), 5000);
  }, []);

  const handleExportNode = useCallback((node: Node) => {
    exportAndDownload(
      [node],
      {
        format: 'json',
        columns: getDefaultExportColumns(),
        filename: `node-${node.pubkey.slice(0, 8)}.json`,
      },
      data.networkStats
    );
    toast.success('Node data exported');
  }, [data.networkStats]);

  // Manual refresh
  const handleManualRefresh = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch('/api/pnodes', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to refresh');
      const next = (await res.json()) as DashboardData;
      setData(next);
      toast.success('Data refreshed');
    } catch {
      toast.error('Failed to refresh data');
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Xandeum pNode Analytics
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Operator intelligence for storage, uptime, and network health
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <ExportDialog
              nodes={data.rankedNodes}
              networkStats={data.networkStats}
              trigger={
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
              }
            />
            <ImportDialog
              trigger={
                <Button variant="outline" size="sm" className="gap-2">
                  <Upload className="h-4 w-4" />
                  <span className="hidden sm:inline">Import</span>
                </Button>
              }
            />
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
              <span className="mr-1.5 h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              {isRefreshing ? 'Refreshing' : 'Live'}
            </span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-6"
        >
          {/* Network Stats */}
          <NetworkStats networkStats={data.networkStats} />

          {/* Health Score & Storage Chart */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <HealthScoreCard
              score={healthScore}
              title="Network Health Score"
              description="40% uptime, 25% storage efficiency, 20% version currency, 15% public access"
              className="lg:col-span-2"
            />
            <div className="lg:col-span-5">
              <StorageChart nodes={data.nodes} />
            </div>
          </div>

          {/* Version Distribution & Leaderboard */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <div className="lg:col-span-2">
              <VersionDistribution
                versionDistribution={data.versionDistribution}
                latestVersion={data.networkStats.latestVersion}
              />
            </div>
            <div className="lg:col-span-5">
              <Leaderboard
                rankedNodes={data.rankedNodes}
                latestVersion={data.networkStats.latestVersion}
              />
            </div>
          </div>

          {/* Map */}
          <div ref={mapRef}>
            <NodeMap highlightedNodePubkey={highlightedNodePubkey} />
          </div>

          {/* Node Table */}
          <NodeTable
            nodes={data.rankedNodes}
            onNodeSelect={handleNodeSelect}
            selectedNodePubkey={selectedNode?.pubkey}
          />

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground py-4">
            Last updated: {new Date(data.updatedAt).toLocaleString()}
          </div>
        </motion.div>
      </div>

      {/* Node Details Sidebar */}
      <NodeDetailsSidebar
        node={selectedNode}
        isOpen={isSidebarOpen}
        onClose={handleSidebarClose}
        onViewOnMap={handleViewOnMap}
        onExportNode={handleExportNode}
      />
    </div>
  );
}
