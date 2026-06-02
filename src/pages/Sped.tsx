import { useMemo } from "react";
import { Download, FileCheck2, FileSearch, Calendar, Info } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { useApp } from "../store/AppStore";
import { gerarSped, downloadTxt } from "../lib/sped";

export default function Sped() {
  const { state, empresaAtiva } = useApp();

  const periodoFim = useMemo(() => {
    if (state.lancamentos.length === 0)
      return new Date().toISOString().slice(0, 10);
    const max = state.lancamentos.reduce(
      (m, l) => (l.emissao > m ? l.emissao : m),
      "0000-00-00"
    );
    return max;
  }, [state.lancamentos]);

  const periodoInicio = useMemo(() => {
    if (state.lancamentos.length === 0)
      return new Date().toISOString().slice(0, 10);
    const min = state.lancamentos.reduce(
      (m, l) => (l.emissao < m ? l.emissao : m),
      "9999-99-99"
    );
    return min;
  }, [state.lancamentos]);

  const sped = useMemo(
    () =>
      gerarSped({
        empresa: empresaAtiva,
        periodoInicio,
        periodoFim,
        lancamentos: state.lancamentos,
        parceiros: state.parceiros,
        produtos: state.produtos,
      }),
    [empresaAtiva, periodoInicio, periodoFim, state.lancamentos, state.parceiros, state.produtos]
  );

  const totalRegistros = sped.resumoBlocos.reduce(
    (s, b) => s + b.registros,
    0
  );
  const blocosProntos = sped.resumoBlocos.filter(
    (b) => b.status === "pronto"
  ).length;

  const baixar = () => {
    const fname = `SPED-${empresaAtiva.cnpj.replace(/\D/g, "")}-${periodoInicio.replace(
      /-/g,
      ""
    )}-${periodoFim.replace(/-/g, "")}.txt`;
    downloadTxt(fname, sped.txt);
  };

  const total =
    sped.totais.pis + sped.totais.cofins + sped.totais.ibsCbs;

  return (
    <div>
      <PageHeader
        title="SPED & Apuracao"
        description="Geracao real do TXT do SPED Contribuicoes a partir dos lancamentos classificados. Inclui apuracao PIS/COFINS e preview IBS/CBS (reforma tributaria)."
        actions={
          <>
            <button className="btn-outline">
              <FileSearch size={16} /> Validar
            </button>
            <button
              className="btn-primary"
              onClick={baixar}
              disabled={state.lancamentos.length === 0}
            >
              <Download size={16} /> Baixar TXT
            </button>
          </>
        }
      />

      {state.lancamentos.length === 0 && (
        <div className="card p-5 mb-6 flex items-start gap-3">
          <Info size={18} className="text-brand-600 mt-0.5" />
          <div className="text-sm">
            <div className="font-semibold">
              Sem lancamentos classificados ainda
            </div>
            <div className="text-slate-600">
              Importe XMLs em <b>Captura</b> e resolva as divergencias em{" "}
              <b>Divergencias</b>. Cada item classificado entra automaticamente
              nos blocos C100/C170 do SPED.
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-5">
          <div className="text-xs uppercase text-slate-500 font-semibold">
            Periodo de apuracao
          </div>
          <div className="text-lg font-bold mt-1 flex items-center gap-2">
            <Calendar size={16} className="text-brand-600" />{" "}
            {periodoInicio} a {periodoFim}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Calculado dos lancamentos
          </div>
        </div>
        <div className="card p-5">
          <div className="text-xs uppercase text-slate-500 font-semibold">
            Blocos prontos
          </div>
          <div className="text-2xl font-bold mt-1">
            {blocosProntos}/{sped.resumoBlocos.length}
          </div>
          <div className="text-xs text-emerald-600 mt-1">
            Pronto para validador SPED
          </div>
        </div>
        <div className="card p-5">
          <div className="text-xs uppercase text-slate-500 font-semibold">
            Registros gerados
          </div>
          <div className="text-2xl font-bold mt-1">
            {totalRegistros.toLocaleString("pt-BR")}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {state.lancamentos.length} lancamentos
          </div>
        </div>
        <div className="card p-5">
          <div className="text-xs uppercase text-slate-500 font-semibold">
            Apuracao consolidada
          </div>
          <div className="text-lg font-bold mt-1">
            R${" "}
            {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            PIS + COFINS + IBS/CBS
          </div>
        </div>
      </div>

      <div className="card overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900">
              Blocos do SPED Contribuicoes
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Inclui apuracao PIS/COFINS e preview IBS/CBS (Z100 - reforma
              tributaria)
            </p>
          </div>
          <span className="badge-info">
            <FileCheck2 size={12} /> v1.07 SPED
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Bloco</th>
                <th>Descricao</th>
                <th className="text-right">Registros</th>
                <th>Tamanho</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sped.resumoBlocos.map((b) => (
                <tr key={b.bloco}>
                  <td>
                    <span className="font-mono font-semibold text-brand-700">
                      {b.bloco}
                    </span>
                  </td>
                  <td>{b.nome}</td>
                  <td className="text-right font-mono">
                    {b.registros.toLocaleString("pt-BR")}
                  </td>
                  <td className="text-slate-500">{b.tamanho}</td>
                  <td>
                    {b.status === "pronto" ? (
                      <span className="badge-ok">Pronto</span>
                    ) : (
                      <span className="badge-muted">Pendente</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-900">
            Pre-visualizacao do TXT (gerado em tempo real)
          </h3>
          <button
            className="btn-outline"
            onClick={baixar}
            disabled={state.lancamentos.length === 0}
          >
            <Download size={14} /> Baixar arquivo completo
          </button>
        </div>
        <pre className="bg-slate-900 text-emerald-200 text-xs p-4 rounded-lg overflow-auto leading-relaxed max-h-96 whitespace-pre">
          {sped.txt ||
            "// Nenhum lancamento - importe XMLs e resolva divergencias para popular o SPED."}
        </pre>
      </div>
    </div>
  );
}
