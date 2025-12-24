import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  computeNodes,
  getNetworkStats,
  getNodesByVersion,
  rankNodes,
  type Node
} from '@/lib/nodeData';

export type DashboardData = {
  nodes: Node[];
  rankedNodes: Node[];
  networkStats: ReturnType<typeof getNetworkStats>;
  versionDistribution: ReturnType<typeof getNodesByVersion>;
  updatedAt: string;
};

let cachedRawNodes: Node[] | null = null;
let cachedAtMs = 0;
const CACHE_TTL_MS = 15_000;

export async function loadRawNodes(): Promise<Node[]> {
  const now = Date.now();
  if (cachedRawNodes && now - cachedAtMs < CACHE_TTL_MS) {
    return cachedRawNodes;
  }

  const filePath = join(process.cwd(), 'pnodes.json');
  const text = await readFile(filePath, 'utf8');
  const json = JSON.parse(text) as Node[];

  cachedRawNodes = json;
  cachedAtMs = now;

  return json;
}

export async function getComputedNodes(): Promise<Node[]> {
  const raw = await loadRawNodes();
  return computeNodes(raw);
}

export async function getDashboardData(): Promise<DashboardData> {
  const computed = await getComputedNodes();
  const ranked = rankNodes(computed);

  return {
    nodes: computed,
    rankedNodes: ranked,
    networkStats: getNetworkStats(computed),
    versionDistribution: getNodesByVersion(computed),
    updatedAt: new Date().toISOString()
  };
}
