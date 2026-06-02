import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import {
  Upload,
  RefreshCw,
  CheckCircle2,
  Activity,
  ArrowDownToLine,
  ArrowUpFromLine,
  FileText,
  Sparkles,
  AlertTriangle,
  Trash2,
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { useApp } from "../store/AppStore";

interface IngestLog {
  fileName: string;
  ok: boolean;
  msg: string;
}

export default function Captura() {
  const { state, ingestXml, ingestSamples, reset } = useApp();
  const [filter, setFilter] = useState<"todos" | "entrada" | "saida">("todos");
  const [dragActive, setDragActive] = useState(false);
  const [logs, setLogs] = useState<IngestLog[]>([]);
  const [busy, setBusy] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const docs = state.xmlDocs.filter((d) =>
    filter === "todos" ? true : d.direcao === filter
  );

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setBusy(true);
    const newLogs: IngestLog[] = [];
    for (const file of Array.from(files)) {
      try {
        const text = await file.text();
        const r = await ingestXml(text, file.name);
        if (r.erro) {
          newLogs.push({ fileName: file.name, ok: false, msg: r.erro });
        } else {
          newLogs.push({
            fileName: file.name,
            ok: true,
            msg: `${r.doc?.tipo} ${r.doc?.numero} - ${r.doc?.itensClassificados}/${r.doc?.itensTotal} itens classificados`,
          });
        }
      } catch (e) {
        newLogs.push({
          fileName: file.name,
          ok: false,
          msg: e instanceof Error ? e.message : String(e),
        });
      }
    }
    setLogs((prev) => [...newLogs, ...prev].slice(0, 20));
    setBusy(false);
  };

  const onDrag = (e: DragEvent, active: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(active);
  };

  const onDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    await handleFiles(e.dataTransfer.files);
  };

  const onSelect = (e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    e.target.value = "";
  };

  const loadSamples = async () => {
    setBusy(true);
    setLogs([{ fileName: "amostras", ok: true, msg: "Carregando 4 NF-e de exemplo..." }]);
    await ingestSamples();
    setLogs((prev) => [
      { fileName: "amostras", ok: true, msg: "4 NF-e processadas. Vai em Divergencias para resolver e ver o aprendizado automatico." },
      ...prev,
    ]);
    setBusy(false);
  };

  const totalCapturados = state.xmlDocs.length;
  const entradaCount = state.xmlDocs.filter((d) => d.direcao === "entrada").length;
  const saidaCount = totalCapturados - entradaCount;

  return (
    <div>
      <PageHeader
        title="Captura de XML"
        description="Faca upload de XMLs reais (NF-e ou CT-e). O sistema parseia, cadastra fornecedor/produto e aplica o motor de regras automaticamente."
        actions={
          <>
            <button
              className="btn-outline"
              onClick={loadSamples}
              disabled={busy}
            >
              <Sparkles size={16} /> Carregar amostras
            </button>
            <button
              className="btn-outline"
              onClick={() => {
                if (
                  confirm(
                    "Limpar TODOS os dados (XMLs, regras, divergencias)? Esta acao nao pode ser desfeita."
                  )
                )
                  reset();
              }}
            >
              <Trash2 size={16} /> Limpar dados
            </button>
            <button
              className="btn-primary"
              onClick={() => fileInput.current?.click()}
              disabled={busy}
            >
              <Upload size={16} /> Importar XMLs
            </button>
            <input
              ref={fileInput}
              type="file"
              accept=".xml,application/xml,text/xml"
              multiple
              hidden
              onChange={onSelect}
            />
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card p-5 flex items-center gap-4">
          <div className="size-12 rounded-xl bg-emerald-100 text-emerald-600 grid place-content-center">
            <Activity size={22} />
          </div>
          <div>
            <div className="text-xs text-slate-500 uppercase">Web Hook</div>
            <div className="font-semibold text-slate-900">
              {state.empresas[0]?.webhookSefaz === "ativo"
                ? "SEFAZ ativo"
                : "Pooling fallback"}
            </div>
            <div className="text-xs text-emerald-600">
              Modo demo - upload manual
            </div>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="size-12 rounded-xl bg-brand-50 text-brand-600 grid place-content-center">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className="text-xs text-slate-500 uppercase">
              Total capturados
            </div>
            <div className="font-semibold text-slate-900 text-2xl">
              {totalCapturados}
            </div>
            <div className="text-xs text-slate-500">
              {entradaCount} entrada / {saidaCount} saida
            </div>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="size-12 rounded-xl bg-amber-100 text-amber-600 grid place-content-center">
            <RefreshCw size={22} />
          </div>
          <div>
            <div className="text-xs text-slate-500 uppercase">
              Pooling fallback
            </div>
            <div className="font-semibold text-slate-900">A cada 15 min</div>
            <div className="text-xs text-slate-500">
              Sem perda quando Web Hook falha
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6 mb-6">
        <div
          onDragEnter={(e) => onDrag(e, true)}
          onDragOver={(e) => onDrag(e, true)}
          onDragLeave={(e) => onDrag(e, false)}
          onDrop={onDrop}
          onClick={() => fileInput.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
            dragActive
              ? "border-brand-500 bg-brand-50/50"
              : "border-slate-300 bg-slate-50/40 hover:bg-slate-50/80"
          }`}
        >
          <div className="mx-auto size-14 rounded-full bg-brand-50 text-brand-600 grid place-content-center mb-3">
            <Upload size={24} />
          </div>
          <h3 className="font-semibold text-slate-900">
            Arraste XMLs aqui ou clique para selecionar
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Aceita NF-e e CT-e em lote. O parser le emitente, itens, NCM, CFOP,
            valores. Sem servidor: tudo processado no seu navegador.
          </p>
          {totalCapturados === 0 && (
            <p className="text-xs text-brand-600 mt-3">
              Sem XMLs ainda? Clique em <b>Carregar amostras</b> para testar
              instantaneamente.
            </p>
          )}
        </div>
      </div>

      {logs.length > 0 && (
        <div className="card p-5 mb-6">
          <h3 className="font-semibold text-slate-900 mb-3">
            Log de processamento
          </h3>
          <div className="space-y-1 max-h-48 overflow-y-auto text-sm">
            {logs.map((l, i) => (
              <div
                key={i}
                className={`flex items-start gap-2 px-3 py-2 rounded-lg ${
                  l.ok ? "bg-emerald-50/60" : "bg-rose-50/60"
                }`}
              >
                {l.ok ? (
                  <CheckCircle2
                    size={16}
                    className="text-emerald-600 mt-0.5 shrink-0"
                  />
                ) : (
                  <AlertTriangle
                    size={16}
                    className="text-rose-600 mt-0.5 shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-slate-800">
                    {l.fileName}
                  </span>
                  <span className="text-slate-600 ml-2">{l.msg}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="px-5 py-4 flex flex-wrap items-center gap-2 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900 mr-auto">
            Documentos capturados
          </h3>
          <div className="flex bg-slate-100 rounded-lg p-1 text-sm">
            {(["todos", "entrada", "saida"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-md capitalize font-medium transition-colors ${
                  filter === f
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Direcao</th>
                <th>Emitente / Destinatario</th>
                <th>Emissao</th>
                <th>Itens</th>
                <th className="text-right">Valor</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {docs.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-12 text-slate-500"
                  >
                    Nenhum XML capturado ainda. Use o botao "Importar XMLs" ou
                    "Carregar amostras".
                  </td>
                </tr>
              )}
              {docs.map((d) => (
                <tr key={d.id}>
                  <td>
                    <span className="badge-info">
                      <FileText size={12} /> {d.tipo}
                    </span>
                  </td>
                  <td>
                    {d.direcao === "entrada" ? (
                      <span className="inline-flex items-center gap-1 text-brand-700">
                        <ArrowDownToLine size={14} /> Entrada
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-emerald-600">
                        <ArrowUpFromLine size={14} /> Saida
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="font-medium text-slate-800">
                      {d.direcao === "entrada"
                        ? d.emitenteNome
                        : d.destinatarioNome}
                    </div>
                    <div className="text-xs text-slate-500 font-mono">
                      Chave {d.chave.slice(0, 12)}...{d.chave.slice(-6)}
                    </div>
                  </td>
                  <td>{d.emissao}</td>
                  <td>
                    <div className="text-sm font-medium text-slate-700">
                      {d.itensClassificados}/{d.itensTotal} classificados
                    </div>
                    <div className="text-xs text-slate-500">
                      CFOPs: {d.cfopsResumo.join(", ") || "—"}
                    </div>
                  </td>
                  <td className="text-right font-mono">
                    R${" "}
                    {d.valor.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td>
                    <StatusBadge status={d.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
