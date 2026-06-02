import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import type {
  AppState,
  Empresa,
  Regra,
  Divergencia,
  XmlDoc,
  Parceiro,
  Produto,
  Lancamento,
} from "../types";
import { parseFiscalXml, formatCnpj } from "../lib/nfeParser";
import { processarDocumento, regraDeDivergencia } from "../lib/engine";
import { sampleXmls } from "../data/sampleXmls";

const STORAGE_KEY = "concilia-ai:state-v1";

const empresaSeed: Empresa = {
  id: "e-aurora",
  cnpj: "12.345.678/0001-90",
  razaoSocial: "DISTRIBUIDORA AURORA LTDA",
  fantasia: "Aurora Distribuidora",
  uf: "SP",
  regime: "Lucro Presumido",
  certificadoA1: { valido: true, vencimento: "2026-11-12" },
  webhookSefaz: "ativo",
};

const initialState: AppState = {
  empresas: [empresaSeed],
  xmlDocs: [],
  parceiros: [],
  produtos: [],
  regras: [],
  divergencias: [],
  lancamentos: [],
  empresaAtivaId: empresaSeed.id,
};

type Action =
  | { type: "INIT"; state: AppState }
  | { type: "SET_EMPRESA_ATIVA"; id: string }
  | { type: "ADD_EMPRESA"; empresa: Empresa }
  | { type: "ADD_REGRA"; regra: Regra }
  | { type: "INC_REGRA_HITS"; id: string; by: number }
  | {
      type: "INGEST_RESULT";
      doc: XmlDoc;
      lancamentos: Lancamento[];
      divergencias: Divergencia[];
      novosParceiros: Parceiro[];
      novosProdutos: Produto[];
    }
  | { type: "REMOVE_DIVERGENCIA"; id: string }
  | { type: "REOPEN_DIVERGENCIA"; id: string }
  | {
      type: "REPROCESS_DIVERGENCIAS";
      regra: Regra;
      resolvedIds: string[];
      resolucao: Divergencia["resolucao"];
      lancamentos: Lancamento[];
    }
  | { type: "RESET" };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "INIT":
      return action.state;
    case "SET_EMPRESA_ATIVA":
      return { ...state, empresaAtivaId: action.id };
    case "ADD_EMPRESA":
      return { ...state, empresas: [...state.empresas, action.empresa] };
    case "ADD_REGRA":
      return { ...state, regras: [...state.regras, action.regra] };
    case "INC_REGRA_HITS":
      return {
        ...state,
        regras: state.regras.map((r) =>
          r.id === action.id ? { ...r, hits: r.hits + action.by } : r
        ),
      };
    case "INGEST_RESULT": {
      // Atualizar status do XmlDoc no array (se ja existia, substitui; senao, prepend)
      const xmlDocs = [
        action.doc,
        ...state.xmlDocs.filter((d) => d.chave !== action.doc.chave),
      ];
      const parceiros = [...state.parceiros];
      action.novosParceiros.forEach((p) => {
        if (!parceiros.find((x) => x.cnpj === p.cnpj)) parceiros.push(p);
      });
      const produtos = [...state.produtos];
      action.novosProdutos.forEach((p) => {
        if (!produtos.find((x) => x.codigo === p.codigo)) produtos.push(p);
      });
      // Atualizar hits das regras pelos lancamentos
      const hitsByRegra = new Map<string, number>();
      action.lancamentos.forEach((l) =>
        hitsByRegra.set(l.regraId, (hitsByRegra.get(l.regraId) || 0) + 1)
      );
      const regras = state.regras.map((r) => {
        const inc = hitsByRegra.get(r.id) || 0;
        return inc ? { ...r, hits: r.hits + inc } : r;
      });
      return {
        ...state,
        xmlDocs,
        parceiros,
        produtos,
        regras,
        lancamentos: [...state.lancamentos, ...action.lancamentos],
        divergencias: [...state.divergencias, ...action.divergencias],
      };
    }
    case "REMOVE_DIVERGENCIA":
      return {
        ...state,
        divergencias: state.divergencias.filter((d) => d.id !== action.id),
      };
    case "REOPEN_DIVERGENCIA":
      return {
        ...state,
        divergencias: state.divergencias.map((d) =>
          d.id === action.id
            ? { ...d, resolvida: false, resolucao: undefined }
            : d
        ),
      };
    case "REPROCESS_DIVERGENCIAS": {
      const resolved = new Set(action.resolvedIds);
      // Marcar como resolvidas (NAO remover - preservar para demo)
      const divergencias = state.divergencias.map((d) =>
        resolved.has(d.id)
          ? {
              ...d,
              resolvida: true,
              resolucao: action.resolucao,
            }
          : d
      );
      const regras = state.regras.find((r) => r.id === action.regra.id)
        ? state.regras.map((r) =>
            r.id === action.regra.id
              ? { ...r, hits: r.hits + action.lancamentos.length }
              : r
          )
        : [...state.regras, { ...action.regra, hits: action.lancamentos.length }];
      // Atualizar status dos XmlDocs afetados
      const docsAfetados = new Set(action.lancamentos.map((l) => l.chaveDoc));
      const xmlDocs = state.xmlDocs.map((d) => {
        if (!docsAfetados.has(d.chave)) return d;
        const aindaTem = divergencias.some(
          (x) => x.chaveDoc === d.chave && !x.resolvida
        );
        const lancsDoDoc =
          state.lancamentos.filter((l) => l.chaveDoc === d.chave).length +
          action.lancamentos.filter((l) => l.chaveDoc === d.chave).length;
        return {
          ...d,
          status: aindaTem ? d.status : "ok",
          itensClassificados: lancsDoDoc,
        };
      });
      return {
        ...state,
        regras,
        divergencias,
        lancamentos: [...state.lancamentos, ...action.lancamentos],
        xmlDocs,
      };
    }
    case "RESET":
      return { ...initialState };
    default:
      return state;
  }
}

interface Ctx {
  state: AppState;
  empresaAtiva: Empresa;
  ingestXml: (xml: string, fileName?: string) => Promise<{ doc?: XmlDoc; erro?: string }>;
  ingestSamples: () => Promise<void>;
  resolverDivergencia: (
    divergenciaId: string,
    decisao: { acao: string; cstPis: string; cstCofins: string; criarRegra: boolean }
  ) => void;
  reabrirDivergencia: (divergenciaId: string) => void;
  setEmpresaAtiva: (id: string) => void;
  reset: () => void;
}

const AppCtx = createContext<Ctx | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState, (s) => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return { ...s, ...JSON.parse(raw) };
    } catch {
      /* ignore */
    }
    return s;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);

  const empresaAtiva =
    state.empresas.find((e) => e.id === state.empresaAtivaId) ||
    state.empresas[0];

  const ingestXml = useCallback(
    async (xml: string, _fileName?: string) => {
      try {
        const parsed = parseFiscalXml(xml);
        const parceirosSet = new Set(state.parceiros.map((p) => p.cnpj));
        const produtosSet = new Set(
          state.produtos.map((p) => `${p.codigo}|${p.ncm}`)
        );
        const result = processarDocumento(
          parsed,
          state.regras,
          parceirosSet,
          produtosSet
        );

        const itensTotal = parsed.itens.length;
        const itensClassificados = result.lancamentos.length;
        let status: XmlDoc["status"] = "ok";
        if (result.divergencias.some((d) => d.severidade === "crit"))
          status = "crit";
        else if (result.divergencias.length > 0) status = "warn";

        const novosParceirosFull: Parceiro[] = result.novosParceiros.map(
          (p) => ({
            id: `p-${p.cnpj}`,
            cnpj: formatCnpj(p.cnpj),
            nome: p.nome,
            uf: p.uf,
            tipo: p.tipo,
            ultimaOperacao: parsed.emissao,
          })
        );
        const novosProdutosFull: Produto[] = result.novosProdutos.map((p) => ({
          id: `prod-${p.codigo}-${p.ncm}`,
          codigo: p.codigo,
          descricao: p.descricao,
          ncm: p.ncm,
          cisc: "—",
          uso: "revenda",
        }));

        const cfops = Array.from(new Set(parsed.itens.map((i) => i.cfop).filter(Boolean)));
        const ncms = Array.from(new Set(parsed.itens.map((i) => i.ncm).filter(Boolean)));

        const doc: XmlDoc = {
          id: `x-${parsed.chave}`,
          chave: parsed.chave,
          numero: parsed.numero,
          serie: parsed.serie,
          tipo: parsed.tipo,
          direcao: parsed.direcao,
          emitenteCnpj: formatCnpj(parsed.emitente.cnpj),
          emitenteNome: parsed.emitente.nome,
          emitenteUf: parsed.emitente.uf,
          destinatarioCnpj: formatCnpj(parsed.destinatario.cnpj),
          destinatarioNome: parsed.destinatario.nome,
          emissao: parsed.emissao,
          valor: parsed.valorTotal,
          status,
          itensTotal,
          itensClassificados,
          cfopsResumo: cfops,
          ncmsResumo: ncms,
          natOp: parsed.natOp,
        };

        dispatch({
          type: "INGEST_RESULT",
          doc,
          lancamentos: result.lancamentos,
          divergencias: result.divergencias,
          novosParceiros: novosParceirosFull,
          novosProdutos: novosProdutosFull,
        });

        return { doc };
      } catch (e) {
        return { erro: e instanceof Error ? e.message : String(e) };
      }
    },
    [state.parceiros, state.produtos, state.regras]
  );

  const ingestSamples = useCallback(async () => {
    for (const s of sampleXmls) {
      // Re-derivar set/regras do estado mais recente em cada loop
      // usando state direto: aqui basta delegar a ingestXml em sequencia
      // (cada chamada le do state via useCallback dependente)
      await ingestXml(s.conteudo, s.nome);
      // pequena espera para permitir re-render entre dispatches
      await new Promise((r) => setTimeout(r, 30));
    }
  }, [ingestXml]);

  const resolverDivergencia = useCallback(
    (
      divergenciaId: string,
      decisao: {
        acao: string;
        cstPis: string;
        cstCofins: string;
        criarRegra: boolean;
      }
    ) => {
      const div = state.divergencias.find((d) => d.id === divergenciaId);
      if (!div) return;

      if (!decisao.criarRegra) {
        dispatch({ type: "REMOVE_DIVERGENCIA", id: divergenciaId });
        return;
      }

      const regra = regraDeDivergencia(
        div,
        empresaAtiva.regime,
        decisao.acao,
        decisao.cstPis,
        decisao.cstCofins
      );

      // Encontrar todas divergencias PENDENTES que casam com a regra
      const resolvedIds: string[] = [];
      const lancamentos: Lancamento[] = [];
      for (const d of state.divergencias) {
        if (d.resolvida) continue; // ja resolvida, nao tocar
        const match =
          d.emitenteCnpj === regra.cnpjEmitente &&
          (regra.ncm === "*" || d.ncm === regra.ncm) &&
          (regra.cfop === "*" || d.cfop === regra.cfop) &&
          d.uf === regra.uf;
        if (!match) continue;
        resolvedIds.push(d.id);
        lancamentos.push({
          id: `lan-${d.id}`,
          chaveDoc: d.chaveDoc,
          itemNumero: d.itemNumero,
          regraId: regra.id,
          cfop: d.cfop,
          ncm: d.ncm,
          cstPis: regra.cstPis,
          cstCofins: regra.cstCofins,
          valor: d.valor,
          descricao: regra.acao,
          emissao: d.criada,
          emitenteCnpj: d.emitenteCnpj,
          emitenteNome: d.emitente,
          direcao: "entrada",
        });
      }

      const resolucao: Divergencia["resolucao"] = {
        acao: decisao.acao,
        cstPis: decisao.cstPis,
        cstCofins: decisao.cstCofins,
        regraId: regra.id,
        resolvidaEm: new Date().toISOString().slice(0, 10),
        resolvidaPor: "Gislaine Araujo",
      };

      dispatch({
        type: "REPROCESS_DIVERGENCIAS",
        regra,
        resolvedIds,
        resolucao,
        lancamentos,
      });
    },
    [state.divergencias, empresaAtiva.regime]
  );

  const reabrirDivergencia = useCallback(
    (id: string) => dispatch({ type: "REOPEN_DIVERGENCIA", id }),
    []
  );

  const setEmpresaAtiva = useCallback(
    (id: string) => dispatch({ type: "SET_EMPRESA_ATIVA", id }),
    []
  );
  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      state,
      empresaAtiva,
      ingestXml,
      ingestSamples,
      resolverDivergencia,
      reabrirDivergencia,
      setEmpresaAtiva,
      reset,
    }),
    [
      state,
      empresaAtiva,
      ingestXml,
      ingestSamples,
      resolverDivergencia,
      reabrirDivergencia,
      setEmpresaAtiva,
      reset,
    ]
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp deve ser usado dentro de AppProvider");
  return ctx;
}
