'use client';

import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Fallback for SSR and loading
const MapFallback = () => (
  <div className="h-[400px] w-full bg-muted/20 rounded-lg flex items-center justify-center">
    <p className="text-muted-foreground">Loading map...</p>
  </div>
);

// Dynamically import the map implementation to avoid SSR issues with Leaflet
const NodeMapInner = dynamic(
  () => import('./NodeMapInner').then((mod) => mod.NodeMapInner),
  {
    ssr: false,
    loading: () => (
      <Card>
        <CardHeader>
          <CardTitle>Node Geographic Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <MapFallback />
        </CardContent>
      </Card>
    ),
  }
);

interface NodeMapProps {
  highlightedNodePubkey?: string | null;
}

export function NodeMap({ highlightedNodePubkey }: NodeMapProps) {
  return <NodeMapInner highlightedNodePubkey={highlightedNodePubkey} />;
}
