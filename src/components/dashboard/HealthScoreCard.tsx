'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gauge } from '@/components/ui/gauge';
import { getHealthInfo } from '@/lib/colors';
import { cn } from '@/lib/utils';

interface HealthScoreCardProps {
  score: number;
  title?: string;
  description?: string;
  className?: string;
}

export function HealthScoreCard({
  score,
  title = 'Network Health Score',
  description = 'Overall health of the Xandeum network',
  className = '',
}: HealthScoreCardProps) {
  const { status, label, emoji, color } = getHealthInfo(score);

  return (
    <Card className={cn('relative overflow-hidden', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-4xl font-bold tabular-nums tracking-tight">
              {score}
              <span className="text-lg font-normal text-muted-foreground">
                /100
              </span>
            </div>
            <div className={cn('flex items-center gap-1.5 mt-1 font-medium', color)}>
              <span>{emoji}</span>
              <span>{label}</span>
            </div>
          </div>
          <div className="w-24">
            <div
              className={cn(
                'relative h-24 w-24 rounded-full',
                'before:absolute before:inset-2 before:rounded-full before:bg-background'
              )}
              style={{
                background: `conic-gradient(${getHealthInfo(score).hex} ${score * 3.6}deg, hsl(var(--muted)) 0deg)`,
              }}
            >
              <div className="absolute inset-2 flex items-center justify-center rounded-full bg-background">
                <span className="text-2xl font-bold tabular-nums">{score}</span>
              </div>
            </div>
          </div>
        </div>

        <Gauge value={score} size="sm" showValue={false} className="h-2" />

        {description && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function NodeHealthScore({ score }: { score: number }) {
  const { color } = getHealthInfo(score);

  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          'inline-block h-2 w-2 rounded-full',
          color.replace('text-', 'bg-')
        )}
      />
      <span className={cn('font-medium tabular-nums', color)}>{score}</span>
    </div>
  );
}
