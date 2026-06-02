// Parser real de NF-e (modelo 55) e CT-e (modelo 57). Funciona com
// arquivos brutos <NFe>...</NFe> e tambem com <nfeProc>...</nfeProc>.
// Retorna uma estrutura padronizada usada pelo motor de regras.

export interface NfeItem {
  numero: number;
  codigo: string;
  descricao: string;
  ncm: string;
  cfop: string;
  cest?: string;
  unidade: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  cstIcms?: string;
  cstPis?: string;
  cstCofins?: string;
}

export interface NfeParsed {
  chave: string;
  numero: string;
  serie: string;
  modelo: string;
  tipo: "NF-e" | "CT-e" | "NFS-e";
  direcao: "entrada" | "saida";
  emitente: { cnpj: string; nome: string; uf: string; ie?: string };
  destinatario: { cnpj: string; nome: string; uf?: string };
  emissao: string; // ISO date YYYY-MM-DD
  valorTotal: number;
  itens: NfeItem[];
  natOp?: string;
}

const NFE_NS = "http://www.portalfiscal.inf.br/nfe";
const CTE_NS = "http://www.portalfiscal.inf.br/cte";

function pickNS(doc: Document, ns: string, local: string): Element | null {
  const list = doc.getElementsByTagNameNS(ns, local);
  return list.length > 0 ? list[0] : null;
}

function txt(el: Element | null | undefined, ns: string, local: string): string {
  if (!el) return "";
  const found = el.getElementsByTagNameNS(ns, local)[0];
  return found?.textContent?.trim() ?? "";
}

function num(el: Element | null | undefined, ns: string, local: string): number {
  const v = txt(el, ns, local);
  if (!v) return 0;
  const n = Number(v.replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function detectType(doc: Document): "NF-e" | "CT-e" | "NFS-e" | null {
  if (doc.getElementsByTagNameNS(NFE_NS, "infNFe").length > 0) return "NF-e";
  if (doc.getElementsByTagNameNS(CTE_NS, "infCte").length > 0) return "CT-e";
  // NFS-e tem schemas variados por municipio; tratar futuramente.
  if (doc.getElementsByTagName("InfNfse").length > 0) return "NFS-e";
  return null;
}

function parseNFe(doc: Document): NfeParsed {
  const inf = pickNS(doc, NFE_NS, "infNFe");
  if (!inf) throw new Error("Estrutura infNFe nao encontrada");

  const id = inf.getAttribute("Id") || "";
  const chave = id.replace(/^NFe/, "");

  const ide = pickNS(doc, NFE_NS, "ide");
  const emit = pickNS(doc, NFE_NS, "emit");
  const dest = pickNS(doc, NFE_NS, "dest");
  const total = pickNS(doc, NFE_NS, "ICMSTot");

  const tpNF = txt(ide, NFE_NS, "tpNF"); // 0 entrada, 1 saida
  const direcao: "entrada" | "saida" = tpNF === "1" ? "saida" : "entrada";

  const dhEmi = txt(ide, NFE_NS, "dhEmi") || txt(ide, NFE_NS, "dEmi");
  const emissao = dhEmi ? dhEmi.slice(0, 10) : "";

  const enderEmit = pickNS(doc, NFE_NS, "enderEmit");
  const enderDest = pickNS(doc, NFE_NS, "enderDest");

  const itens: NfeItem[] = [];
  const dets = doc.getElementsByTagNameNS(NFE_NS, "det");
  for (let i = 0; i < dets.length; i++) {
    const det = dets[i];
    const prod = det.getElementsByTagNameNS(NFE_NS, "prod")[0];
    if (!prod) continue;
    const imposto = det.getElementsByTagNameNS(NFE_NS, "imposto")[0];
    itens.push({
      numero: Number(det.getAttribute("nItem") || i + 1),
      codigo: txt(prod, NFE_NS, "cProd"),
      descricao: txt(prod, NFE_NS, "xProd"),
      ncm: txt(prod, NFE_NS, "NCM"),
      cfop: txt(prod, NFE_NS, "CFOP"),
      cest: txt(prod, NFE_NS, "CEST") || undefined,
      unidade: txt(prod, NFE_NS, "uCom"),
      quantidade: num(prod, NFE_NS, "qCom"),
      valorUnitario: num(prod, NFE_NS, "vUnCom"),
      valorTotal: num(prod, NFE_NS, "vProd"),
      cstIcms:
        txt(imposto, NFE_NS, "CST") ||
        txt(imposto, NFE_NS, "CSOSN") ||
        undefined,
      cstPis: txt(imposto, NFE_NS, "CST") || undefined,
      cstCofins: txt(imposto, NFE_NS, "CST") || undefined,
    });
  }

  return {
    chave,
    numero: txt(ide, NFE_NS, "nNF"),
    serie: txt(ide, NFE_NS, "serie"),
    modelo: txt(ide, NFE_NS, "mod") || "55",
    tipo: "NF-e",
    direcao,
    natOp: txt(ide, NFE_NS, "natOp"),
    emitente: {
      cnpj: txt(emit, NFE_NS, "CNPJ") || txt(emit, NFE_NS, "CPF"),
      nome: txt(emit, NFE_NS, "xNome"),
      uf: txt(enderEmit, NFE_NS, "UF"),
      ie: txt(emit, NFE_NS, "IE") || undefined,
    },
    destinatario: {
      cnpj: txt(dest, NFE_NS, "CNPJ") || txt(dest, NFE_NS, "CPF"),
      nome: txt(dest, NFE_NS, "xNome"),
      uf: txt(enderDest, NFE_NS, "UF") || undefined,
    },
    emissao,
    valorTotal: num(total, NFE_NS, "vNF"),
    itens,
  };
}

function parseCTe(doc: Document): NfeParsed {
  const inf = pickNS(doc, CTE_NS, "infCte");
  if (!inf) throw new Error("Estrutura infCte nao encontrada");
  const id = inf.getAttribute("Id") || "";
  const chave = id.replace(/^CTe/, "");
  const ide = pickNS(doc, CTE_NS, "ide");
  const emit = pickNS(doc, CTE_NS, "emit");
  const dest = pickNS(doc, CTE_NS, "dest");
  const vPrest = pickNS(doc, CTE_NS, "vPrest");
  const dhEmi = txt(ide, CTE_NS, "dhEmi");
  const enderEmit = pickNS(doc, CTE_NS, "enderEmit");
  const enderDest = pickNS(doc, CTE_NS, "enderDest");
  const cfop = txt(ide, CTE_NS, "CFOP");
  const valor = num(vPrest, CTE_NS, "vTPrest");

  return {
    chave,
    numero: txt(ide, CTE_NS, "nCT"),
    serie: txt(ide, CTE_NS, "serie"),
    modelo: txt(ide, CTE_NS, "mod") || "57",
    tipo: "CT-e",
    direcao: "entrada",
    natOp: txt(ide, CTE_NS, "natOp"),
    emitente: {
      cnpj: txt(emit, CTE_NS, "CNPJ"),
      nome: txt(emit, CTE_NS, "xNome"),
      uf: txt(enderEmit, CTE_NS, "UF"),
    },
    destinatario: {
      cnpj: txt(dest, CTE_NS, "CNPJ") || txt(dest, CTE_NS, "CPF"),
      nome: txt(dest, CTE_NS, "xNome"),
      uf: txt(enderDest, CTE_NS, "UF") || undefined,
    },
    emissao: dhEmi ? dhEmi.slice(0, 10) : "",
    valorTotal: valor,
    itens: [
      {
        numero: 1,
        codigo: "FRETE",
        descricao: "Servico de transporte",
        ncm: "",
        cfop,
        unidade: "SV",
        quantidade: 1,
        valorUnitario: valor,
        valorTotal: valor,
      },
    ],
  };
}

export function parseFiscalXml(xml: string): NfeParsed {
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  const parserError = doc.getElementsByTagName("parsererror")[0];
  if (parserError) {
    throw new Error("XML invalido: " + parserError.textContent);
  }
  const tipo = detectType(doc);
  if (tipo === "NF-e") return parseNFe(doc);
  if (tipo === "CT-e") return parseCTe(doc);
  throw new Error(
    "Tipo de documento nao suportado nesta versao (esperado NF-e ou CT-e)"
  );
}

export function formatCnpj(raw: string): string {
  const d = raw.replace(/\D/g, "").padStart(14, "0").slice(-14);
  return d.replace(
    /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
    "$1.$2.$3/$4-$5"
  );
}
