import type { DivergenceStatus } from "../types";
import { CheckCircle2, AlertTriangle, AlertOctagon } from "lucide-react";

const map: Record<
  DivergenceStatus,
  { label: string; className: string; Icon: typeof CheckCircle2 }
> = {
  ok: { label: "OK", className: "badge-ok", Icon: CheckCircle2 },
  warn: { label: "Atencao", className: "badge-warn", Icon: AlertTriangle },
  crit: { label: "Critico", className: "badge-crit", Icon: AlertOctagon },
};

export default function StatusBadge({ status }: { status: DivergenceStatus }) {
  const { label, className, Icon } = map[status];
  return (
    <span className={className}>
      <Icon size={12} /> {label}
    </span>
  );
}
