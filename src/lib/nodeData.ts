// Types
export interface Node {
  pubkey: string;
  status: 'online' | 'offline';
  version: string;
  storageUsed: number;
  storageTotal: number;
  uptime: number;
  ip: string;
  lastSeen: string;
  address: string;
  isPublic: boolean;
  rpcPort: number;
  storageCommitted: number;
  storageUsagePercent: number;
  lastSeenTimestamp: number;
  healthScore?: number;
  rank?: number;
  percentile?: string;
  percentileRank?: number;
}

function parseVersion(version: string): number[] {
  return version
    .replace(/^v/i, '')
    .split('.')
    .map((p) => Number(p))
    .map((n) => (Number.isFinite(n) ? n : 0));
}

function compareVersions(a: string, b: string): number {
  const av = parseVersion(a);
  const bv = parseVersion(b);
  const maxLen = Math.max(av.length, bv.length);
  for (let i = 0; i < maxLen; i++) {
    const ai = av[i] ?? 0;
    const bi = bv[i] ?? 0;
    if (ai !== bi) return ai > bi ? 1 : -1;
  }
  return 0;
}

export function getLatestVersion(inputNodes: Node[]): string {
  if (inputNodes.length === 0) return '0.0.0';
  return inputNodes
    .map((n) => n.version)
    .reduce((latest, v) => (compareVersions(v, latest) > 0 ? v : latest));
}

export function computeNodes(inputNodes: Node[]): Node[] {
  const latestVersion = getLatestVersion(inputNodes);
  return inputNodes.map((node) => ({
    ...node,
    healthScore: calculateHealthScore(node, latestVersion),
  }));
}

// Calculate health score for a node
export function calculateHealthScore(node: Node, latestVersion: string = '0.8.0'): number {
  let score = 0;

  // Uptime (40 points) - 30 days = full points
  const uptimeDays = node.uptime;
  score += Math.min((uptimeDays / 30) * 40, 40);

  // Storage Efficiency (25 points) - committed/total ratio
  const efficiency = node.storageCommitted / node.storageTotal;
  score += efficiency * 25;

  // Version Currency (20 points) - latest version = full points
  const isLatest = node.version === latestVersion;
  score += isLatest ? 20 : 10;

  // Public Access (15 points)
  score += node.isPublic ? 15 : 5;

  // Cap at 100
  return Math.min(Math.round(score), 100);
}

// Get health status based on score
export function getHealthStatus(score: number): {
  status: 'excellent' | 'good' | 'fair' | 'poor';
  color: string;
  emoji: string;
} {
  if (score >= 80) return { status: 'excellent', color: 'text-green-500', emoji: '🟢' };
  if (score >= 60) return { status: 'good', color: 'text-yellow-500', emoji: '🟡' };
  if (score >= 40) return { status: 'fair', color: 'text-orange-500', emoji: '🟠' };
  return { status: 'poor', color: 'text-red-500', emoji: '🔴' };
}

// Calculate network statistics
export function getNetworkStats(nodes: Node[]) {
  const onlineNodes = nodes.filter(node => node.status === 'online');
  const totalStorage = onlineNodes.reduce((sum, node) => sum + node.storageTotal, 0);
  const usedStorage = onlineNodes.reduce((sum, node) => sum + node.storageUsed, 0);
  const avgUptime = onlineNodes.reduce((sum, node) => sum + node.uptime, 0) / (onlineNodes.length || 1);
  const publicNodes = onlineNodes.filter(node => node.isPublic).length;
  const avgHealthScore =
    onlineNodes.reduce((sum, node) => sum + (node.healthScore ?? 0), 0) /
    (onlineNodes.length || 1);
  const latestVersion = getLatestVersion(nodes);

  return {
    totalNodes: nodes.length,
    onlineNodes: onlineNodes.length,
    offlineNodes: nodes.length - onlineNodes.length,
    totalStorage,
    usedStorage,
    storageUtilization: totalStorage > 0 ? (usedStorage / totalStorage) * 100 : 0,
    avgUptime,
    avgHealthScore,
    publicNodes,
    privateNodes: onlineNodes.length - publicNodes,
    latestVersion,
  };
}

// Rank nodes by health score
export function rankNodes(nodes: Node[]): Node[] {
  // Sort by health score (descending)
  const sorted = [...nodes].sort((a, b) => (b.healthScore || 0) - (a.healthScore || 0));
  const total = sorted.length || 1;

  // Add rank and percentile
  return sorted.map((node, index) => {
    const percentileRank = ((total - index) / total) * 100;
    let percentileGroup: string;

    if (percentileRank >= 90) percentileGroup = 'Top 10%';
    else if (percentileRank >= 75) percentileGroup = 'Top 25%';
    else if (percentileRank >= 50) percentileGroup = 'Top 50%';
    else percentileGroup = 'Bottom 50%';

    return {
      ...node,
      rank: index + 1,
      percentile: percentileGroup,
      percentileRank,
    };
  });
}

// Get top performers
export function getTopPerformers(nodes: Node[], count: number = 5): Node[] {
  return rankNodes(nodes).slice(0, count);
}

// Get nodes by version
export function getNodesByVersion(nodes: Node[]) {
  const versionMap = new Map<string, number>();

  nodes.forEach(node => {
    const count = versionMap.get(node.version) || 0;
    versionMap.set(node.version, count + 1);
  });

  return Array.from(versionMap.entries()).map(([version, count]) => ({
    version,
    count,
    percentage: (count / nodes.length) * 100,
  }));
}
