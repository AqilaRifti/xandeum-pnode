'use client';

import { toast } from 'sonner';
import {
    Copy,
    Download,
    Globe,
    Lock,
    MapPin,
    Server,
    ServerCrash,
    X,
} from 'lucide-react';

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Gauge } from '@/components/ui/gauge';
import { Separator } from '@/components/ui/separator';
import { formatBytes } from '@/lib/utils';
import { getHealthInfo, getHealthBadgeVariant } from '@/lib/colors';
import type { Node } from '@/lib/nodeData';

interface NodeDetailsSidebarProps {
    node: Node | null;
    isOpen: boolean;
    onClose: () => void;
    onViewOnMap?: (pubkey: string) => void;
    onExportNode?: (node: Node) => void;
}

function InfoRow({
    label,
    value,
    copyable = false,
    mono = false,
}: {
    label: string;
    value: string | number;
    copyable?: boolean;
    mono?: boolean;
}) {
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(String(value));
            toast.success('Copied to clipboard');
        } catch {
            toast.error('Failed to copy');
        }
    };

    return (
        <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted-foreground">{label}</span>
            <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${mono ? 'font-mono' : ''}`}>
                    {value}
                </span>
                {copyable && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={handleCopy}
                    >
                        <Copy className="h-3 w-3" />
                    </Button>
                )}
            </div>
        </div>
    );
}

function SectionCard({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-lg border bg-card p-4">
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {title}
            </h4>
            <div className="space-y-1">{children}</div>
        </div>
    );
}

export function NodeDetailsSidebar({
    node,
    isOpen,
    onClose,
    onViewOnMap,
    onExportNode,
}: NodeDetailsSidebarProps) {
    if (!node) return null;

    const healthInfo = getHealthInfo(node.healthScore ?? 0);
    const StatusIcon = node.status === 'online' ? Server : ServerCrash;
    const AccessIcon = node.isPublic ? Globe : Lock;

    const storagePercent =
        node.storageTotal > 0
            ? ((node.storageUsed / node.storageTotal) * 100).toFixed(1)
            : '0';

    const formatLastSeen = (lastSeen: string) => {
        const date = new Date(lastSeen);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        return `${diffDays} days ago`;
    };

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                <SheetHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <SheetTitle className="text-lg">Node Details</SheetTitle>
                    </div>
                </SheetHeader>

                {/* Status Header */}
                <div className="mb-6 flex items-center justify-between rounded-lg border bg-muted/30 p-4">
                    <div className="flex items-center gap-3">
                        <Badge
                            variant={node.status === 'online' ? 'default' : 'destructive'}
                            className="gap-1.5"
                        >
                            <StatusIcon className="h-3.5 w-3.5" />
                            {node.status}
                        </Badge>
                        <Badge variant={getHealthBadgeVariant(node.healthScore ?? 0)}>
                            {healthInfo.emoji} {healthInfo.label}
                        </Badge>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold tabular-nums">
                            {node.healthScore ?? 0}
                            <span className="text-sm text-muted-foreground">/100</span>
                        </div>
                    </div>
                </div>

                {/* Health Gauge */}
                <div className="mb-6">
                    <Gauge
                        value={node.healthScore ?? 0}
                        size="md"
                        showValue={false}
                        className="h-2"
                    />
                </div>

                <div className="space-y-4">
                    {/* Identity Section */}
                    <SectionCard title="Identity">
                        <InfoRow
                            label="Pubkey"
                            value={`${node.pubkey.slice(0, 8)}...${node.pubkey.slice(-6)}`}
                            copyable
                            mono
                        />
                        <InfoRow label="IP Address" value={node.ip} copyable mono />
                        <InfoRow label="RPC Port" value={node.rpcPort} mono />
                    </SectionCard>

                    {/* Performance Section */}
                    <SectionCard title="Performance">
                        <InfoRow
                            label="Uptime"
                            value={`${node.uptime.toFixed(1)} days`}
                        />
                        <InfoRow
                            label="Last Seen"
                            value={formatLastSeen(node.lastSeen)}
                        />
                        <div className="flex items-center justify-between py-2">
                            <span className="text-sm text-muted-foreground">Version</span>
                            <Badge variant="outline" className="font-mono">
                                v{node.version}
                            </Badge>
                        </div>
                    </SectionCard>

                    {/* Storage Section */}
                    <SectionCard title="Storage">
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Used</span>
                                <span className="font-medium tabular-nums">
                                    {formatBytes(node.storageUsed, { decimals: 1 })}
                                </span>
                            </div>
                            <Gauge
                                value={Number(storagePercent)}
                                size="sm"
                                showValue={false}
                                className="h-1.5"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>{storagePercent}% used</span>
                                <span>
                                    of {formatBytes(node.storageTotal, { decimals: 0 })}
                                </span>
                            </div>
                            <Separator />
                            <InfoRow
                                label="Committed"
                                value={formatBytes(node.storageCommitted, { decimals: 1 })}
                            />
                        </div>
                    </SectionCard>

                    {/* Location & Access Section */}
                    <SectionCard title="Access">
                        <div className="flex items-center justify-between py-2">
                            <span className="text-sm text-muted-foreground">Visibility</span>
                            <Badge
                                variant={node.isPublic ? 'secondary' : 'outline'}
                                className="gap-1.5"
                            >
                                <AccessIcon className="h-3 w-3" />
                                {node.isPublic ? 'Public' : 'Private'}
                            </Badge>
                        </div>
                        {node.rank && (
                            <InfoRow label="Rank" value={`#${node.rank}`} />
                        )}
                        {node.percentile && (
                            <InfoRow label="Percentile" value={node.percentile} />
                        )}
                    </SectionCard>
                </div>

                {/* Actions Footer */}
                <div className="mt-6 flex gap-2">
                    {onViewOnMap && (
                        <Button
                            variant="outline"
                            className="flex-1 gap-2"
                            onClick={() => onViewOnMap(node.pubkey)}
                        >
                            <MapPin className="h-4 w-4" />
                            View on Map
                        </Button>
                    )}
                    {onExportNode && (
                        <Button
                            variant="outline"
                            className="flex-1 gap-2"
                            onClick={() => onExportNode(node)}
                        >
                            <Download className="h-4 w-4" />
                            Export
                        </Button>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
