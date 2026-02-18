import { cn } from "@/lib/utils";

interface UsageBarProps {
  label: string;
  used: number;
  limit: number;
  unit?: string;
  pct: number;
}

export const UsageBar = ({ label, used, limit, unit = "", pct }: UsageBarProps) => {
  const color =
    pct >= 90 ? "bg-destructive" : pct >= 70 ? "bg-yellow-500" : "bg-primary";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {used.toLocaleString()}{unit} / {limit.toLocaleString()}{unit}
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground text-right">{pct}% used</p>
    </div>
  );
};
