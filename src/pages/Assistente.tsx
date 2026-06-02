import { useEffect, useMemo, useRef, useState } from "react";
import { Sparkles, Send, Download, FileSpreadsheet } from "lucide-react";
import PageHeader from "../components/PageHeader";
import type { ChatMsg } from "../types";
import { useApp } from "../store/AppStore";
import { downloadTxt } from "../lib/sped";

const seed: ChatMsg[] = [
  {
    id: "m1",
    role: "assistant",
    text: "Ola! Sou seu assistente fiscal. Posso consultar a base real desta empresa: apuracoes, NCMs, fornecedores, divergencias, lancamentos. Tente perguntar:\n\n- Quanto comprei do NCM 76061100?\n- Qual minha apuracao de PIS?\n- Quais divergencias estao em aberto?\n- Quanto e a apuracao consolidada?",
    ts: "agora",
  },
];

function moeda(v: number) {
  return (
    "R$ " +
    v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  );
}

export default function Assistente() {
  const { state } = useApp();
  const [msgs, setMsgs] = useState<ChatMsg[]>(seed);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, thinking]);

  const totalPis = useMemo(
    () => state.lancamentos.reduce((s, l) => s + l.valor * 0.0165, 0),
    [state.lancamentos]
  );
  const totalCofins = useMemo(
    () => state.lancamentos.reduce((s, l) => s + l.valor * 0.076, 0),
    [state.lancamentos]
  );
  const totalIbsCbs = useMemo(
    () => state.lancamentos.reduce((s, l) => s + l.valor * 0.0088, 0),
    [state.lancamentos]
  );

  const responder = (q: string): string => {
    const t = q.toLowerCase();

    // Match NCM
    const ncmMatch = t.match(/ncm\s*([0-9]{4,8})/);
    if (ncmMatch) {
      const ncm = ncmMatch[1];
      const lancs = state.lancamentos.filter((l) => l.ncm === ncm);
      const total = lancs.reduce((s, l) => s + l.valor, 0);
      if (lancs.length === 0) {
        return `Nao encontrei lancamentos com NCM ${ncm} na base atual. Talvez ainda esteja em divergencia ou nao tenha sido importado.`;
      }
      return `**NCM ${ncm}**\n\n- Lancamentos: ${lancs.length}\n- Valor total: ${moeda(
        total
      )}\n- PIS apropriado: ${moeda(total * 0.0165)}\n- COFINS apropriado: ${moeda(
        total * 0.076
      )}`;
    }

    if (t.includes("pis")) {
      return `**Apuracao PIS**\n\n- Lancamentos: ${state.lancamentos.length}\n- Base de calculo: ${moeda(
        state.lancamentos.reduce((s, l) => s + l.valor, 0)
      )}\n- Aliquota: 1,65%\n- **PIS apurado: ${moeda(totalPis)}**`;
    }

    if (t.includes("cofins")) {
      return `**Apuracao COFINS**\n\n- Base: ${moeda(
        state.lancamentos.reduce((s, l) => s + l.valor, 0)
      )}\n- Aliquota: 7,6%\n- **COFINS apurado: ${moeda(totalCofins)}**`;
    }

    if (t.includes("apur") || t.includes("consolidad") || t.includes("total")) {
      return `**Apuracao consolidada**\n\n- PIS: ${moeda(totalPis)}\n- COFINS: ${moeda(
        totalCofins
      )}\n- IBS/CBS (preview): ${moeda(totalIbsCbs)}\n- **Total: ${moeda(
        totalPis + totalCofins + totalIbsCbs
      )}**\n\nBase: ${state.lancamentos.length} lancamentos classificados.`;
    }

    if (t.includes("diverg") || t.includes("critic") || t.includes("aberto")) {
      const crit = state.divergencias.filter((d) => d.severidade === "crit");
      const warn = state.divergencias.filter((d) => d.severidade === "warn");
      if (state.divergencias.length === 0) {
        return "Nao ha divergencias pendentes. O motor de regras esta cobrindo 100% dos lancamentos.";
      }
      const lista = state.divergencias
        .slice(0, 5)
        .map(
          (d, i) =>
            `${i + 1}. **${d.severidade === "crit" ? "Critica" : "Atencao"}** - ${d.doc} (${d.emitente}): ${d.motivo}`
        )
        .join("\n");
      return `Voce tem **${state.divergencias.length} divergencias em aberto** (${crit.length} criticas, ${warn.length} de atencao):\n\n${lista}`;
    }

    if (t.includes("regra")) {
      const totalHits = state.regras.reduce((s, r) => s + r.hits, 0);
      return `Regras ativas: **${state.regras.length}**\n- Auto-aprendidas: ${
        state.regras.filter((r) => r.origem === "auto-aprendida").length
      }\n- Manuais: ${
        state.regras.filter((r) => r.origem === "manual").length
      }\n- Aplicacoes acumuladas: ${totalHits}`;
    }

    if (t.includes("fornecedor") || t.includes("cnpj")) {
      const top = [...state.parceiros]
        .filter((p) => p.tipo === "fornecedor" || p.tipo === "ambos")
        .slice(0, 5);
      if (top.length === 0) return "Nenhum fornecedor cadastrado ainda.";
      return `**Fornecedores cadastrados (${state.parceiros.length} no total):**\n\n${top
        .map((p, i) => `${i + 1}. ${p.nome} (${p.cnpj}) - ${p.uf}`)
        .join("\n")}`;
    }

    return "Posso responder sobre apuracoes, NCMs, divergencias, regras e fornecedores. Tente:\n- 'Qual minha apuracao consolidada?'\n- 'Quanto comprei do NCM 22021000?'\n- 'Quais divergencias estao em aberto?'";
  };

  const send = () => {
    if (!input.trim()) return;
    const userMsg: ChatMsg = {
      id: `u-${Date.now()}`,
      role: "user",
      text: input,
      ts: "agora",
    };
    setMsgs((m) => [...m, userMsg]);
    const q = input;
    setInput("");
    setThinking(true);
    setTimeout(() => {
      const reply: ChatMsg = {
        id: `a-${Date.now()}`,
        role: "assistant",
        text: responder(q),
        ts: "agora",
      };
      setMsgs((m) => [...m, reply]);
      setThinking(false);
    }, 500);
  };

  const exportarTxt = () => {
    const txt = msgs
      .map((m) => `[${m.role.toUpperCase()}]\n${m.text}\n`)
      .join("\n---\n\n");
    downloadTxt("conversa-assistente.txt", txt);
  };

  const sugestoes = [
    "Qual minha apuracao consolidada?",
    "Quanto comprei do NCM 76061100?",
    "Quais divergencias estao em aberto?",
    "Liste meus fornecedores",
  ];

  return (
    <div>
      <PageHeader
        title="Assistente IA"
        description="Faca perguntas em linguagem natural sobre sua base fiscal real. As respostas sao calculadas em tempo real sobre os lancamentos importados."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 card flex flex-col h-[calc(100vh-220px)]">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
            <div className="size-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white grid place-content-center">
              <Sparkles size={16} />
            </div>
            <div>
              <div className="font-semibold text-slate-900 leading-tight">
                Assistente fiscal
              </div>
              <div className="text-xs text-slate-500">
                {state.lancamentos.length} lancamentos na base ativa
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {msgs.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}
              >
                {m.role === "assistant" && (
                  <div className="size-8 rounded-lg bg-brand-50 text-brand-600 grid place-content-center shrink-0">
                    <Sparkles size={14} />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-brand-600 text-white rounded-br-md"
                      : "bg-slate-100 text-slate-800 rounded-bl-md"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {thinking && (
              <div className="flex gap-3">
                <div className="size-8 rounded-lg bg-brand-50 text-brand-600 grid place-content-center shrink-0">
                  <Sparkles size={14} />
                </div>
                <div className="bg-slate-100 rounded-2xl px-4 py-3 text-sm text-slate-500 inline-flex gap-1">
                  <span className="size-1.5 rounded-full bg-slate-400 animate-bounce" />
                  <span
                    className="size-1.5 rounded-full bg-slate-400 animate-bounce"
                    style={{ animationDelay: "0.15s" }}
                  />
                  <span
                    className="size-1.5 rounded-full bg-slate-400 animate-bounce"
                    style={{ animationDelay: "0.3s" }}
                  />
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
          <div className="border-t border-slate-100 p-4">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                className="input flex-1"
                placeholder="Pergunte sobre sua base fiscal..."
              />
              <button onClick={send} className="btn-primary">
                <Send size={16} /> Enviar
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <div className="card p-5">
            <h3 className="font-semibold text-slate-900 mb-3">
              Sugestoes rapidas
            </h3>
            <div className="space-y-2">
              {sugestoes.map((s) => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="w-full text-left text-sm rounded-lg border border-slate-200 px-3 py-2 hover:border-brand-300 hover:bg-brand-50/50 transition"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-slate-900 mb-3">
              Exportar conversa
            </h3>
            <div className="flex flex-col gap-2">
              <button
                className="btn-outline justify-start"
                onClick={() => alert("Excel: implementacao futura")}
              >
                <FileSpreadsheet size={16} /> Exportar para Excel
              </button>
              <button className="btn-outline justify-start" onClick={exportarTxt}>
                <Download size={16} /> Exportar para TXT
              </button>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-slate-900 mb-2">
              Snapshot da base
            </h3>
            <dl className="text-sm space-y-1.5">
              <div className="flex justify-between">
                <dt className="text-slate-500">XMLs</dt>
                <dd className="font-semibold">{state.xmlDocs.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Lancamentos</dt>
                <dd className="font-semibold">{state.lancamentos.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Regras</dt>
                <dd className="font-semibold">{state.regras.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Divergencias</dt>
                <dd className="font-semibold text-amber-700">
                  {state.divergencias.length}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
