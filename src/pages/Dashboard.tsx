import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  FileCheck2,
  Building2,
  Sparkles,
  Sliders,
  Inbox,
} from "lucide-react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { useApp } from "../store/AppStore";

const COLORS = ["#1a5fe8", "#10b981", "#f59e0b"];

const KPI = ({
  title,
  value,
  hint,
  Icon,
}: {
  title: string;
  value: string | number;
  hint?: string;
  Icon: typeof CheckCircle2;
}) => (
  <div className="card p-5">
    <div className="flex items-start justify-between">
      <div>
        <div className="text-xs uppercase tracking-wide text-slate-500 font-medium">
          {title}
        </div>
        <div className="text-2xl font-bold text-slate-900 mt-1">{value}</div>
        {hint && <div className="text-xs text-slate-500 mt-1">{hint}</div>}
      </div>
      <div className="size-10 rounded-lg bg-brand-50 text-brand-600 grid place-content-center">
        <Icon size={20} />
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const { state } = useApp();

  const okCount = state.xmlDocs.filter((d) => d.status === "ok").length;
  const warnCount = state.xmlDocs.filter((d) => d.status === "warn").length;
  const critCount = state.xmlDocs.filter((d) => d.status === "crit").length;

  const totalItens = state.xmlDocs.reduce((s, d) => s + d.itensTotal, 0);
  const totalClass = state.lancamentos.length;
  const taxa =
    totalItens > 0 ? ((totalClass / totalItens) * 100).toFixed(1) : "0,0";

  // Timeline por dia (ultimos 7 dias com dados)
  const porDia = new Map<string, { entrada: number; saida: number }>();
  state.xmlDocs.forEach((d) => {
    const day = d.emissao || "—";
    const cur = porDia.get(day) || { entrada: 0, saida: 0 };
    if (d.direcao === "entrada") cur.entrada += 1;
    else cur.saida += 1;
    porDia.set(day, cur);
  });
  const timeline = Array.from(porDia.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .slice(-7)
    .map(([dia, v]) => ({ dia: dia.slice(5), ...v }));

  // Distribuicao por tipo
  const tipos = new Map<string, number>();
  state.xmlDocs.forEach((d) => tipos.set(d.tipo, (tipos.get(d.tipo) || 0) + 1));
  const distTipos = Array.from(tipos.entries()).map(([name, value]) => ({
    name,
    value,
  }));

  // Apuracao por mes baseada em lancamentos
  const porMes = new Map<string, { pis: number; cofins: number; ibsCbs: number }>();
  state.lancamentos.forEach((l) => {
    const mes = l.emissao.slice(0, 7);
    const cur = porMes.get(mes) || { pis: 0, cofins: 0, ibsCbs: 0 };
    cur.pis += l.valor * 0.0165;
    cur.cofins += l.valor * 0.076;
    cur.ibsCbs += l.valor * 0.0088;
    porMes.set(mes, cur);
  });
  const apuracao = Array.from(porMes.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([mes, v]) => ({
      mes,
      pis: Math.round(v.pis),
      cofins: Math.round(v.cofins),
      ibsCbs: Math.round(v.ibsCbs),
    }));

  const empty = state.xmlDocs.length === 0;

  return (
    <div>
      <PageHeader
        title="Visao Geral"
        description="Painel consolidado da operacao fiscal. Todos os numeros sao calculados em tempo real a partir dos XMLs processados."
      />

      {empty && (
        <div className="card p-8 mb-6 flex flex-col items-center text-center">
          <div className="size-14 rounded-full bg-brand-50 text-brand-600 grid place-content-center mb-3">
            <Inbox size={26} />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">
            Comece importando XMLs
          </h3>
          <p className="text-slate-500 mt-1 max-w-md">
            Va em <b>Captura de XML</b>, faca upload de NF-e/CT-e ou clique em
            "Carregar amostras" para testar o motor de regras com 4 documentos
            de exemplo.
          </p>
          <Link to="/captura" className="btn-primary mt-4">
            Ir para Captura
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPI
          title="XMLs capturados"
          value={state.xmlDocs.length}
          Icon={FileCheck2}
          hint={`${state.xmlDocs.filter((d) => d.tipo === "NF-e").length} NF-e + ${
            state.xmlDocs.filter((d) => d.tipo === "CT-e").length
          } CT-e`}
        />
        <KPI
          title="Empresas ativas"
          value={state.empresas.length}
          Icon={Building2}
          hint="Certificado A1 vinculado"
        />
        <KPI
          title="Divergencias pendentes"
          value={state.divergencias.length}
          Icon={AlertTriangle}
          hint="Cada decisao vira regra"
        />
        <KPI
          title="Auto-classificacao"
          value={`${taxa}%`}
          Icon={Sparkles}
          hint={`${totalClass} de ${totalItens} itens classificados`}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-6">
        <div className="card p-5 xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900">
                Captura por dia (entrada vs saida)
              </h3>
              <p className="text-xs text-slate-500">
                Calculado das datas de emissao dos XMLs processados
              </p>
            </div>
          </div>
          <div className="h-72">
            {timeline.length === 0 ? (
              <div className="h-full grid place-content-center text-sm text-slate-400">
                Sem dados ainda. Importe XMLs para ver a timeline.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeline}>
                  <defs>
                    <linearGradient
                      id="colorEntrada"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#1a5fe8" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#1a5fe8" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorSaida" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#eef2f7" vertical={false} />
                  <XAxis
                    dataKey="dia"
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                  />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="entrada"
                    stroke="#1a5fe8"
                    fill="url(#colorEntrada)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="saida"
                    stroke="#10b981"
                    fill="url(#colorSaida)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-slate-900 mb-4">
            Distribuicao por tipo
          </h3>
          {distTipos.length === 0 ? (
            <div className="h-60 grid place-content-center text-sm text-slate-400">
              Sem dados
            </div>
          ) : (
            <>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distTipos}
                      innerRadius={48}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {distTipos.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2 text-center">
                {distTipos.map((d, i) => (
                  <div key={d.name} className="bg-slate-50 rounded-lg py-2">
                    <div className="text-xs text-slate-500">{d.name}</div>
                    <div
                      className="text-lg font-semibold"
                      style={{ color: COLORS[i % COLORS.length] }}
                    >
                      {d.value}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-6">
        <div className="card p-5 xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900">
                Apuracao por mes (R$)
              </h3>
              <p className="text-xs text-slate-500">
                PIS, COFINS e preview IBS/CBS calculados sobre os lancamentos
              </p>
            </div>
            <span className="badge-info">Reforma tributaria</span>
          </div>
          <div className="h-72">
            {apuracao.length === 0 ? (
              <div className="h-full grid place-content-center text-sm text-slate-400">
                Resolva divergencias para popular a apuracao.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={apuracao}>
                  <CartesianGrid stroke="#eef2f7" vertical={false} />
                  <XAxis
                    dataKey="mes"
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                  />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="pis"
                    fill="#1a5fe8"
                    radius={[6, 6, 0, 0]}
                    name="PIS"
                  />
                  <Bar
                    dataKey="cofins"
                    fill="#5a9eff"
                    radius={[6, 6, 0, 0]}
                    name="COFINS"
                  />
                  <Bar
                    dataKey="ibsCbs"
                    fill="#10b981"
                    radius={[6, 6, 0, 0]}
                    name="IBS/CBS"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-slate-900 mb-4">
            Status das operacoes
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-emerald-100 text-emerald-600 grid place-content-center">
                <CheckCircle2 size={18} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-800">OK</div>
                <div className="text-xs text-slate-500">
                  Classificado pelo motor
                </div>
              </div>
              <div className="text-lg font-semibold">{okCount}</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-amber-100 text-amber-600 grid place-content-center">
                <AlertTriangle size={18} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-800">
                  Atencao
                </div>
                <div className="text-xs text-slate-500">
                  Divergencias menores
                </div>
              </div>
              <div className="text-lg font-semibold">{warnCount}</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-rose-100 text-rose-600 grid place-content-center">
                <AlertOctagon size={18} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-800">
                  Critico
                </div>
                <div className="text-xs text-slate-500">
                  Sem regra parametrizada
                </div>
              </div>
              <div className="text-lg font-semibold">{critCount}</div>
            </div>
          </div>

          <div className="mt-5 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
                Regras ativas
              </h4>
              <Link
                to="/regras"
                className="text-xs text-brand-700 font-semibold inline-flex items-center gap-1"
              >
                <Sliders size={12} /> Ver todas
              </Link>
            </div>
            <div className="space-y-2">
              {state.regras.length === 0 && (
                <div className="text-sm text-slate-500">
                  Nenhuma regra criada.
                </div>
              )}
              {state.regras.slice(0, 4).map((r) => (
                <div key={r.id} className="text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-800 truncate max-w-[180px]">
                      {r.fornecedor}
                    </span>
                    <StatusBadge status="ok" />
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    NCM {r.ncm} - CFOP {r.cfop} - {r.hits} aplicacoes
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
