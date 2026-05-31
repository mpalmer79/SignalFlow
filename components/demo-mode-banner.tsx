import { ShieldCheck } from "lucide-react";

export function DemoModeBanner() {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-warning/30 bg-warning/10 px-4 py-2 text-xs text-warning sm:px-6">
      <span className="flex items-center gap-1.5 font-semibold">
        <ShieldCheck className="h-3.5 w-3.5" />
        Demo mode
      </span>
      <span className="text-warning/90">
        No live SMS, email, or voice. Mock providers only. No real customer data.
      </span>
    </div>
  );
}
