// Gerador de SPED Contribuicoes (subset funcional para MVP demo).
// Produz um arquivo TXT com os blocos 0000, 0001, 0150, 0190, 0200,
// C100, C170, M100, M500, 9999. Os calculos sao simplificados: a ideia
// e provar a capacidade de gerar TXT pronto para o validador.

import type { Lancamento, Empresa, Parceiro, Produto } from "../types";

function pad(s: string | number, len: number): string {
  return String(s).padStart(len, "0");
}

function moeda(v: number): string {
  return v.toFixed(2).replace(".", ",");
}

function dataPad(iso: string): string {
  // YYYY-MM-DD -> DDMMYYYY
  if (!iso || iso.length < 10) return "        ";
  const [y, m, d] = iso.split("-");
  return `${d}${m}${y}`;
}

function cnpjLimpo(c: string): string {
  return (c || "").replace(/\D/g, "").padStart(14, "0").slice(-14);
}

export interface SpedInput {
  empresa: Empresa;
  periodoInicio: string; // YYYY-MM-DD
  periodoFim: string; // YYYY-MM-DD
  lancamentos: Lancamento[];
  parceiros: Parceiro[];
  produtos: Produto[];
}

export interface SpedOutput {
  txt: string;
  resumoBlocos: { bloco: string; nome: string; registros: number; tamanho: string; status: string }[];
  totais: { pis: number; cofins: number; ibsCbs: number };
}

export function gerarSped(input: SpedInput): SpedOutput {
  const { empresa, periodoInicio, periodoFim, lancamentos, parceiros, produtos } = input;
  const linhas: string[] = [];
  const counters: Record<string, number> = {};

  const add = (campos: (string | number)[]) => {
    const reg = String(campos[0]);
    counters[reg] = (counters[reg] || 0) + 1;
    linhas.push("|" + campos.join("|") + "|");
  };

  // 0000
  add([
    "0000",
    "018",
    "0",
    dataPad(periodoInicio),
    dataPad(periodoFim),
    empresa.razaoSocial,
    cnpjLimpo(empresa.cnpj),
    empresa.uf,
    "",
    "",
    "3",
    "0",
    "0",
  ]);
  add(["0001", "0"]);

  // 0150 - participantes (clientes/fornecedores envolvidos)
  parceiros.forEach((p, idx) => {
    add([
      "0150",
      pad(idx + 1, 6),
      p.nome,
      "1058", // cod pais Brasil
      cnpjLimpo(p.cnpj),
      "",
      "",
      "",
      "",
      "",
      "",
    ]);
  });

  // 0190 - unidades de medida basicas
  ["UN", "KG", "L", "CX", "PC"].forEach((u) => {
    add(["0190", u, "Unidade " + u]);
  });

  // 0200 - itens
  produtos.forEach((p, idx) => {
    add([
      "0200",
      pad(idx + 1, 6),
      p.descricao,
      "",
      "UN",
      "00",
      p.ncm || "",
      "",
      "",
      "",
      "",
      "",
      "",
    ]);
  });

  // Bloco C - documentos fiscais (NF-e)
  // Agrupar lancamentos por chaveDoc
  const porDoc = new Map<string, Lancamento[]>();
  lancamentos.forEach((l) => {
    const arr = porDoc.get(l.chaveDoc) || [];
    arr.push(l);
    porDoc.set(l.chaveDoc, arr);
  });

  let totalPis = 0;
  let totalCofins = 0;
  let totalIbsCbs = 0;

  porDoc.forEach((items, chave) => {
    const total = items.reduce((s, i) => s + i.valor, 0);
    const primeiro = items[0];
    const indOper = primeiro.direcao === "saida" ? "1" : "0";
    add([
      "C100",
      indOper,
      "1", // ind emit (1=terceiros)
      pad("1", 6),
      cnpjLimpo(primeiro.emitenteCnpj),
      "00",
      "55",
      "1",
      pad("1", 9),
      chave,
      dataPad(primeiro.emissao),
      dataPad(primeiro.emissao),
      moeda(total),
      "0",
      "",
      "",
      moeda(total),
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ]);
    items.forEach((it) => {
      const pis = it.valor * 0.0165;
      const cofins = it.valor * 0.076;
      const ibsCbs = it.valor * 0.0088; // preview reforma
      totalPis += pis;
      totalCofins += cofins;
      totalIbsCbs += ibsCbs;
      add([
        "C170",
        pad(it.itemNumero, 3),
        "ITEM" + it.itemNumero,
        "",
        "1",
        "UN",
        moeda(it.valor),
        "0",
        "",
        it.cfop,
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        it.cstPis,
        moeda(pis),
        "",
        "0,0165",
        moeda(it.valor),
        "",
        "",
        it.cstCofins,
        moeda(cofins),
        "",
        "0,076",
        moeda(it.valor),
      ]);
    });
  });

  // Bloco M - apuracao consolidada
  add(["M100", "01", "0", moeda(totalPis), "", "", "", "", "", moeda(totalPis)]);
  add([
    "M500",
    "01",
    "0",
    moeda(totalCofins),
    "",
    "",
    "",
    "",
    "",
    moeda(totalCofins),
  ]);

  // Z100 - preview IBS/CBS reforma
  add(["Z100", "01", moeda(totalIbsCbs)]);

  // Encerramento
  const totalRegistros = linhas.length + 1; // +1 = a propria 9999
  add(["9999", String(totalRegistros)]);

  const txt = linhas.join("\n");

  const blocoNome: Record<string, string> = {
    "0000": "Abertura do arquivo digital",
    "0001": "Abertura do bloco 0",
    "0150": "Tabela de cadastro do participante",
    "0190": "Identificacao das unidades de medida",
    "0200": "Tabela de identificacao do item",
    "C100": "Documento - Nota Fiscal eletronica",
    "C170": "Itens do documento",
    "M100": "Credito PIS - apuracao",
    "M500": "Credito COFINS - apuracao",
    "Z100": "Apuracao IBS/CBS (preview reforma)",
    "9999": "Encerramento do arquivo digital",
  };

  const resumoBlocos = Object.keys(blocoNome).map((b) => ({
    bloco: b,
    nome: blocoNome[b],
    registros: counters[b] || 0,
    tamanho: `${Math.round(((linhas.filter((l) => l.startsWith("|" + b + "|")).join("\n").length || 0) / 1024) * 10) / 10} KB`,
    status: counters[b] > 0 ? "pronto" : "pendente",
  }));

  return {
    txt,
    resumoBlocos,
    totais: { pis: totalPis, cofins: totalCofins, ibsCbs: totalIbsCbs },
  };
}

export function downloadTxt(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
