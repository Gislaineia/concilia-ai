export type DivergenceStatus = "ok" | "warn" | "crit";
export type DocType = "NF-e" | "NFS-e" | "CT-e";
export type Direction = "entrada" | "saida";

export interface Empresa {
  id: string;
  cnpj: string;
  razaoSocial: string;
  fantasia: string;
  uf: string;
  regime: "Simples Nacional" | "Lucro Presumido" | "Lucro Real";
  certificadoA1: { valido: boolean; vencimento: string };
  webhookSefaz: "ativo" | "fallback-pooling" | "inativo";
}

export interface XmlDoc {
  id: string;
  chave: string;
  numero: string;
  serie: string;
  tipo: DocType;
  direcao: Direction;
  emitenteCnpj: string;
  emitenteNome: string;
  emitenteUf: string;
  destinatarioCnpj: string;
  destinatarioNome: string;
  emissao: string;
  valor: number;
  status: DivergenceStatus;
  itensTotal: number;
  itensClassificados: number;
  cfopsResumo: string[];
  ncmsResumo: string[];
  natOp?: string;
}

export interface Parceiro {
  id: string;
  cnpj: string;
  nome: string;
  uf: string;
  tipo: "cliente" | "fornecedor" | "ambos";
  ultimaOperacao: string;
}

export interface Produto {
  id: string;
  codigo: string;
  descricao: string;
  ncm: string;
  cisc: string;
  uso: "revenda" | "consumo" | "materia-prima";
}

export interface Regra {
  id: string;
  fornecedor: string;
  cnpjEmitente: string;
  ncm: string;
  cfop: string;
  uf: string;
  regime: string;
  acao: string;
  cstPis: string;
  cstCofins: string;
  origem: "manual" | "auto-aprendida";
  hits: number;
}

export interface Divergencia {
  id: string;
  chaveDoc: string;
  doc: string;
  emitente: string;
  emitenteCnpj: string;
  ncm: string;
  cfop: string;
  uf: string;
  valor: number;
  motivo: string;
  severidade: DivergenceStatus;
  sugestao?: string;
  criada: string;
  itemNumero: number;
  itemDescricao: string;
  resolvida?: boolean;
  resolucao?: {
    acao: string;
    cstPis: string;
    cstCofins: string;
    regraId?: string;
    resolvidaEm: string;
    resolvidaPor: string;
  };
}

export interface Lancamento {
  id: string;
  chaveDoc: string;
  itemNumero: number;
  regraId: string;
  cfop: string;
  ncm: string;
  cstPis: string;
  cstCofins: string;
  valor: number;
  descricao: string;
  emissao: string;
  emitenteCnpj: string;
  emitenteNome: string;
  direcao: Direction;
}

export interface ChatMsg {
  id: string;
  role: "user" | "assistant";
  text: string;
  ts: string;
}

export interface AppState {
  empresas: Empresa[];
  xmlDocs: XmlDoc[];
  parceiros: Parceiro[];
  produtos: Produto[];
  regras: Regra[];
  divergencias: Divergencia[];
  lancamentos: Lancamento[];
  empresaAtivaId: string | null;
}
