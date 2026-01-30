import React from "react"
import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "animate-pulse rounded-md bg-muted",
        className
      )}
      {...props}
    />
  )
)
Skeleton.displayName = "Skeleton"

// Specific skeleton variants
export const NoteCardSkeleton = () => (
  <div className="space-y-4 rounded-lg border border-border p-4">
    <div className="space-y-2">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-full" />
    </div>
    <Skeleton className="h-8 w-1/4" />
  </div>
)

export const NoteGridSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <NoteCardSkeleton key={i} />
    ))}
  </div>
)

export const FullPageSkeleton = () => (
  <div className="space-y-6">
    <Skeleton className="h-10 w-1/3" />
    <Skeleton className="h-10 w-full" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <NoteCardSkeleton key={i} />
      ))}
    </div>
  </div>
)

export { Skeleton }
