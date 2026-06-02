import { Package, Inbox } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { useApp } from "../store/AppStore";

const usoLabel: Record<string, { text: string; cls: string }> = {
  revenda: { text: "Revenda", cls: "badge-info" },
  consumo: { text: "Uso/Consumo", cls: "badge-warn" },
  "materia-prima": { text: "Materia-prima", cls: "badge-ok" },
};

export default function Produtos() {
  const { state } = useApp();
  const ncmsUnicos = new Set(state.produtos.map((p) => p.ncm).filter(Boolean));

  return (
    <div>
      <PageHeader
        title="Produtos & NCM"
        description="Cadastrados automaticamente a partir dos itens dos XMLs processados. Cada produto e vinculado a um NCM."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card p-5">
          <div className="text-xs uppercase text-slate-500 font-semibold">
            Produtos cadastrados
          </div>
          <div className="text-2xl font-bold mt-1">
            {state.produtos.length}
          </div>
          <div className="text-xs text-emerald-600 mt-1">
            Auto-cadastrados via XML
          </div>
        </div>
        <div className="card p-5">
          <div className="text-xs uppercase text-slate-500 font-semibold">
            NCMs distintos
          </div>
          <div className="text-2xl font-bold mt-1">{ncmsUnicos.size}</div>
          <div className="text-xs text-slate-500 mt-1">
            Cobertura da base atual
          </div>
        </div>
        <div className="card p-5">
          <div className="text-xs uppercase text-slate-500 font-semibold">
            Produtos sem regra
          </div>
          <div className="text-2xl font-bold mt-1">
            {state.divergencias.length}
          </div>
          <div className="text-xs text-rose-600 mt-1">
            Aguardando primeira classificacao
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        {state.produtos.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto size-14 rounded-full bg-slate-100 text-slate-400 grid place-content-center mb-3">
              <Inbox size={24} />
            </div>
            <h4 className="font-semibold text-slate-700">
              Nenhum produto cadastrado
            </h4>
            <p className="text-sm text-slate-500 mt-1">
              Os produtos sao criados automaticamente conforme os XMLs sao
              importados.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Codigo</th>
                  <th>Descricao</th>
                  <th>NCM</th>
                  <th>CISC</th>
                  <th>Uso</th>
                </tr>
              </thead>
              <tbody>
                {state.produtos.map((p) => (
                  <tr key={p.id}>
                    <td className="font-mono text-xs">{p.codigo}</td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-lg bg-brand-50 text-brand-600 grid place-content-center">
                          <Package size={16} />
                        </div>
                        <span className="font-medium text-slate-800">
                          {p.descricao}
                        </span>
                      </div>
                    </td>
                    <td className="font-mono">{p.ncm || "—"}</td>
                    <td className="font-mono text-xs">{p.cisc}</td>
                    <td>
                      <span className={usoLabel[p.uso].cls}>
                        {usoLabel[p.uso].text}
                      </span>
                    </td>
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
