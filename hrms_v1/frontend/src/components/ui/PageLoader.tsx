import { Drama } from "lucide-react";

export function PageLoader() {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Drama className="h-12 w-12 animate-spin"/>
        {/* <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /> */}
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}
