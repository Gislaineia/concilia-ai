import {
  KeyRound,
  Building2,
  ShieldCheck,
  ShieldAlert,
  Activity,
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import { useApp } from "../store/AppStore";

export default function Empresas() {
  const { state } = useApp();

  return (
    <div>
      <PageHeader
        title="Empresas"
        description="Empresas atendidas. Cada CNPJ vincula um certificado A1 e ativa a captura automatica via SEFAZ. Nesta versao demo, o XML e importado manualmente."
        actions={
          <button className="btn-outline">
            <KeyRound size={16} /> Importar certificado A1
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {state.empresas.map((e) => (
          <div key={e.id} className="card p-5 flex flex-col">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-brand-50 text-brand-600 grid place-content-center">
                  <Building2 size={20} />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 leading-tight">
                    {e.fantasia}
                  </div>
                  <div className="text-xs text-slate-500">{e.razaoSocial}</div>
                </div>
              </div>
              <span className="badge-muted">{e.uf}</span>
            </div>

            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">CNPJ</dt>
                <dd className="font-mono text-slate-700">{e.cnpj}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Regime</dt>
                <dd className="text-slate-700">{e.regime}</dd>
              </div>
              <div className="flex justify-between items-center">
                <dt className="text-slate-500">Certificado A1</dt>
                <dd>
                  {e.certificadoA1.valido ? (
                    <span className="badge-ok">
                      <ShieldCheck size={12} />
                      vence {e.certificadoA1.vencimento}
                    </span>
                  ) : (
                    <span className="badge-crit">
                      <ShieldAlert size={12} /> vencido
                    </span>
                  )}
                </dd>
              </div>
              <div className="flex justify-between items-center">
                <dt className="text-slate-500">Captura SEFAZ</dt>
                <dd>
                  {e.webhookSefaz === "ativo" ? (
                    <span className="badge-ok">
                      <Activity size={12} /> Web Hook
                    </span>
                  ) : e.webhookSefaz === "fallback-pooling" ? (
                    <span className="badge-warn">
                      <Activity size={12} /> Pooling fallback
                    </span>
                  ) : (
                    <span className="badge-crit">Inativa</span>
                  )}
                </dd>
              </div>
              <div className="flex justify-between items-center">
                <dt className="text-slate-500">XMLs processados</dt>
                <dd className="font-semibold text-slate-700">
                  {state.xmlDocs.length}
                </dd>
              </div>
              <div className="flex justify-between items-center">
                <dt className="text-slate-500">Lancamentos</dt>
                <dd className="font-semibold text-emerald-700">
                  {state.lancamentos.length}
                </dd>
              </div>
            </dl>
          </div>
        ))}
      </div>
    </div>
  );
}
