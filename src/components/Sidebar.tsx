import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  DownloadCloud,
  Users,
  Package,
  Sliders,
  AlertTriangle,
  FileText,
  Sparkles,
  Palette,
  BookOpen,
} from "lucide-react";
import { useBrand } from "../context/BrandContext";
import { useApp } from "../store/AppStore";

export default function Sidebar() {
  const { brand } = useBrand();
  const { state } = useApp();
  const pendentes = state.divergencias.filter((d) => !d.resolvida).length;

  const items: {
    to: string;
    label: string;
    icon: typeof LayoutDashboard;
    end?: boolean;
    badge?: number;
  }[] = [
    { to: "/", label: "Visao Geral", icon: LayoutDashboard, end: true },
    { to: "/empresas", label: "Empresas", icon: Building2 },
    { to: "/captura", label: "Captura de XML", icon: DownloadCloud },
    { to: "/parceiros", label: "Clientes & Fornecedores", icon: Users },
    { to: "/produtos", label: "Produtos & NCM", icon: Package },
    { to: "/regras", label: "Motor de Regras", icon: Sliders },
    {
      to: "/divergencias",
      label: "Divergencias",
      icon: AlertTriangle,
      badge: pendentes || undefined,
    },
    { to: "/sped", label: "SPED & Apuracao", icon: FileText },
    { to: "/base-fiscal", label: "Base Fiscal", icon: BookOpen },
    { to: "/assistente", label: "Assistente IA", icon: Sparkles },
    { to: "/white-label", label: "White Label", icon: Palette },
  ];

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="px-5 py-5 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div
            className="size-9 rounded-lg grid place-content-center text-white font-bold"
            style={{
              background: `linear-gradient(135deg, ${brand.primary}, ${brand.primaryDark})`,
            }}
          >
            {brand.iconText}
          </div>
          <div>
            <div className="font-semibold leading-tight text-slate-900">
              {brand.nome}
            </div>
            <div className="text-[11px] text-slate-500 leading-tight">
              {brand.slogan}
            </div>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.end}
            className={({ isActive }) =>
              [
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
              ].join(" ")
            }
          >
            <it.icon size={18} />
            <span className="flex-1">{it.label}</span>
            {it.badge ? (
              <span className="bg-rose-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">
                {it.badge}
              </span>
            ) : null}
          </NavLink>
        ))}
      </nav>
      <div className="px-4 py-3 border-t border-slate-200 text-[11px] text-slate-400">
        v3.0 - MVP Preview
      </div>
    </aside>
  );
}
