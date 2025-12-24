'use client';

import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Minus, Plus, RotateCcw } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { getHealthColor, MAP_LEGEND_ITEMS } from '@/lib/colors';
import {
    applyMapFilters,
    DEFAULT_MAP_FILTERS,
    isDefaultFilters,
    type MapFilters,
    type MapNode,
} from '@/lib/mapFilters';

function makeMarkerIcon(score: number, isHighlighted = false) {
    const color = getHealthColor(score);
    const size = isHighlighted ? 20 : 14;
    const pulse = isHighlighted
        ? 'animation: pulse 1.5s ease-in-out infinite;'
        : '';

    return L.divIcon({
        className: '',
        html: `
      <style>
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.8; }
        }
      </style>
      <div style="
        width: ${size}px;
        height: ${size}px;
        border-radius: 9999px;
        background: ${color};
        border: 2px solid ${isHighlighted ? '#fff' : 'rgba(255,255,255,0.65)'};
        box-shadow: 0 0 0 ${isHighlighted ? '6px' : '4px'} rgba(0,0,0,0.25);
        ${pulse}
      "></div>
    `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -size / 2],
    });
}

// Map controls component
function MapControls({ onReset }: { onReset: () => void }) {
    const map = useMap();

    return (
        <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-1">
            <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 shadow-md"
                onClick={() => map.zoomIn()}
            >
                <Plus className="h-4 w-4" />
            </Button>
            <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 shadow-md"
                onClick={() => map.zoomOut()}
            >
                <Minus className="h-4 w-4" />
            </Button>
            <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 shadow-md"
                onClick={onReset}
            >
                <RotateCcw className="h-4 w-4" />
            </Button>
        </div>
    );
}

// Component to handle map centering on highlighted node
function MapCenterHandler({
    highlightedNode,
}: {
    highlightedNode: MapNode | null;
}) {
    const map = useMap();

    useEffect(() => {
        if (highlightedNode) {
            map.setView([highlightedNode.lat, highlightedNode.lng], 6, {
                animate: true,
                duration: 1,
            });
        }
    }, [highlightedNode, map]);

    return null;
}

// Map legend component
function MapLegend() {
    return (
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            {MAP_LEGEND_ITEMS.map((item) => (
                <div key={item.status} className="flex items-center gap-1.5">
                    <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                    />
                    <span className="text-muted-foreground">{item.label}</span>
                </div>
            ))}
        </div>
    );
}


// Map filters component
function MapFiltersBar({
    filters,
    onFiltersChange,
    onReset,
    isDefault,
}: {
    filters: MapFilters;
    onFiltersChange: (filters: MapFilters) => void;
    onReset: () => void;
    isDefault: boolean;
}) {
    return (
        <div className="flex flex-wrap items-center gap-4 rounded-lg border bg-muted/30 p-3">
            <div className="flex items-center gap-3">
                <Label className="text-sm font-medium">Status:</Label>
                <div className="flex items-center gap-2">
                    <Checkbox
                        id="online"
                        checked={filters.statuses.includes('online')}
                        onCheckedChange={(checked) => {
                            const newStatuses = checked
                                ? [...filters.statuses, 'online' as const]
                                : filters.statuses.filter((s) => s !== 'online');
                            onFiltersChange({ ...filters, statuses: newStatuses });
                        }}
                    />
                    <Label htmlFor="online" className="text-sm">
                        Online
                    </Label>
                </div>
                <div className="flex items-center gap-2">
                    <Checkbox
                        id="offline"
                        checked={filters.statuses.includes('offline')}
                        onCheckedChange={(checked) => {
                            const newStatuses = checked
                                ? [...filters.statuses, 'offline' as const]
                                : filters.statuses.filter((s) => s !== 'offline');
                            onFiltersChange({ ...filters, statuses: newStatuses });
                        }}
                    />
                    <Label htmlFor="offline" className="text-sm">
                        Offline
                    </Label>
                </div>
            </div>

            <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                <Label className="text-sm font-medium whitespace-nowrap">
                    Health: {filters.healthRange[0]}-{filters.healthRange[1]}
                </Label>
                <Slider
                    value={filters.healthRange}
                    onValueChange={(value) =>
                        onFiltersChange({
                            ...filters,
                            healthRange: value as [number, number],
                        })
                    }
                    min={0}
                    max={100}
                    step={5}
                    className="flex-1"
                />
            </div>

            {!isDefault && (
                <Button variant="ghost" size="sm" onClick={onReset}>
                    Reset
                </Button>
            )}
        </div>
    );
}

// Fallback for loading
const MapFallback = () => (
    <div className="h-[400px] w-full bg-muted/20 rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">Loading map...</p>
    </div>
);

interface NodeMapInnerProps {
    highlightedNodePubkey?: string | null;
}

export function NodeMapInner({ highlightedNodePubkey }: NodeMapInnerProps) {
    const [nodeLocations, setNodeLocations] = useState<MapNode[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState<MapFilters>(DEFAULT_MAP_FILTERS);
    const [mapKey, setMapKey] = useState(0);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                setIsLoading(true);
                const res = await fetch('/api/pnodes/map', { cache: 'no-store' });
                if (!res.ok) {
                    if (!cancelled) setNodeLocations([]);
                    return;
                }
                const data = (await res.json()) as MapNode[];
                if (!cancelled) setNodeLocations(data);
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, []);

    const filteredNodes = useMemo(
        () => applyMapFilters(nodeLocations, filters),
        [nodeLocations, filters]
    );

    const highlightedNode = useMemo(
        () =>
            highlightedNodePubkey
                ? nodeLocations.find((n) => n.pubkey === highlightedNodePubkey) ?? null
                : null,
        [nodeLocations, highlightedNodePubkey]
    );

    const center = useMemo(() => {
        if (highlightedNode) {
            return { lat: highlightedNode.lat, lng: highlightedNode.lng };
        }
        if (filteredNodes.length > 0) {
            return {
                lat:
                    filteredNodes.reduce((sum, loc) => sum + loc.lat, 0) /
                    filteredNodes.length,
                lng:
                    filteredNodes.reduce((sum, loc) => sum + loc.lng, 0) /
                    filteredNodes.length,
            };
        }
        return { lat: 20, lng: 0 };
    }, [filteredNodes, highlightedNode]);

    const handleReset = () => {
        setFilters(DEFAULT_MAP_FILTERS);
        setMapKey((k) => k + 1);
    };

    return (
        <Card>
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle>Node Geographic Distribution</CardTitle>
                    <Badge variant="outline" className="tabular-nums">
                        {filteredNodes.length} of {nodeLocations.length} nodes
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Filters */}
                <MapFiltersBar
                    filters={filters}
                    onFiltersChange={setFilters}
                    onReset={handleReset}
                    isDefault={isDefaultFilters(filters)}
                />

                {/* Map */}
                {isLoading ? (
                    <MapFallback />
                ) : (
                    <div className="h-[400px] w-full rounded-lg overflow-hidden relative">
                        <MapContainer
                            key={mapKey}
                            center={[center.lat, center.lng]}
                            zoom={2}
                            style={{ height: '100%', width: '100%' }}
                            zoomControl={false}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            />
                            <MapControls onReset={handleReset} />
                            <MapCenterHandler highlightedNode={highlightedNode} />
                            {filteredNodes.map((node) => (
                                <Marker
                                    key={node.pubkey}
                                    position={[node.lat, node.lng]}
                                    icon={makeMarkerIcon(
                                        node.healthScore,
                                        node.pubkey === highlightedNodePubkey
                                    )}
                                >
                                    <Popup>
                                        <div className="space-y-1.5 min-w-[180px]">
                                            <div className="font-mono text-sm font-medium">
                                                {node.pubkey.slice(0, 8)}...{node.pubkey.slice(-6)}
                                            </div>
                                            <div className="text-sm">
                                                <span className="text-muted-foreground">Health:</span>{' '}
                                                <span className="font-medium">{node.healthScore}/100</span>
                                            </div>
                                            <div className="text-sm">
                                                <span className="text-muted-foreground">Version:</span>{' '}
                                                <span className="font-mono">v{node.version}</span>
                                            </div>
                                            <div className="text-sm">
                                                <span className="text-muted-foreground">Location:</span>{' '}
                                                {node.city ? `${node.city}, ` : ''}
                                                {node.region}, {node.country}
                                            </div>
                                            <div className="text-sm">
                                                <span className="text-muted-foreground">Status:</span>{' '}
                                                <span
                                                    className={
                                                        node.status === 'online'
                                                            ? 'text-emerald-500'
                                                            : 'text-red-500'
                                                    }
                                                >
                                                    {node.status}
                                                </span>
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </div>
                )}

                {/* Legend */}
                <MapLegend />
            </CardContent>
        </Card>
    );
}
