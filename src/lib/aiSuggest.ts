// Motor de sugestoes inteligentes para divergencias.
// Analisa: regime tributario da empresa, UF empresa vs UF emitente,
// CFOP (compra revenda, uso/consumo, servico, ativo imobilizado),
// NCM (lista monofasicos/ST simplificada), direcao da operacao.
// Retorna multiplas alternativas de classificacao, ranqueadas por confianca.

import type { Divergencia, Empresa } from "../types";

export interface SugestaoIA {
  id: string;
  titulo: string;
  acao: string;
  cstPis: string;
  cstCofins: string;
  cfopSugerido?: string;
  geraCredito: boolean;
  observacao: string;
  confianca: number; // 0-1
  fundamento: string[];
}

// NCMs comumente em monofasico/ST - lista didatica para MVP
const MONOFASICOS = new Set([
  "22021000", // refrigerantes
  "22030000", // cervejas
  "27101259", // gasolina
  "27101921", // diesel
  "33041000", // cosmeticos selecionados
  "33049910", // higiene em alguns regimes
]);

const ST_RECORRENTE = new Set([
  "22021000",
  "22030000",
  "33049910",
  "39239090",
]);

const ufNorte = ["AC", "AM", "AP", "PA", "RO", "RR", "TO"];
const ufNordeste = ["AL", "BA", "CE", "MA", "PB", "PE", "PI", "RN", "SE"];
const ufSulSudeste = ["RS", "SC", "PR", "SP", "RJ", "MG", "ES"];

function aliquotaInterestadual(ufOrigem: string, ufDestino: string): number {
  if (ufOrigem === ufDestino) return 0;
  const oNorteNeCo = ![...ufSulSudeste].includes(ufOrigem);
  const dSulSudeste = ufSulSudeste.includes(ufDestino);
  if (oNorteNeCo) return 12;
  if (ufSulSudeste.includes(ufOrigem) && !dSulSudeste) return 7;
  return 12;
}

function classificarCfop(cfop: string): {
  natureza:
    | "compra-revenda"
    | "compra-uso-consumo"
    | "compra-ativo"
    | "servico-transporte"
    | "venda"
    | "outro";
  interestadual: boolean;
} {
  const interestadual = cfop.startsWith("2") || cfop.startsWith("6");
  const last3 = cfop.slice(-3);
  if (["102", "403", "405"].includes(last3))
    return { natureza: "compra-revenda", interestadual };
  if (last3 === "556" || last3 === "557")
    return { natureza: "compra-uso-consumo", interestadual };
  if (last3 === "551" || last3 === "552")
    return { natureza: "compra-ativo", interestadual };
  if (last3 === "352" || last3 === "353")
    return { natureza: "servico-transporte", interestadual };
  if (cfop.startsWith("5") || cfop.startsWith("6"))
    return { natureza: "venda", interestadual };
  return { natureza: "outro", interestadual };
}

export function gerarSugestoesIA(
  d: Divergencia,
  empresa: Empresa
): SugestaoIA[] {
  const sugestoes: SugestaoIA[] = [];
  const cfopInfo = classificarCfop(d.cfop || "");
  const ufEmp = empresa.uf;
  const ufEmit = d.uf;
  const interna = ufEmp === ufEmit;
  const aliqInter = !interna ? aliquotaInterestadual(ufEmit, ufEmp) : 0;
  const isST = ST_RECORRENTE.has(d.ncm);
  const isMono = MONOFASICOS.has(d.ncm);
  const regime = empresa.regime;
  const naoCumulativo = regime === "Lucro Real";

  // 1. Compra para revenda (caso mais comum)
  if (cfopInfo.natureza === "compra-revenda" || (!d.cfop && d.severidade === "warn")) {
    const credito = naoCumulativo && !isST && !isMono;
    sugestoes.push({
      id: "s-revenda",
      titulo: "Compra para revenda",
      acao: credito
        ? "Lancar como compra para revenda - apropriar credito PIS/COFINS"
        : isMono
        ? "Lancar como compra revenda - monofasico (sem credito)"
        : isST
        ? "Lancar como compra revenda - ICMS-ST ja recolhido"
        : "Lancar como compra para revenda (regime cumulativo)",
      cstPis: credito ? "50" : isMono ? "04" : isST ? "70" : "70",
      cstCofins: credito ? "50" : isMono ? "04" : isST ? "70" : "70",
      cfopSugerido: interna ? "1102" : "2102",
      geraCredito: credito,
      observacao: credito
        ? `Empresa em ${regime} (nao-cumulativo) credita 9,25% sobre ${d.valor.toFixed(2)}`
        : isMono
        ? "Produto monofasico - PIS/COFINS recolhido na origem"
        : isST
        ? "Produto em ICMS-ST - sem destaque"
        : "Regime cumulativo nao gera credito de PIS/COFINS",
      confianca: 0.9 - (isMono || isST ? 0.05 : 0),
      fundamento: [
        `CFOP ${d.cfop} sugere compra para revenda`,
        `NCM ${d.ncm} ${isMono ? "consta na lista de monofasicos" : isST ? "frequentemente em ST" : "tributacao normal"}`,
        `Regime ${regime} - ${naoCumulativo ? "creditos PIS/COFINS permitidos" : "regime cumulativo"}`,
        !interna
          ? `Operacao interestadual ${ufEmit}->${ufEmp} (aliquota ICMS ${aliqInter}%)`
          : `Operacao interna em ${ufEmp}`,
      ],
    });
  }

  // 2. Uso e consumo
  if (
    cfopInfo.natureza === "compra-uso-consumo" ||
    (cfopInfo.natureza === "outro" && d.severidade === "warn")
  ) {
    sugestoes.push({
      id: "s-uso",
      titulo: "Material de uso/consumo",
      acao: "Lancar como uso/consumo - sem direito a credito",
      cstPis: "70",
      cstCofins: "70",
      cfopSugerido: interna ? "1556" : "2556",
      geraCredito: false,
      observacao:
        "Material de uso interno nao gera credito de PIS/COFINS nem de ICMS para a maioria dos regimes",
      confianca: cfopInfo.natureza === "compra-uso-consumo" ? 0.85 : 0.4,
      fundamento: [
        "Material consumido na operacao da empresa",
        "Sem direito a credito tributario na maior parte dos casos",
        `Empresa em ${regime}`,
      ],
    });
  }

  // 3. Ativo imobilizado
  if (cfopInfo.natureza === "compra-ativo") {
    sugestoes.push({
      id: "s-ativo",
      titulo: "Ativo imobilizado",
      acao: "Lancar como ativo imobilizado - credito em 1/48 avos (CIAP)",
      cstPis: "50",
      cstCofins: "50",
      geraCredito: naoCumulativo,
      observacao:
        "ICMS sobre aquisicao de ativo apropriado em 48 parcelas (CIAP). PIS/COFINS creditado integralmente em Lucro Real.",
      confianca: 0.8,
      fundamento: [
        "CFOP indica aquisicao de ativo imobilizado",
        "CIAP 1/48 para ICMS",
        regime === "Lucro Real"
          ? "Lucro Real - credito integral PIS/COFINS"
          : `${regime} - sem credito PIS/COFINS`,
      ],
    });
  }

  // 4. Servico de transporte (CT-e)
  if (cfopInfo.natureza === "servico-transporte" || d.cfop === "1352") {
    sugestoes.push({
      id: "s-frete",
      titulo: "Servico de transporte vinculado a compra",
      acao: "Lancar como frete sobre compras - credito proporcional",
      cstPis: naoCumulativo ? "50" : "70",
      cstCofins: naoCumulativo ? "50" : "70",
      cfopSugerido: interna ? "1352" : "2352",
      geraCredito: naoCumulativo,
      observacao: naoCumulativo
        ? "Frete sobre compras gera credito PIS/COFINS no Lucro Real"
        : "Frete em regime cumulativo nao gera credito",
      confianca: 0.85,
      fundamento: [
        "CFOP 1352/2352 - servico de transporte",
        "Composicao do custo de aquisicao",
        regime === "Lucro Real"
          ? "Credito PIS/COFINS permitido"
          : "Sem credito (cumulativo)",
      ],
    });
  }

  // 5. Operacao interestadual com diferencial - alerta DIFAL
  if (!interna && cfopInfo.natureza !== "venda") {
    const aliqInterna = ufEmp === "SP" ? 18 : ufEmp === "MG" ? 18 : 17;
    if (aliqInter < aliqInterna) {
      sugestoes.push({
        id: "s-difal",
        titulo: "Verificar DIFAL (diferencial de aliquota)",
        acao: "Recolher DIFAL antes de classificar como compra normal",
        cstPis: "70",
        cstCofins: "70",
        geraCredito: false,
        observacao: `Operacao ${ufEmit}->${ufEmp}: aliquota interestadual ${aliqInter}% vs interna ${aliqInterna}%. Pode haver DIFAL de ${(
          aliqInterna - aliqInter
        ).toFixed(0)} p.p.`,
        confianca: 0.55,
        fundamento: [
          `UF origem (${ufEmit}) diferente de UF destino (${ufEmp})`,
          `Aliquota interestadual estimada: ${aliqInter}%`,
          `Aliquota interna em ${ufEmp}: ${aliqInterna}%`,
          "Verificar destinatario contribuinte ou nao",
        ],
      });
    }
  }

  // Ordenar por confianca
  return sugestoes.sort((a, b) => b.confianca - a.confianca);
}
