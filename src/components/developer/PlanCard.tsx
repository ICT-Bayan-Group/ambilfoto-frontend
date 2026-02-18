import { useState } from "react";
import { Plan } from "@/services/api/developer.service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Check, Zap, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlanCardProps {
  plan: Plan;
  isPopular?: boolean;
  onSelect: (plan: Plan) => void;
  loading?: boolean;
  currentPlanId?: string;
}

export const PlanCard = ({ plan, isPopular, onSelect, loading, currentPlanId }: PlanCardProps) => {
  const isCurrent = plan.id === currentPlanId;

  return (
    <Card
      className={cn(
        "relative flex flex-col transition-smooth",
        isPopular
          ? "border-primary shadow-strong ring-2 ring-primary/20"
          : "border-border shadow-soft hover:shadow-strong"
      )}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground px-3 py-1 shadow-soft">
            <Zap className="h-3 w-3 mr-1" />
            Most Popular
          </Badge>
        </div>
      )}

      <CardHeader className="pb-4 pt-6">
        <h3 className="text-xl font-bold">{plan.name}</h3>
        <div className="mt-2">
          {plan.is_custom ? (
            <p className="text-2xl font-bold text-primary">Hubungi Kami</p>
          ) : (
            <p className="text-3xl font-bold">
              {plan.price_formatted}
              <span className="text-sm font-normal text-muted-foreground">/bulan</span>
            </p>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        {!plan.is_custom && (
          <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted/50 p-3 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Storage</p>
              <p className="font-semibold">{plan.storage_label || `${plan.storage_gb} GB`}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Upload / Bulan</p>
              <p className="font-semibold">{plan.upload_label || `${plan.upload_limit.toLocaleString()} foto`}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Rate Limit</p>
              <p className="font-semibold">{plan.rate_limit_rpm} req/min</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Support SLA</p>
              <p className="font-semibold">{plan.sla_hours}h</p>
            </div>
          </div>
        )}
        <ul className="space-y-2">
          {(plan.features || []).map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm">
              <Check className="h-4 w-4 text-secondary shrink-0 mt-0.5" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="pt-4">
        {plan.is_custom ? (
          <Button variant="outline" className="w-full" onClick={() => onSelect(plan)}>
            <Phone className="h-4 w-4 mr-2" />
            Contact Sales
          </Button>
        ) : isCurrent ? (
          <Button className="w-full" variant="secondary" disabled>
            Current Plan
          </Button>
        ) : (
          <Button
            className={cn("w-full", isPopular && "shadow-strong")}
            variant={isPopular ? "default" : "outline"}
            onClick={() => onSelect(plan)}
            disabled={loading}
          >
            {loading ? "Processing..." : "Get Started"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
