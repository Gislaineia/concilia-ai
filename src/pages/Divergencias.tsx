import { useEffect, useMemo, useState } from "react";
import {
  Sparkles,
  Check,
  X,
  Filter,
  Wand2,
  Brain,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { useApp } from "../store/AppStore";
import { gerarSugestoesIA, type SugestaoIA } from "../lib/aiSuggest";

type Aba = "pendentes" | "resolvidas" | "todas";

export default function Divergencias() {
  const { state, empresaAtiva, resolverDivergencia, reabrirDivergencia } =
    useApp();
  const items = state.divergencias;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [aba, setAba] = useState<Aba>("pendentes");
  const [sev, setSev] = useState<"todas" | "warn" | "crit">("todas");
  const [escolhaId, setEscolhaId] = useState<string | null>(null);
  const [modoCustom, setModoCustom] = useState(false);
  const [customAcao, setCustomAcao] = useState("Lancar como compra para revenda");
  const [customCstPis, setCustomCstPis] = useState("50");
  const [customCstCofins, setCustomCstCofins] = useState("50");

  const totalPendentes = items.filter((d) => !d.resolvida).length;
  const totalResolvidas = items.filter((d) => d.resolvida).length;

  const filtered = useMemo(() => {
    return items.filter((d) => {
      if (aba === "pendentes" && d.resolvida) return false;
      if (aba === "resolvidas" && !d.resolvida) return false;
      if (sev !== "todas" && d.severidade !== sev) return false;
      return true;
    });
  }, [items, aba, sev]);

  useEffect(() => {
    if (!selectedId && filtered.length > 0) setSelectedId(filtered[0].id);
    if (selectedId && !filtered.find((d) => d.id === selectedId)) {
      setSelectedId(filtered[0]?.id ?? null);
    }
  }, [filtered, selectedId]);

  const selected = items.find((d) => d.id === selectedId) ?? null;

  const sugestoes: SugestaoIA[] = useMemo(
    () => (selected ? gerarSugestoesIA(selected, empresaAtiva) : []),
    [selected, empresaAtiva]
  );

  useEffect(() => {
    if (sugestoes.length > 0) setEscolhaId(sugestoes[0].id);
    setModoCustom(false);
  }, [selected?.id, sugestoes]);

  const aplicar = (criarRegra: boolean) => {
    if (!selected) return;
    let acao: string, cstPis: string, cstCofins: string;
    if (modoCustom) {
      acao = customAcao;
      cstPis = customCstPis;
      cstCofins = customCstCofins;
    } else {
      const escolha = sugestoes.find((s) => s.id === escolhaId) || sugestoes[0];
      acao = escolha?.acao || "Lancamento manual";
      cstPis = escolha?.cstPis || "70";
      cstCofins = escolha?.cstCofins || "70";
    }
    resolverDivergencia(selected.id, { acao, cstPis, cstCofins, criarRegra });
  };

  return (
    <div>
      <PageHeader
        title="Divergencias"
        description="A IA analisa empresa, regime, UF, NCM, CFOP e direito a credito tributario para sugerir multiplas classificacoes fundamentadas. As divergencias resolvidas ficam preservadas para fins de demonstracao - voce pode reabri-las a qualquer momento."
      />

      <div className="card p-3 mb-4 flex flex-wrap items-center gap-2">
        <div className="flex bg-slate-100 rounded-lg p-1 text-sm">
          {(
            [
              { id: "pendentes" as Aba, label: "Pendentes", count: totalPendentes },
              { id: "resolvidas" as Aba, label: "Resolvidas", count: totalResolvidas },
              { id: "todas" as Aba, label: "Todas", count: items.length },
            ]
          ).map((a) => (
            <button
              key={a.id}
              onClick={() => setAba(a.id)}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                aba === a.id
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600"
              }`}
            >
              {a.label}{" "}
              <span
                className={`ml-1 text-[10px] ${
                  aba === a.id ? "text-slate-500" : "text-slate-400"
                }`}
              >
                {a.count}
              </span>
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2 text-xs text-slate-500">
          <Filter size={14} />
          <div className="flex bg-slate-100 rounded-lg p-1">
            {(["todas", "warn", "crit"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSev(s)}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  sev === s
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600"
                }`}
              >
                {s === "todas" ? "Todas" : s === "warn" ? "Atencao" : "Critico"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-4 card flex flex-col overflow-hidden">
          <div className="divide-y divide-slate-100 overflow-y-auto max-h-[calc(100vh-280px)]">
            {filtered.length === 0 && (
              <div className="p-8 text-center text-sm text-slate-500">
                {aba === "pendentes"
                  ? "Nenhuma divergencia pendente."
                  : aba === "resolvidas"
                  ? "Nenhuma divergencia resolvida ainda."
                  : "Nenhuma divergencia."}
              </div>
            )}
            {filtered.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedId(d.id)}
                className={`w-full text-left px-4 py-3 transition-colors ${
                  selectedId === d.id
                    ? "bg-brand-50/60 border-l-4 border-brand-500"
                    : "hover:bg-slate-50 border-l-4 border-transparent"
                } ${d.resolvida ? "opacity-75" : ""}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium text-slate-900 truncate text-sm">
                    {d.doc} - item {d.itemNumero}
                  </div>
                  {d.resolvida ? (
                    <span className="badge-ok">
                      <CheckCircle2 size={11} /> Resolvida
                    </span>
                  ) : (
                    <StatusBadge status={d.severidade} />
                  )}
                </div>
                <div className="text-xs text-slate-500 truncate mt-0.5">
                  {d.emitente}
                </div>
                <div className="text-xs text-slate-600 mt-1 line-clamp-2">
                  {d.itemDescricao}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-8 card p-6 flex flex-col">
          {!selected ? (
            <div className="m-auto text-center text-slate-500">
              Sem divergencias selecionadas.
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {selected.doc} - item {selected.itemNumero}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {selected.emitente} ({selected.emitenteCnpj})
                  </p>
                </div>
                {selected.resolvida ? (
                  <span className="badge-ok">
                    <CheckCircle2 size={11} /> Resolvida
                  </span>
                ) : (
                  <StatusBadge status={selected.severidade} />
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-4">
                {[
                  { l: "NCM", v: selected.ncm },
                  { l: "CFOP", v: selected.cfop },
                  { l: "UF orig.", v: selected.uf },
                  { l: "UF dest.", v: empresaAtiva.uf },
                  {
                    l: "Valor",
                    v:
                      "R$ " +
                      selected.valor.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      }),
                  },
                ].map((it) => (
                  <div key={it.l} className="bg-slate-50 rounded-lg p-2">
                    <div className="text-[10px] uppercase text-slate-500 font-semibold">
                      {it.l}
                    </div>
                    <div className="text-xs font-semibold text-slate-800 font-mono mt-0.5">
                      {it.v}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 bg-slate-50 rounded-lg p-3">
                <div className="text-[10px] uppercase tracking-wide text-slate-500 font-semibold mb-1">
                  Item descrito no XML
                </div>
                <p className="text-sm text-slate-700">
                  {selected.itemDescricao}
                </p>
              </div>

              {/* Se ja resolvida, mostrar resumo + botao reabrir */}
              {selected.resolvida && selected.resolucao && (
                <div className="mt-5 rounded-xl border-2 border-emerald-200 bg-emerald-50/60 p-4">
                  <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                    <CheckCircle2 size={16} /> Resolvida em{" "}
                    {selected.resolucao.resolvidaEm} por{" "}
                    {selected.resolucao.resolvidaPor}
                  </div>
                  <div className="mt-2 text-sm text-slate-700">
                    <strong>Acao:</strong> {selected.resolucao.acao}
                  </div>
                  <div className="mt-1 text-sm text-slate-700">
                    <strong>CST PIS:</strong> {selected.resolucao.cstPis}{" "}
                    &nbsp;
                    <strong>CST COFINS:</strong> {selected.resolucao.cstCofins}
                  </div>
                  <button
                    onClick={() => reabrirDivergencia(selected.id)}
                    className="btn-outline mt-3"
                  >
                    <RotateCcw size={14} /> Reabrir divergencia (demo)
                  </button>
                </div>
              )}

              {/* Se pendente, mostrar IA + acoes */}
              {!selected.resolvida && (
                <>
                  <div className="mt-5 flex items-center gap-2">
                    <Brain size={16} className="text-brand-600" />
                    <h4 className="font-semibold text-slate-900">
                      Analise da IA - {sugestoes.length} possibilidades
                    </h4>
                    <span className="text-xs text-slate-500 ml-2">
                      Baseado em: {empresaAtiva.regime} - sede{" "}
                      {empresaAtiva.uf}
                    </span>
                  </div>

                  <div className="mt-3 space-y-2 max-h-96 overflow-y-auto pr-1">
                    {sugestoes.length === 0 && (
                      <div className="text-sm text-slate-500 p-4 text-center bg-slate-50 rounded-lg">
                        A IA nao encontrou padrao reconhecido. Use o modo
                        manual abaixo.
                      </div>
                    )}
                    {sugestoes.map((s) => {
                      const ativa = !modoCustom && escolhaId === s.id;
                      return (
                        <button
                          key={s.id}
                          onClick={() => {
                            setEscolhaId(s.id);
                            setModoCustom(false);
                          }}
                          className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
                            ativa
                              ? "border-brand-500 bg-brand-50/40"
                              : "border-slate-200 hover:border-brand-300 bg-white"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-slate-900">
                                  {s.titulo}
                                </span>
                                {s.geraCredito ? (
                                  <span className="badge-ok">
                                    <TrendingUp size={11} /> Gera credito
                                  </span>
                                ) : (
                                  <span className="badge-muted">
                                    Sem credito
                                  </span>
                                )}
                                <span className="badge-info">
                                  CST PIS {s.cstPis}/COFINS {s.cstCofins}
                                </span>
                                {s.cfopSugerido && (
                                  <span className="badge-warn">
                                    CFOP sugerido {s.cfopSugerido}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-slate-700 mt-1.5">
                                {s.acao}
                              </p>
                              <p className="text-xs text-slate-500 mt-1 italic">
                                {s.observacao}
                              </p>
                              <details className="mt-2">
                                <summary className="text-xs text-brand-700 cursor-pointer font-medium">
                                  Ver fundamentos da IA
                                </summary>
                                <ul className="mt-1.5 space-y-0.5 text-xs text-slate-600 list-disc list-inside">
                                  {s.fundamento.map((f, i) => (
                                    <li key={i}>{f}</li>
                                  ))}
                                </ul>
                              </details>
                            </div>
                            <div className="flex flex-col items-center shrink-0">
                              <div
                                className={`text-2xl font-bold ${
                                  s.confianca >= 0.8
                                    ? "text-emerald-600"
                                    : s.confianca >= 0.6
                                    ? "text-amber-600"
                                    : "text-slate-500"
                                }`}
                              >
                                {Math.round(s.confianca * 100)}%
                              </div>
                              <div className="text-[10px] uppercase text-slate-500 tracking-wide">
                                confianca
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}

                    <button
                      onClick={() => setModoCustom(true)}
                      className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
                        modoCustom
                          ? "border-brand-500 bg-brand-50/40"
                          : "border-dashed border-slate-300 hover:border-brand-400"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={14} className="text-amber-600" />
                        <span className="font-semibold text-slate-900">
                          Personalizar regra (modo manual)
                        </span>
                      </div>
                      {modoCustom && (
                        <div
                          className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            value={customAcao}
                            onChange={(e) => setCustomAcao(e.target.value)}
                            className="input col-span-3 sm:col-span-1"
                            placeholder="Acao"
                          />
                          <input
                            value={customCstPis}
                            onChange={(e) => setCustomCstPis(e.target.value)}
                            className="input"
                            placeholder="CST PIS"
                          />
                          <input
                            value={customCstCofins}
                            onChange={(e) => setCustomCstCofins(e.target.value)}
                            className="input"
                            placeholder="CST COFINS"
                          />
                        </div>
                      )}
                    </button>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => aplicar(true)}
                      className="btn-primary"
                    >
                      <Wand2 size={16} /> Aplicar e gravar como regra
                    </button>
                    <button
                      onClick={() => aplicar(false)}
                      className="btn-outline"
                    >
                      <Check size={16} /> Aplicar so neste lancamento
                    </button>
                    <button
                      onClick={() =>
                        resolverDivergencia(selected.id, {
                          acao: "",
                          cstPis: "",
                          cstCofins: "",
                          criarRegra: false,
                        })
                      }
                      className="btn-ghost text-rose-600 ml-auto"
                    >
                      <X size={16} /> Ignorar
                    </button>
                  </div>
                  <div className="mt-3 text-xs text-slate-500 inline-flex items-center gap-1">
                    <Sparkles size={12} className="text-brand-600" /> Ao gravar
                    como regra, todas as divergencias com fornecedor + NCM +
                    CFOP + UF identicos sao reclassificadas. Elas ficam
                    visiveis na aba <b>Resolvidas</b>.
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
