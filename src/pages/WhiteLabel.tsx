import { useState } from "react";
import { Save, RotateCcw, Palette as PaletteIcon } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { useBrand } from "../context/BrandContext";

const presets = [
  { primary: "#1a5fe8", primaryDark: "#163473", nome: "Brand Blue" },
  { primary: "#0ea5e9", primaryDark: "#0c4a6e", nome: "Sky" },
  { primary: "#10b981", primaryDark: "#065f46", nome: "Emerald" },
  { primary: "#7c3aed", primaryDark: "#3b0764", nome: "Violet" },
  { primary: "#e11d48", primaryDark: "#7f1d1d", nome: "Rose" },
  { primary: "#0f172a", primaryDark: "#020617", nome: "Slate" },
];

export default function WhiteLabel() {
  const { brand, setBrand, reset } = useBrand();
  const [draft, setDraft] = useState(brand);

  const apply = () => setBrand(draft);
  const onReset = () => {
    reset();
    setDraft({
      nome: "ConciliaAI",
      slogan: "Inteligencia Fiscal e Contabil",
      primary: "#1a5fe8",
      primaryDark: "#163473",
      iconText: "C",
    });
  };

  return (
    <div>
      <PageHeader
        title="White Label"
        description="Personalize a marca apresentada ao cliente final. Cada escritorio contabil vende como produto proprio."
        actions={
          <>
            <button className="btn-outline" onClick={onReset}>
              <RotateCcw size={16} /> Redefinir
            </button>
            <button className="btn-primary" onClick={apply}>
              <Save size={16} /> Salvar marca
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6 space-y-5">
          <div>
            <label className="label">Nome do produto</label>
            <input
              className="input mt-1"
              value={draft.nome}
              onChange={(e) => setDraft({ ...draft, nome: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Slogan</label>
            <input
              className="input mt-1"
              value={draft.slogan}
              onChange={(e) => setDraft({ ...draft, slogan: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Letra do icone</label>
            <input
              className="input mt-1"
              maxLength={2}
              value={draft.iconText}
              onChange={(e) =>
                setDraft({ ...draft, iconText: e.target.value.toUpperCase() })
              }
            />
            <p className="text-xs text-slate-500 mt-1">
              No produto final, voce pode subir um arquivo SVG/PNG. Aqui usamos
              uma letra para o preview.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Cor primaria</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="color"
                  value={draft.primary}
                  onChange={(e) =>
                    setDraft({ ...draft, primary: e.target.value })
                  }
                  className="size-10 rounded-lg border border-slate-300 cursor-pointer"
                />
                <input
                  className="input font-mono"
                  value={draft.primary}
                  onChange={(e) =>
                    setDraft({ ...draft, primary: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <label className="label">Cor primaria escura</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="color"
                  value={draft.primaryDark}
                  onChange={(e) =>
                    setDraft({ ...draft, primaryDark: e.target.value })
                  }
                  className="size-10 rounded-lg border border-slate-300 cursor-pointer"
                />
                <input
                  className="input font-mono"
                  value={draft.primaryDark}
                  onChange={(e) =>
                    setDraft({ ...draft, primaryDark: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <div>
            <label className="label">Presets</label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {presets.map((p) => (
                <button
                  key={p.nome}
                  onClick={() =>
                    setDraft({
                      ...draft,
                      primary: p.primary,
                      primaryDark: p.primaryDark,
                    })
                  }
                  className="rounded-lg border border-slate-200 p-2 text-left hover:border-brand-400 transition"
                >
                  <div
                    className="h-8 rounded-md mb-1"
                    style={{
                      background: `linear-gradient(135deg, ${p.primary}, ${p.primaryDark})`,
                    }}
                  />
                  <div className="text-xs font-medium">{p.nome}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-6">
            <div className="flex items-center gap-2 text-slate-500 mb-3">
              <PaletteIcon size={14} />
              <span className="text-xs uppercase tracking-wide font-semibold">
                Preview da marca
              </span>
            </div>
            <div
              className="rounded-2xl p-6 text-white"
              style={{
                background: `linear-gradient(135deg, ${draft.primary}, ${draft.primaryDark})`,
              }}
            >
              <div className="flex items-center gap-4">
                <div className="size-14 rounded-xl bg-white/15 grid place-content-center text-2xl font-bold">
                  {draft.iconText}
                </div>
                <div>
                  <div className="text-2xl font-bold">{draft.nome}</div>
                  <div className="text-white/80 text-sm">{draft.slogan}</div>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
                {[
                  { l: "Empresas", v: "48" },
                  { l: "XMLs/mes", v: "734" },
                  { l: "Auto-class.", v: "92,7%" },
                ].map((it) => (
                  <div
                    key={it.l}
                    className="bg-white/10 rounded-lg p-3 text-center"
                  >
                    <div className="text-xs text-white/70">{it.l}</div>
                    <div className="font-semibold">{it.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-semibold text-slate-900 mb-2">
              Como o cliente final ve
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              O nome e logomarca acima sao os que aparecem para a empresa
              atendida pelo seu escritorio contabil. O ConciliaAI fica
              invisivel.
            </p>
            <ul className="text-sm text-slate-700 space-y-2">
              <li className="flex gap-2">
                <span className="text-emerald-600">+</span> Login, sidebar e
                rodape com a marca do escritorio
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-600">+</span> Dominio personalizado
                (ex.: portal.escritorioxyz.com.br)
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-600">+</span> E-mails
                transacionais com a sua identidade
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-600">+</span> Relatorios e SPED
                com cabecalho proprio
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
