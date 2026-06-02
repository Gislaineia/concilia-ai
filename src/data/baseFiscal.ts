// Base fiscal de referencia para consulta rapida do contador.
// Curada para o publico-alvo do MVP (comercio/distribuicao).

export interface NcmRef {
  ncm: string;
  descricao: string;
  categoria: string;
  cisc?: string;
  observacao?: string;
  monofasico?: boolean;
  st?: boolean;
  aliquotaIcmsTipica?: number;
}

export interface CstRef {
  cst: string;
  nome: string;
  descricao: string;
  geraCredito: boolean;
}

export interface CfopRef {
  cfop: string;
  natureza: string;
  descricao: string;
  direcao: "entrada" | "saida";
  estado: "interna" | "interestadual" | "exterior";
}

export const ncms: NcmRef[] = [
  { ncm: "21069090", descricao: "Preparacoes alimenticias diversas", categoria: "Alimenticios", cisc: "09.0090.00", aliquotaIcmsTipica: 18 },
  { ncm: "22021000", descricao: "Refrigerantes", categoria: "Bebidas", cisc: "07.0145.00", monofasico: true, st: true, aliquotaIcmsTipica: 18, observacao: "PIS/COFINS monofasico - sem credito ao revendedor" },
  { ncm: "22030000", descricao: "Cervejas de malte", categoria: "Bebidas", cisc: "07.0150.00", monofasico: true, st: true, aliquotaIcmsTipica: 25 },
  { ncm: "22042100", descricao: "Vinhos em recipientes ate 2L", categoria: "Bebidas", aliquotaIcmsTipica: 25, st: true },
  { ncm: "27101259", descricao: "Gasolina automotiva", categoria: "Combustiveis", monofasico: true, st: true, aliquotaIcmsTipica: 25 },
  { ncm: "27101921", descricao: "Oleo diesel", categoria: "Combustiveis", monofasico: true, aliquotaIcmsTipica: 12 },
  { ncm: "33041000", descricao: "Produtos de maquilagem para os labios", categoria: "Cosmeticos", monofasico: true, aliquotaIcmsTipica: 25 },
  { ncm: "33049910", descricao: "Outros cremes e locoes", categoria: "Higiene", cisc: "21.0089.00", st: true, aliquotaIcmsTipica: 18 },
  { ncm: "34011190", descricao: "Sabonete em barra", categoria: "Higiene", cisc: "21.0010.00", st: true, aliquotaIcmsTipica: 18 },
  { ncm: "34022000", descricao: "Detergentes liquidos", categoria: "Limpeza", cisc: "21.0090.00", st: true, aliquotaIcmsTipica: 18 },
  { ncm: "39231000", descricao: "Caixas, caixotes - plastico", categoria: "Embalagens", aliquotaIcmsTipica: 18 },
  { ncm: "39239090", descricao: "Outras embalagens de plastico", categoria: "Embalagens", cisc: "03.0021.00", aliquotaIcmsTipica: 18 },
  { ncm: "48030010", descricao: "Papel higienico", categoria: "Higiene", cisc: "11.0050.00", st: true, aliquotaIcmsTipica: 18 },
  { ncm: "48191000", descricao: "Caixas de papelao ondulado", categoria: "Embalagens", aliquotaIcmsTipica: 18 },
  { ncm: "61091000", descricao: "Camisetas de algodao", categoria: "Vestuario", aliquotaIcmsTipica: 18 },
  { ncm: "62034200", descricao: "Calcas de algodao masculinas", categoria: "Vestuario", aliquotaIcmsTipica: 18 },
  { ncm: "64041900", descricao: "Calcados com sola de plastico", categoria: "Calcados", aliquotaIcmsTipica: 18 },
  { ncm: "73181500", descricao: "Parafusos e pernos de ferro", categoria: "Ferragens", aliquotaIcmsTipica: 18 },
  { ncm: "76061100", descricao: "Folhas de aluminio - rolo", categoria: "Embalagens", cisc: "12.0001.00", aliquotaIcmsTipica: 18 },
  { ncm: "84715090", descricao: "Outras unidades de processamento (CPU)", categoria: "Informatica", aliquotaIcmsTipica: 18 },
  { ncm: "85171231", descricao: "Telefones celulares", categoria: "Eletronicos", st: true, aliquotaIcmsTipica: 25 },
  { ncm: "85287200", descricao: "Aparelhos receptores de TV", categoria: "Eletronicos", st: true, aliquotaIcmsTipica: 25 },
  { ncm: "94036000", descricao: "Moveis de madeira", categoria: "Moveis", aliquotaIcmsTipica: 12 },
  { ncm: "09012100", descricao: "Cafe torrado nao descafeinado", categoria: "Alimenticios", cisc: "09.0012.00", aliquotaIcmsTipica: 7 },
  { ncm: "10063021", descricao: "Arroz polido tipo 1", categoria: "Alimenticios", aliquotaIcmsTipica: 7 },
  { ncm: "07133390", descricao: "Feijao seco", categoria: "Alimenticios", aliquotaIcmsTipica: 7 },
  { ncm: "11010010", descricao: "Farinha de trigo", categoria: "Alimenticios", aliquotaIcmsTipica: 7 },
  { ncm: "17019900", descricao: "Outros acucares", categoria: "Alimenticios", aliquotaIcmsTipica: 7 },
];

export const cstPisCofins: CstRef[] = [
  { cst: "01", nome: "Operacao tributavel - aliquota basica", descricao: "PIS 1,65% / COFINS 7,6% (nao-cumulativo)", geraCredito: true },
  { cst: "02", nome: "Operacao tributavel - aliquota diferenciada", descricao: "Produtos com aliquota especifica", geraCredito: true },
  { cst: "03", nome: "Operacao tributavel - quantidade fisica", descricao: "Aliquota por unidade", geraCredito: true },
  { cst: "04", nome: "Monofasico - revenda - aliquota zero", descricao: "Revendedor de monofasico - sem tributacao na revenda", geraCredito: false },
  { cst: "05", nome: "Operacao tributavel - ST", descricao: "Substituicao tributaria PIS/COFINS", geraCredito: false },
  { cst: "06", nome: "Operacao tributavel - aliquota zero", descricao: "Cesta basica e itens da Lei 10.925", geraCredito: false },
  { cst: "07", nome: "Operacao isenta", descricao: "Itens isentos", geraCredito: false },
  { cst: "08", nome: "Operacao sem incidencia", descricao: "Fora do campo de incidencia", geraCredito: false },
  { cst: "09", nome: "Operacao com suspensao", descricao: "PIS/COFINS suspenso", geraCredito: false },
  { cst: "49", nome: "Outras operacoes de saida", descricao: "Saidas nao classificadas em 01-09", geraCredito: false },
  { cst: "50", nome: "Direito a credito - entrada tributada para receita tributada", descricao: "Compra para revenda em nao-cumulativo", geraCredito: true },
  { cst: "51", nome: "Direito a credito - entrada tributada para receita nao tributada interno", descricao: "", geraCredito: true },
  { cst: "52", nome: "Direito a credito - entrada tributada para receita de exportacao", descricao: "", geraCredito: true },
  { cst: "53", nome: "Credito - entrada com receitas mistas", descricao: "Apuracao proporcional", geraCredito: true },
  { cst: "60", nome: "Credito presumido - aliquota basica", descricao: "Agroindustria, Lei 10.925", geraCredito: true },
  { cst: "70", nome: "Operacao de aquisicao sem direito a credito", descricao: "Cumulativo (Simples e Presumido) ou uso/consumo", geraCredito: false },
  { cst: "71", nome: "Operacao de aquisicao com isencao", descricao: "Sem credito", geraCredito: false },
  { cst: "72", nome: "Operacao de aquisicao com suspensao", descricao: "Sem credito", geraCredito: false },
  { cst: "73", nome: "Operacao de aquisicao com aliquota zero", descricao: "Sem credito", geraCredito: false },
  { cst: "75", nome: "Operacao de aquisicao por substituicao", descricao: "PIS/COFINS retido na origem", geraCredito: false },
  { cst: "98", nome: "Outras operacoes de entrada", descricao: "Entradas nao classificadas", geraCredito: false },
  { cst: "99", nome: "Outras operacoes", descricao: "Operacoes nao especificadas - servicos, ajustes", geraCredito: false },
];

export const cstIcms: CstRef[] = [
  { cst: "00", nome: "Tributada integralmente", descricao: "ICMS aplicado normalmente", geraCredito: true },
  { cst: "10", nome: "Tributada e com cobranca de ICMS-ST", descricao: "Operacao normal + ST para frente", geraCredito: true },
  { cst: "20", nome: "Com reducao de base de calculo", descricao: "BC reduzida (cesta basica etc)", geraCredito: true },
  { cst: "30", nome: "Isenta ou nao tributada e com cobranca de ICMS-ST", descricao: "", geraCredito: false },
  { cst: "40", nome: "Isenta", descricao: "Item isento de ICMS", geraCredito: false },
  { cst: "41", nome: "Nao tributada", descricao: "Fora do campo de incidencia", geraCredito: false },
  { cst: "50", nome: "Suspensao", descricao: "ICMS suspenso", geraCredito: false },
  { cst: "51", nome: "Diferimento", descricao: "ICMS diferido para etapa posterior", geraCredito: false },
  { cst: "60", nome: "ICMS cobrado anteriormente por ST", descricao: "Mercadoria ja recolheu ST - sem destaque", geraCredito: false },
  { cst: "70", nome: "Com reducao de BC e cobranca de ICMS-ST", descricao: "", geraCredito: true },
  { cst: "90", nome: "Outras", descricao: "Outras situacoes nao classificadas", geraCredito: false },
];

export const cstCsosn: CstRef[] = [
  { cst: "101", nome: "Tributada com permissao de credito (Simples Nacional)", descricao: "ME/EPP - permite credito ao adquirente", geraCredito: true },
  { cst: "102", nome: "Tributada sem permissao de credito", descricao: "ME/EPP - sem credito ao adquirente", geraCredito: false },
  { cst: "103", nome: "Isencao por faixa de receita bruta", descricao: "Tributacao zerada por faixa do anexo", geraCredito: false },
  { cst: "201", nome: "Tributada com permissao de credito + ST", descricao: "Simples + ST", geraCredito: true },
  { cst: "202", nome: "Tributada sem credito + ST", descricao: "Simples + ST sem credito", geraCredito: false },
  { cst: "203", nome: "Isencao por faixa + ST", descricao: "", geraCredito: false },
  { cst: "300", nome: "Imune", descricao: "Operacao imune (livros, jornais, etc)", geraCredito: false },
  { cst: "400", nome: "Nao tributada pelo Simples Nacional", descricao: "Servicos sujeitos ao ISS", geraCredito: false },
  { cst: "500", nome: "ICMS cobrado anteriormente por ST", descricao: "Item ja sofreu ST", geraCredito: false },
  { cst: "900", nome: "Outras", descricao: "Outras situacoes do Simples", geraCredito: false },
];

export const cfops: CfopRef[] = [
  // Entradas internas (1xxx)
  { cfop: "1102", natureza: "Compra para comercializacao", descricao: "Compra para revenda - operacao interna", direcao: "entrada", estado: "interna" },
  { cfop: "1124", natureza: "Industrializacao por encomenda", descricao: "Recebimento de industrializacao por encomenda", direcao: "entrada", estado: "interna" },
  { cfop: "1352", natureza: "Aquisicao de servico de transporte", descricao: "Frete sobre compra - interna", direcao: "entrada", estado: "interna" },
  { cfop: "1403", natureza: "Compra ST - revenda", descricao: "Compra para revenda em ST (interna)", direcao: "entrada", estado: "interna" },
  { cfop: "1551", natureza: "Compra de bem para o ativo imobilizado", descricao: "Aquisicao de ativo - interna", direcao: "entrada", estado: "interna" },
  { cfop: "1556", natureza: "Compra de material para uso ou consumo", descricao: "Material de uso/consumo - interna", direcao: "entrada", estado: "interna" },
  { cfop: "1949", natureza: "Outra entrada", descricao: "Outras entradas nao especificadas - interna", direcao: "entrada", estado: "interna" },
  // Entradas interestaduais (2xxx)
  { cfop: "2102", natureza: "Compra para comercializacao", descricao: "Compra para revenda - interestadual", direcao: "entrada", estado: "interestadual" },
  { cfop: "2352", natureza: "Aquisicao de servico de transporte", descricao: "Frete sobre compra - interestadual", direcao: "entrada", estado: "interestadual" },
  { cfop: "2403", natureza: "Compra ST - revenda", descricao: "Compra para revenda em ST (interestadual)", direcao: "entrada", estado: "interestadual" },
  { cfop: "2551", natureza: "Compra de bem para o ativo imobilizado", descricao: "Aquisicao de ativo - interestadual", direcao: "entrada", estado: "interestadual" },
  { cfop: "2556", natureza: "Compra de material para uso ou consumo", descricao: "Material de uso/consumo - interestadual", direcao: "entrada", estado: "interestadual" },
  // Saidas internas (5xxx)
  { cfop: "5102", natureza: "Venda de mercadoria adquirida ou recebida de terceiros", descricao: "Venda de revenda - interna", direcao: "saida", estado: "interna" },
  { cfop: "5403", natureza: "Venda de mercadoria com ST", descricao: "Venda revenda + ST", direcao: "saida", estado: "interna" },
  { cfop: "5405", natureza: "Venda de mercadoria ST - sub. tributario", descricao: "Venda como substituido", direcao: "saida", estado: "interna" },
  { cfop: "5551", natureza: "Venda de bem do ativo imobilizado", descricao: "Saida de ativo imobilizado - interna", direcao: "saida", estado: "interna" },
  { cfop: "5556", natureza: "Devolucao de compra para uso ou consumo", descricao: "Devolucao de uso/consumo - interna", direcao: "saida", estado: "interna" },
  { cfop: "5949", natureza: "Outra saida", descricao: "Outras saidas - interna", direcao: "saida", estado: "interna" },
  // Saidas interestaduais (6xxx)
  { cfop: "6102", natureza: "Venda de mercadoria", descricao: "Venda de revenda - interestadual", direcao: "saida", estado: "interestadual" },
  { cfop: "6108", natureza: "Venda de mercadoria a nao contribuinte", descricao: "Venda interestadual a consumidor final - DIFAL", direcao: "saida", estado: "interestadual" },
  { cfop: "6403", natureza: "Venda de mercadoria com ST", descricao: "Venda revenda + ST - interestadual", direcao: "saida", estado: "interestadual" },
  { cfop: "6551", natureza: "Venda de bem do ativo imobilizado", descricao: "Saida de ativo - interestadual", direcao: "saida", estado: "interestadual" },
  // Exterior
  { cfop: "3102", natureza: "Compra para comercializacao - importacao", descricao: "Importacao para revenda", direcao: "entrada", estado: "exterior" },
  { cfop: "7102", natureza: "Venda para o exterior", descricao: "Exportacao de mercadoria", direcao: "saida", estado: "exterior" },
];
