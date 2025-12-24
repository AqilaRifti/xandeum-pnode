import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

interface GaugeProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  value: number
  size?: "sm" | "md" | "lg"
  showValue?: boolean
  label?: string
}

const Gauge = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  GaugeProps
>(({ className, value, size = "md", showValue = true, label, ...props }, ref) => {
  const getColor = (val: number) => {
    if (val >= 80) return "bg-green-500"
    if (val >= 60) return "bg-yellow-500"
    if (val >= 40) return "bg-orange-500"
    return "bg-red-500"
  }

  const sizeClasses = {
    sm: "h-2 text-xs",
    md: "h-3 text-sm",
    lg: "h-4 text-base"
  }

  return (
    <div className="w-full space-y-1">
      {(showValue || label) && (
        <div className="flex justify-between text-xs text-muted-foreground">
          {label && <span>{label}</span>}
          {showValue && <span>{Math.round(value)}%</span>}
        </div>
      )}
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(
          "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            "h-full w-full flex-1 transition-all",
            getColor(value)
          )}
          style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
        />
      </ProgressPrimitive.Root>
    </div>
  )
})
Gauge.displayName = "Gauge"

export { Gauge }
