import { Bell, Search, ChevronDown } from "lucide-react";
import { useBrand } from "../context/BrandContext";

export default function TopBar() {
  const { brand } = useBrand();

  return (
    <header className="h-16 border-b border-slate-200 bg-white px-6 flex items-center gap-4 sticky top-0 z-20">
      <div className="lg:hidden flex items-center gap-2">
        <div
          className="size-8 rounded-lg grid place-content-center text-white font-bold"
          style={{
            background: `linear-gradient(135deg, ${brand.primary}, ${brand.primaryDark})`,
          }}
        >
          {brand.iconText}
        </div>
        <span className="font-semibold">{brand.nome}</span>
      </div>

      <div className="flex-1 max-w-xl relative hidden md:block">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          className="input pl-9"
          placeholder="Buscar empresa, CNPJ, NCM, chave de acesso..."
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button className="size-9 grid place-content-center rounded-lg hover:bg-slate-100 text-slate-600 relative">
          <Bell size={18} />
          <span className="absolute top-2 right-2 size-2 rounded-full bg-rose-500" />
        </button>
        <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-200 ml-1">
          <div className="size-9 rounded-full bg-brand-100 text-brand-700 grid place-content-center font-semibold text-sm">
            GA
          </div>
          <div className="text-sm leading-tight">
            <div className="font-medium text-slate-800">Gislaine Araujo</div>
            <div className="text-[11px] text-slate-500">
              Escritorio Contabil Aurora
            </div>
          </div>
          <ChevronDown size={14} className="text-slate-400" />
        </div>
      </div>
    </header>
  );
}
