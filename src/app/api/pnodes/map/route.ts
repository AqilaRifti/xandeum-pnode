import { NextResponse } from 'next/server';

import { resolveNodeGeo } from '@/lib/geo.server';
import { getComputedNodes } from '@/lib/nodeData.server';

export const dynamic = 'force-dynamic';

type MapNode = {
  pubkey: string;
  lat: number;
  lng: number;
  country: string;
  region: string;
  city?: string;
  status: 'online' | 'offline';
  healthScore: number;
  version: string;
  lastSeen?: string;
};

export async function GET() {
  try {
    const nodes = await getComputedNodes();

    const MAX_NODES = 200;
    const BATCH_SIZE = 20;
    const GEO_TIMEOUT_MS = 2000;

    const limitedNodes = nodes.slice(0, MAX_NODES);

    const results: MapNode[] = [];

    for (let i = 0; i < limitedNodes.length; i += BATCH_SIZE) {
      const batch = limitedNodes.slice(i, i + BATCH_SIZE);

      const settled = await Promise.allSettled(
        batch.map(async (node) => {
          const geo = await resolveNodeGeo(node.address || node.ip, GEO_TIMEOUT_MS);
          if (!geo) return null;

          return {
            pubkey: node.pubkey,
            lat: geo.lat,
            lng: geo.lng,
            country: geo.country,
            region: geo.region,
            city: geo.city,
            status: node.status,
            healthScore: node.healthScore ?? 0,
            version: node.version,
            lastSeen: node.lastSeen,
          } satisfies MapNode;
        })
      );

      for (const item of settled) {
        if (item.status === 'fulfilled' && item.value) {
          results.push(item.value);
        }
      }
    }

    return NextResponse.json(results);
  } catch {
    return NextResponse.json([]);
  }
}
