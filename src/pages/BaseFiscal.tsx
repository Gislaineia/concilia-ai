import { useMemo, useState } from "react";
import { Search, BookOpen, CheckCircle2, XCircle } from "lucide-react";
import PageHeader from "../components/PageHeader";
import {
  ncms,
  cstPisCofins,
  cstIcms,
  cstCsosn,
  cfops,
} from "../data/baseFiscal";

type Tab = "ncm" | "pis-cofins" | "icms" | "csosn" | "cfop";

const tabs: { id: Tab; label: string; count: number }[] = [
  { id: "ncm", label: "NCM", count: ncms.length },
  { id: "pis-cofins", label: "CST PIS/COFINS", count: cstPisCofins.length },
  { id: "icms", label: "CST ICMS", count: cstIcms.length },
  { id: "csosn", label: "CSOSN (Simples)", count: cstCsosn.length },
  { id: "cfop", label: "CFOP", count: cfops.length },
];

export default function BaseFiscal() {
  const [tab, setTab] = useState<Tab>("ncm");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("todas");
  const [direcao, setDirecao] = useState<"todas" | "entrada" | "saida">(
    "todas"
  );

  const categorias = useMemo(
    () => Array.from(new Set(ncms.map((n) => n.categoria))).sort(),
    []
  );

  const ncmsFiltered = useMemo(() => {
    const t = q.toLowerCase();
    return ncms.filter(
      (n) =>
        (cat === "todas" || n.categoria === cat) &&
        (n.ncm.includes(t) ||
          n.descricao.toLowerCase().includes(t) ||
          n.categoria.toLowerCase().includes(t))
    );
  }, [q, cat]);

  const cstPisFiltered = useMemo(() => {
    const t = q.toLowerCase();
    return cstPisCofins.filter(
      (c) =>
        c.cst.includes(t) ||
        c.nome.toLowerCase().includes(t) ||
        c.descricao.toLowerCase().includes(t)
    );
  }, [q]);

  const cstIcmsFiltered = useMemo(() => {
    const t = q.toLowerCase();
    return cstIcms.filter(
      (c) =>
        c.cst.includes(t) ||
        c.nome.toLowerCase().includes(t) ||
        c.descricao.toLowerCase().includes(t)
    );
  }, [q]);

  const cstCsosnFiltered = useMemo(() => {
    const t = q.toLowerCase();
    return cstCsosn.filter(
      (c) =>
        c.cst.includes(t) ||
        c.nome.toLowerCase().includes(t) ||
        c.descricao.toLowerCase().includes(t)
    );
  }, [q]);

  const cfopsFiltered = useMemo(() => {
    const t = q.toLowerCase();
    return cfops.filter(
      (c) =>
        (direcao === "todas" || c.direcao === direcao) &&
        (c.cfop.includes(t) ||
          c.natureza.toLowerCase().includes(t) ||
          c.descricao.toLowerCase().includes(t))
    );
  }, [q, direcao]);

  return (
    <div>
      <PageHeader
        title="Base Fiscal de Referencia"
        description="Consulte rapidamente NCMs, CSTs PIS/COFINS, CST ICMS, CSOSN e CFOPs ao classificar uma divergencia. Tabela curada para o publico de comercio e distribuicao."
      />

      <div className="card p-3 mb-4 flex flex-wrap gap-2 items-center">
        <BookOpen size={16} className="text-brand-600 ml-2" />
        <div className="flex flex-wrap gap-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTab(t.id);
                setQ("");
              }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                tab === t.id
                  ? "bg-brand-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {t.label}{" "}
              <span
                className={`ml-1 text-[10px] ${
                  tab === t.id ? "text-white/80" : "text-slate-400"
                }`}
              >
                {t.count}
              </span>
            </button>
          ))}
        </div>
      </div>

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
            placeholder={
              tab === "ncm"
                ? "Buscar NCM, descricao ou categoria..."
                : tab === "cfop"
                ? "Buscar CFOP ou natureza..."
                : "Buscar CST, nome ou descricao..."
            }
          />
        </div>
        {tab === "ncm" && (
          <select
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            className="input sm:w-56"
          >
            <option value="todas">Todas categorias</option>
            {categorias.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        )}
        {tab === "cfop" && (
          <div className="flex bg-slate-100 rounded-lg p-1 text-sm">
            {(["todas", "entrada", "saida"] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDirecao(d)}
                className={`px-3 py-1.5 rounded-md capitalize font-medium transition-colors ${
                  direcao === d
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="card overflow-hidden">
        {tab === "ncm" && (
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>NCM</th>
                  <th>Descricao</th>
                  <th>Categoria</th>
                  <th>CISC</th>
                  <th>ICMS</th>
                  <th>Caracteristicas</th>
                </tr>
              </thead>
              <tbody>
                {ncmsFiltered.map((n) => (
                  <tr key={n.ncm}>
                    <td className="font-mono font-semibold text-brand-700">
                      {n.ncm}
                    </td>
                    <td className="font-medium text-slate-800">
                      {n.descricao}
                    </td>
                    <td>
                      <span className="badge-info">{n.categoria}</span>
                    </td>
                    <td className="font-mono text-xs text-slate-500">
                      {n.cisc || "—"}
                    </td>
                    <td className="font-mono">
                      {n.aliquotaIcmsTipica
                        ? `${n.aliquotaIcmsTipica}%`
                        : "—"}
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {n.monofasico && (
                          <span className="badge-warn">Monofasico</span>
                        )}
                        {n.st && <span className="badge-crit">ST</span>}
                        {!n.monofasico && !n.st && (
                          <span className="badge-ok">Tributacao normal</span>
                        )}
                      </div>
                      {n.observacao && (
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {n.observacao}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {ncmsFiltered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-500">
                      Nenhum NCM encontrado para "{q}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {(tab === "pis-cofins" || tab === "icms" || tab === "csosn") && (
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Codigo</th>
                  <th>Nome</th>
                  <th>Descricao</th>
                  <th>Gera credito?</th>
                </tr>
              </thead>
              <tbody>
                {(tab === "pis-cofins"
                  ? cstPisFiltered
                  : tab === "icms"
                  ? cstIcmsFiltered
                  : cstCsosnFiltered
                ).map((c) => (
                  <tr key={c.cst}>
                    <td className="font-mono font-semibold text-brand-700">
                      {c.cst}
                    </td>
                    <td className="font-medium text-slate-800">{c.nome}</td>
                    <td className="text-slate-600">{c.descricao || "—"}</td>
                    <td>
                      {c.geraCredito ? (
                        <span className="badge-ok">
                          <CheckCircle2 size={11} /> Sim
                        </span>
                      ) : (
                        <span className="badge-muted">
                          <XCircle size={11} /> Nao
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "cfop" && (
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>CFOP</th>
                  <th>Natureza</th>
                  <th>Descricao</th>
                  <th>Direcao</th>
                  <th>Operacao</th>
                </tr>
              </thead>
              <tbody>
                {cfopsFiltered.map((c) => (
                  <tr key={c.cfop}>
                    <td className="font-mono font-semibold text-brand-700">
                      {c.cfop}
                    </td>
                    <td className="font-medium text-slate-800">
                      {c.natureza}
                    </td>
                    <td className="text-slate-600 text-xs">{c.descricao}</td>
                    <td>
                      {c.direcao === "entrada" ? (
                        <span className="badge-info">Entrada</span>
                      ) : (
                        <span className="badge-ok">Saida</span>
                      )}
                    </td>
                    <td>
                      <span
                        className={
                          c.estado === "interna"
                            ? "badge-muted"
                            : c.estado === "interestadual"
                            ? "badge-warn"
                            : "badge-crit"
                        }
                      >
                        {c.estado === "interna"
                          ? "Interna"
                          : c.estado === "interestadual"
                          ? "Interestadual"
                          : "Exterior"}
                      </span>
                    </td>
                  </tr>
                ))}
                {cfopsFiltered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-500">
                      Nenhum CFOP encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
