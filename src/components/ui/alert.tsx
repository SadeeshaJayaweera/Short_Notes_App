import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from "lucide-react"

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg]:absolute [&>svg]:top-4 [&>svg]:left-4 [&>svg+div]:pl-7",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground border-border",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
        success:
          "border-green-500/50 text-green-700 dark:text-green-200 bg-green-50 dark:bg-green-950/20 [&>svg]:text-green-600",
        warning:
          "border-yellow-500/50 text-yellow-700 dark:text-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 [&>svg]:text-yellow-600",
        info: "border-blue-500/50 text-blue-700 dark:text-blue-200 bg-blue-50 dark:bg-blue-950/20 [&>svg]:text-blue-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-tight tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

// Icon components for different alert types
const AlertIcon = ({
  variant = "default",
  className,
}: {
  variant?: "default" | "destructive" | "success" | "warning" | "info"
  className?: string
}) => {
  const iconProps = { className: cn("h-4 w-4", className) }

  switch (variant) {
    case "destructive":
      return <AlertCircle {...iconProps} />
    case "success":
      return <CheckCircle2 {...iconProps} />
    case "warning":
      return <AlertTriangle {...iconProps} />
    case "info":
      return <Info {...iconProps} />
    default:
      return <AlertCircle {...iconProps} />
  }
}

export { Alert, AlertTitle, AlertDescription, AlertIcon }
