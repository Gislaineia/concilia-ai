import { Sliders, Sparkles, Hand, Inbox } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { useApp } from "../store/AppStore";

export default function Regras() {
  const { state } = useApp();
  const regras = state.regras;
  const auto = regras.filter((r) => r.origem === "auto-aprendida").length;
  const manual = regras.filter((r) => r.origem === "manual").length;
  const aplicacoes = regras.reduce((s, r) => s + r.hits, 0);

  return (
    <div>
      <PageHeader
        title="Motor de Regras Parametrizadas"
        description="Fornecedor + NCM + CFOP + UF + Regime = decisao automatica. Cada divergencia resolvida gera uma nova regra. Resolveu uma vez, nunca mais pergunta."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-1">
            <div className="size-10 rounded-lg bg-emerald-100 text-emerald-600 grid place-content-center">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="text-xs uppercase text-slate-500 font-semibold">
                Auto-aprendidas
              </div>
              <div className="text-2xl font-bold">{auto}</div>
            </div>
          </div>
          <div className="text-xs text-slate-500">
            Geradas a partir de divergencias resolvidas
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-1">
            <div className="size-10 rounded-lg bg-brand-50 text-brand-600 grid place-content-center">
              <Hand size={18} />
            </div>
            <div>
              <div className="text-xs uppercase text-slate-500 font-semibold">
                Manuais
              </div>
              <div className="text-2xl font-bold">{manual}</div>
            </div>
          </div>
          <div className="text-xs text-slate-500">
            Cadastradas pelo contador
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-1">
            <div className="size-10 rounded-lg bg-amber-100 text-amber-600 grid place-content-center">
              <Sliders size={18} />
            </div>
            <div>
              <div className="text-xs uppercase text-slate-500 font-semibold">
                Aplicacoes
              </div>
              <div className="text-2xl font-bold">{aplicacoes}</div>
            </div>
          </div>
          <div className="text-xs text-slate-500">
            Lancamentos automatizados
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">Regras ativas</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Avaliadas em ordem. A primeira que casa todos os criterios e
            aplicada ao lancamento.
          </p>
        </div>
        {regras.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto size-14 rounded-full bg-slate-100 text-slate-400 grid place-content-center mb-3">
              <Inbox size={24} />
            </div>
            <h4 className="font-semibold text-slate-700">
              Nenhuma regra cadastrada ainda
            </h4>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Importe XMLs em <b>Captura</b>, va em <b>Divergencias</b> e
              resolva uma. A solucao vira automaticamente uma regra aqui e sera
              aplicada no proximo XML similar.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Fornecedor</th>
                  <th>CNPJ</th>
                  <th>NCM</th>
                  <th>CFOP</th>
                  <th>UF</th>
                  <th>Acao</th>
                  <th>CST PIS / COFINS</th>
                  <th>Origem</th>
                  <th className="text-right">Hits</th>
                </tr>
              </thead>
              <tbody>
                {regras.map((r) => (
                  <tr key={r.id}>
                    <td className="font-medium text-slate-800">
                      {r.fornecedor}
                    </td>
                    <td className="font-mono text-xs">{r.cnpjEmitente}</td>
                    <td className="font-mono">{r.ncm}</td>
                    <td className="font-mono">{r.cfop}</td>
                    <td>{r.uf}</td>
                    <td className="max-w-xs">{r.acao}</td>
                    <td className="font-mono">
                      {r.cstPis} / {r.cstCofins}
                    </td>
                    <td>
                      {r.origem === "auto-aprendida" ? (
                        <span className="badge-ok">
                          <Sparkles size={12} /> Auto
                        </span>
                      ) : (
                        <span className="badge-info">
                          <Hand size={12} /> Manual
                        </span>
                      )}
                    </td>
                    <td className="text-right font-semibold">{r.hits}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
