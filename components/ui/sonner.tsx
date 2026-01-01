// src/components/ui/sonner.tsx - VERSION FIXED
"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

// PERBAIKAN: Gunakan icon names yang valid dari lucide-react
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Loader2,
  Info 
} from "lucide-react"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-right"
      duration={4000}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-lg group-[.toaster]:p-4",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:text-sm",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:text-xs group-[.toast]:font-medium",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:text-xs group-[.toast]:font-medium",
          success: "group-[.toaster]:border-sky-200 group-[.toaster]:bg-sky-50 group-[.toast]:text-sky-900",
          error: "group-[.toaster]:border-red-200 group-[.toaster]:bg-red-50 group-[.toast]:text-red-900",
          warning: "group-[.toaster]:border-yellow-200 group-[.toaster]:bg-yellow-50 group-[.toast]:text-yellow-900",
          info: "group-[.toaster]:border-blue-200 group-[.toaster]:bg-blue-50 group-[.toast]:text-blue-900",
          loading: "group-[.toaster]:border-slate-200 dark:border-slate-700 group-[.toaster]:bg-slate-50 dark:bg-slate-800 group-[.toast]:text-slate-900 dark:text-white",
        },
      }}
      icons={{
        success: <CheckCircle2 className="h-4 w-4 text-sky-600" />,
        error: <XCircle className="h-4 w-4 text-red-600" />,
        warning: <AlertTriangle className="h-4 w-4 text-yellow-600" />,
        info: <Info className="h-4 w-4 text-blue-600" />,
        loading: <Loader2 className="h-4 w-4 animate-spin text-slate-600 dark:text-slate-400" />,
      }}
      {...props}
    />
  )
}

export { Toaster }