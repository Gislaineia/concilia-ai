import { useMemo, useState } from "react";
import { Search, Building2, Inbox } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { useApp } from "../store/AppStore";

export default function Parceiros() {
  const { state } = useApp();
  const [q, setQ] = useState("");
  const [tipo, setTipo] = useState<"todos" | "cliente" | "fornecedor">("todos");

  const filtered = useMemo(
    () =>
      state.parceiros.filter((p) => {
        const matchesQ =
          p.nome.toLowerCase().includes(q.toLowerCase()) ||
          p.cnpj.replace(/\D/g, "").includes(q.replace(/\D/g, ""));
        const matchesTipo =
          tipo === "todos" || p.tipo === tipo || p.tipo === "ambos";
        return matchesQ && matchesTipo;
      }),
    [state.parceiros, q, tipo]
  );

  return (
    <div>
      <PageHeader
        title="Clientes & Fornecedores"
        description="Cadastrados automaticamente a partir do CNPJ extraido de cada XML processado."
      />

      <div className="card p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="input pl-9"
            placeholder="Buscar por nome ou CNPJ..."
          />
        </div>
        <div className="flex bg-slate-100 rounded-lg p-1 text-sm">
          {(["todos", "cliente", "fornecedor"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTipo(t)}
              className={`px-3 py-1.5 rounded-md capitalize font-medium transition-colors ${
                tipo === t
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        {state.parceiros.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto size-14 rounded-full bg-slate-100 text-slate-400 grid place-content-center mb-3">
              <Inbox size={24} />
            </div>
            <h4 className="font-semibold text-slate-700">
              Nenhum parceiro cadastrado ainda
            </h4>
            <p className="text-sm text-slate-500 mt-1">
              Importe XMLs e os fornecedores/clientes serao cadastrados
              automaticamente aqui.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Razao social</th>
                  <th>CNPJ</th>
                  <th>UF</th>
                  <th>Tipo</th>
                  <th>Ultima operacao</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-lg bg-slate-100 text-slate-500 grid place-content-center">
                          <Building2 size={16} />
                        </div>
                        <div className="font-medium text-slate-800">
                          {p.nome}
                        </div>
                      </div>
                    </td>
                    <td className="font-mono">{p.cnpj}</td>
                    <td>{p.uf}</td>
                    <td>
                      {p.tipo === "fornecedor" ? (
                        <span className="badge-info">Fornecedor</span>
                      ) : p.tipo === "cliente" ? (
                        <span className="badge-ok">Cliente</span>
                      ) : (
                        <span className="badge-muted">Ambos</span>
                      )}
                    </td>
                    <td>{p.ultimaOperacao}</td>
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
