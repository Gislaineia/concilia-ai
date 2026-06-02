// Motor de regras parametrizadas.
// Recebe um documento parseado + base de regras + cadastros, e retorna
// um lancamento classificado ou uma divergencia para cada item.

import type { NfeParsed, NfeItem } from "./nfeParser";
import type { Regra, Divergencia, Lancamento } from "../types";

export interface ProcessResult {
  lancamentos: Lancamento[];
  divergencias: Divergencia[];
  novosParceiros: { cnpj: string; nome: string; uf: string; tipo: "fornecedor" | "cliente" }[];
  novosProdutos: { codigo: string; descricao: string; ncm: string }[];
}

function ruleMatches(r: Regra, doc: NfeParsed, item: NfeItem): boolean {
  if (r.cnpjEmitente && r.cnpjEmitente !== doc.emitente.cnpj) return false;
  if (r.ncm && r.ncm !== "*" && r.ncm !== item.ncm) return false;
  if (r.cfop && r.cfop !== "*" && r.cfop !== item.cfop) return false;
  if (r.uf && r.uf !== "*" && r.uf !== doc.emitente.uf) return false;
  return true;
}

function genId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function processarDocumento(
  doc: NfeParsed,
  regras: Regra[],
  parceirosExistentes: Set<string>,
  produtosExistentes: Set<string>
): ProcessResult {
  const lancamentos: Lancamento[] = [];
  const divergencias: Divergencia[] = [];
  const novosParceiros: ProcessResult["novosParceiros"] = [];
  const novosProdutos: ProcessResult["novosProdutos"] = [];

  // Auto-cadastro de parceiro
  const parceiroChave = doc.emitente.cnpj;
  if (parceiroChave && !parceirosExistentes.has(parceiroChave)) {
    novosParceiros.push({
      cnpj: doc.emitente.cnpj,
      nome: doc.emitente.nome,
      uf: doc.emitente.uf,
      tipo: doc.direcao === "entrada" ? "fornecedor" : "cliente",
    });
    parceirosExistentes.add(parceiroChave);
  }

  for (const item of doc.itens) {
    const prodKey = `${item.codigo}|${item.ncm}`;
    if (item.codigo && !produtosExistentes.has(prodKey)) {
      novosProdutos.push({
        codigo: item.codigo,
        descricao: item.descricao,
        ncm: item.ncm,
      });
      produtosExistentes.add(prodKey);
    }

    const regra = regras.find((r) => ruleMatches(r, doc, item));

    if (regra) {
      lancamentos.push({
        id: genId("lan"),
        chaveDoc: doc.chave,
        itemNumero: item.numero,
        regraId: regra.id,
        cfop: item.cfop,
        ncm: item.ncm,
        cstPis: regra.cstPis,
        cstCofins: regra.cstCofins,
        valor: item.valorTotal,
        descricao: regra.acao,
        emissao: doc.emissao,
        emitenteCnpj: doc.emitente.cnpj,
        emitenteNome: doc.emitente.nome,
        direcao: doc.direcao,
      });
    } else {
      // Sem regra -> divergencia
      const severidade =
        !item.ncm || !item.cfop ? "crit" : ("warn" as "warn" | "crit");
      const motivo = !item.cfop
        ? "CFOP ausente no item"
        : !item.ncm
        ? "NCM ausente no item"
        : `Sem regra cadastrada para ${doc.emitente.nome} + NCM ${item.ncm} + CFOP ${item.cfop} + UF ${doc.emitente.uf}`;

      const sugestao = `Criar regra: ${doc.emitente.nome} + NCM ${item.ncm} + CFOP ${item.cfop} + UF ${doc.emitente.uf} -> classificar como ${
        doc.direcao === "entrada" ? "compra para revenda" : "venda"
      }`;

      divergencias.push({
        id: genId("div"),
        chaveDoc: doc.chave,
        doc: `${doc.tipo} ${doc.numero}`,
        emitente: doc.emitente.nome,
        emitenteCnpj: doc.emitente.cnpj,
        ncm: item.ncm || "—",
        cfop: item.cfop || "—",
        uf: doc.emitente.uf,
        valor: item.valorTotal,
        motivo,
        severidade,
        sugestao,
        criada: doc.emissao || new Date().toISOString().slice(0, 10),
        itemNumero: item.numero,
        itemDescricao: item.descricao,
      });
    }
  }

  return { lancamentos, divergencias, novosParceiros, novosProdutos };
}

// Cria uma regra a partir da resolucao de uma divergencia. A proxima
// nota com criterios identicos sera classificada automaticamente.
export function regraDeDivergencia(
  d: Divergencia,
  regime: string,
  acao: string,
  cstPis: string,
  cstCofins: string
): Regra {
  return {
    id: genId("r"),
    fornecedor: d.emitente,
    cnpjEmitente: d.emitenteCnpj,
    ncm: d.ncm === "—" ? "*" : d.ncm,
    cfop: d.cfop === "—" ? "*" : d.cfop,
    uf: d.uf,
    regime,
    acao,
    cstPis,
    cstCofins,
    origem: "auto-aprendida",
    hits: 0,
  };
}
