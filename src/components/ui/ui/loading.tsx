import type React from "react"
import { Button } from "./button"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

export interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  children: React.ReactNode
}

export function LoadingButton({ loading, children, className, disabled, ...props }: LoadingButtonProps) {
  return (
    <Button className={cn(className)} disabled={disabled || loading} {...props}>
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  )
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  )
}

export function Loading() {
  return (
    <div className="flex items-center justify-center p-4">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>
  )
}
