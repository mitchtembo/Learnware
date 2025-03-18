import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
  fullHeight?: boolean;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12"
};

export function Loading({
  size = "md",
  text,
  className,
  fullHeight = false
}: LoadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2",
        fullHeight && "h-full min-h-[200px]",
        className
      )}
    >
      <Loader2
        className={cn(
          "animate-spin text-primary",
          sizeClasses[size]
        )}
      />
      {text && (
        <p className="text-sm text-muted-foreground">{text}</p>
      )}
    </div>
  );
}

export function LoadingOverlay({
  text = "Loading...",
  className
}: {
  text?: string;
  className?: string;
}) {
  return (
    <div className={cn(
      "fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center",
      className
    )}>
      <div className="bg-background border rounded-lg p-8 shadow-lg flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-center font-medium">{text}</p>
      </div>
    </div>
  );
}

export function LoadingButton({
  size = "sm",
  className
}: {
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <Loader2
      className={cn(
        "animate-spin",
        size === "sm" ? "h-4 w-4" : "h-5 w-5",
        className
      )}
    />
  );
}

export function PageLoader({ text = "Loading page..." }: { text?: string }) {
  return (
    <div className="h-[calc(100vh-4rem)] w-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg font-medium">{text}</p>
      </div>
    </div>
  );
}

export function SkeletonLoader({
  className,
  count = 1
}: {
  className?: string;
  count?: number;
}) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "animate-pulse bg-muted rounded-md",
            className
          )}
        />
      ))}
    </>
  );
} 