// Amostras reais de NF-e para teste imediato.
// Apos clicar em "Carregar amostras", o usuario tem 4 documentos
// processados pelo motor de regras, com dois pares fornecedor+NCM
// repetidos (para demonstrar o aprendizado automatico).

export const sampleXmls: { nome: string; conteudo: string }[] = [
  {
    nome: "nfe-aluminio-001.xml",
    conteudo: `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
  <NFe>
    <infNFe Id="NFe35260533111222000177550010000123451000001234" versao="4.00">
      <ide>
        <cUF>35</cUF><cNF>00001234</cNF>
        <natOp>VENDA DE MERCADORIA</natOp>
        <mod>55</mod><serie>1</serie><nNF>12345</nNF>
        <dhEmi>2026-05-29T10:30:00-03:00</dhEmi>
        <tpNF>0</tpNF><idDest>1</idDest>
        <cMunFG>3550308</cMunFG><tpImp>1</tpImp><tpEmis>1</tpEmis>
        <cDV>4</cDV><tpAmb>1</tpAmb><finNFe>1</finNFe><indFinal>0</indFinal>
        <indPres>1</indPres><procEmi>0</procEmi><verProc>4.00</verProc>
      </ide>
      <emit>
        <CNPJ>33111222000177</CNPJ>
        <xNome>INDUSTRIA PAPEL ALUMINIO SA</xNome>
        <enderEmit>
          <xLgr>RUA DAS INDUSTRIAS</xLgr><nro>450</nro>
          <xBairro>DISTRITO INDUSTRIAL</xBairro><cMun>3550308</cMun>
          <xMun>SAO PAULO</xMun><UF>SP</UF><CEP>04001000</CEP>
        </enderEmit>
        <IE>123456789012</IE><CRT>3</CRT>
      </emit>
      <dest>
        <CNPJ>12345678000190</CNPJ>
        <xNome>DISTRIBUIDORA AURORA LTDA</xNome>
        <enderDest>
          <xLgr>AV PAULISTA</xLgr><nro>1500</nro>
          <xBairro>BELA VISTA</xBairro><cMun>3550308</cMun>
          <xMun>SAO PAULO</xMun><UF>SP</UF><CEP>01310100</CEP>
        </enderDest>
        <indIEDest>1</indIEDest><IE>987654321098</IE>
      </dest>
      <det nItem="1">
        <prod>
          <cProd>ALUM-30</cProd><cEAN>SEM GTIN</cEAN>
          <xProd>PAPEL ALUMINIO 30CM ROLO 7,5M</xProd>
          <NCM>76061100</NCM><CFOP>5102</CFOP>
          <uCom>UN</uCom><qCom>120</qCom><vUnCom>15.0000</vUnCom>
          <vProd>1800.00</vProd><cEANTrib>SEM GTIN</cEANTrib>
          <uTrib>UN</uTrib><qTrib>120</qTrib><vUnTrib>15.0000</vUnTrib>
          <indTot>1</indTot>
        </prod>
        <imposto>
          <ICMS><ICMS00><orig>0</orig><CST>00</CST><modBC>3</modBC>
          <vBC>1800.00</vBC><pICMS>18.00</pICMS><vICMS>324.00</vICMS></ICMS00></ICMS>
          <PIS><PISAliq><CST>01</CST><vBC>1800.00</vBC>
          <pPIS>1.65</pPIS><vPIS>29.70</vPIS></PISAliq></PIS>
          <COFINS><COFINSAliq><CST>01</CST><vBC>1800.00</vBC>
          <pCOFINS>7.60</pCOFINS><vCOFINS>136.80</vCOFINS></COFINSAliq></COFINS>
        </imposto>
      </det>
      <det nItem="2">
        <prod>
          <cProd>ALUM-45</cProd><cEAN>SEM GTIN</cEAN>
          <xProd>PAPEL ALUMINIO 45CM ROLO 7,5M</xProd>
          <NCM>76061100</NCM><CFOP>5102</CFOP>
          <uCom>UN</uCom><qCom>60</qCom><vUnCom>22.5000</vUnCom>
          <vProd>1350.00</vProd><indTot>1</indTot>
        </prod>
        <imposto>
          <ICMS><ICMS00><orig>0</orig><CST>00</CST><modBC>3</modBC>
          <vBC>1350.00</vBC><pICMS>18.00</pICMS><vICMS>243.00</vICMS></ICMS00></ICMS>
          <PIS><PISAliq><CST>01</CST><vBC>1350.00</vBC>
          <pPIS>1.65</pPIS><vPIS>22.28</vPIS></PISAliq></PIS>
          <COFINS><COFINSAliq><CST>01</CST><vBC>1350.00</vBC>
          <pCOFINS>7.60</pCOFINS><vCOFINS>102.60</vCOFINS></COFINSAliq></COFINS>
        </imposto>
      </det>
      <total><ICMSTot>
        <vBC>3150.00</vBC><vICMS>567.00</vICMS><vICMSDeson>0.00</vICMSDeson>
        <vBCST>0.00</vBCST><vST>0.00</vST><vProd>3150.00</vProd>
        <vFrete>0.00</vFrete><vSeg>0.00</vSeg><vDesc>0.00</vDesc>
        <vII>0.00</vII><vIPI>0.00</vIPI><vIPIDevol>0.00</vIPIDevol>
        <vPIS>51.98</vPIS><vCOFINS>239.40</vCOFINS><vOutro>0.00</vOutro>
        <vNF>3150.00</vNF>
      </ICMSTot></total>
    </infNFe>
  </NFe>
</nfeProc>`,
  },
  {
    nome: "nfe-aluminio-002.xml",
    conteudo: `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
  <NFe>
    <infNFe Id="NFe35260533111222000177550010000123461000001234" versao="4.00">
      <ide>
        <cUF>35</cUF><cNF>00001234</cNF>
        <natOp>VENDA DE MERCADORIA</natOp>
        <mod>55</mod><serie>1</serie><nNF>12346</nNF>
        <dhEmi>2026-05-30T14:15:00-03:00</dhEmi>
        <tpNF>0</tpNF><idDest>1</idDest>
        <cMunFG>3550308</cMunFG><tpImp>1</tpImp><tpEmis>1</tpEmis>
        <cDV>4</cDV><tpAmb>1</tpAmb><finNFe>1</finNFe>
      </ide>
      <emit>
        <CNPJ>33111222000177</CNPJ>
        <xNome>INDUSTRIA PAPEL ALUMINIO SA</xNome>
        <enderEmit>
          <xLgr>RUA DAS INDUSTRIAS</xLgr><nro>450</nro>
          <xBairro>DISTRITO INDUSTRIAL</xBairro><cMun>3550308</cMun>
          <xMun>SAO PAULO</xMun><UF>SP</UF><CEP>04001000</CEP>
        </enderEmit>
        <IE>123456789012</IE><CRT>3</CRT>
      </emit>
      <dest>
        <CNPJ>12345678000190</CNPJ>
        <xNome>DISTRIBUIDORA AURORA LTDA</xNome>
        <enderDest>
          <xLgr>AV PAULISTA</xLgr><nro>1500</nro>
          <xBairro>BELA VISTA</xBairro><cMun>3550308</cMun>
          <xMun>SAO PAULO</xMun><UF>SP</UF><CEP>01310100</CEP>
        </enderDest>
        <indIEDest>1</indIEDest><IE>987654321098</IE>
      </dest>
      <det nItem="1">
        <prod>
          <cProd>ALUM-30</cProd>
          <xProd>PAPEL ALUMINIO 30CM ROLO 7,5M</xProd>
          <NCM>76061100</NCM><CFOP>5102</CFOP>
          <uCom>UN</uCom><qCom>200</qCom><vUnCom>15.0000</vUnCom>
          <vProd>3000.00</vProd><indTot>1</indTot>
        </prod>
        <imposto>
          <ICMS><ICMS00><orig>0</orig><CST>00</CST><modBC>3</modBC>
          <vBC>3000.00</vBC><pICMS>18.00</pICMS><vICMS>540.00</vICMS></ICMS00></ICMS>
          <PIS><PISAliq><CST>01</CST><vBC>3000.00</vBC>
          <pPIS>1.65</pPIS><vPIS>49.50</vPIS></PISAliq></PIS>
          <COFINS><COFINSAliq><CST>01</CST><vBC>3000.00</vBC>
          <pCOFINS>7.60</pCOFINS><vCOFINS>228.00</vCOFINS></COFINSAliq></COFINS>
        </imposto>
      </det>
      <total><ICMSTot>
        <vBC>3000.00</vBC><vICMS>540.00</vICMS>
        <vBCST>0.00</vBCST><vST>0.00</vST><vProd>3000.00</vProd>
        <vFrete>0.00</vFrete><vSeg>0.00</vSeg><vDesc>0.00</vDesc>
        <vPIS>49.50</vPIS><vCOFINS>228.00</vCOFINS>
        <vNF>3000.00</vNF>
      </ICMSTot></total>
    </infNFe>
  </NFe>
</nfeProc>`,
  },
  {
    nome: "nfe-bebidas-001.xml",
    conteudo: `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
  <NFe>
    <infNFe Id="NFe43260577888999000144550010000098761000009876" versao="4.00">
      <ide>
        <cUF>43</cUF><cNF>00009876</cNF>
        <natOp>VENDA DE MERCADORIA</natOp>
        <mod>55</mod><serie>1</serie><nNF>9876</nNF>
        <dhEmi>2026-05-28T09:00:00-03:00</dhEmi>
        <tpNF>0</tpNF><idDest>2</idDest>
        <cMunFG>4314902</cMunFG><tpImp>1</tpImp><tpEmis>1</tpEmis>
        <cDV>1</cDV><tpAmb>1</tpAmb><finNFe>1</finNFe>
      </ide>
      <emit>
        <CNPJ>77888999000144</CNPJ>
        <xNome>ATACADO BEBIDAS UNIAO LTDA</xNome>
        <enderEmit>
          <xLgr>AV BENJAMIN CONSTANT</xLgr><nro>2100</nro>
          <xBairro>SAO GERALDO</xBairro><cMun>4314902</cMun>
          <xMun>PORTO ALEGRE</xMun><UF>RS</UF><CEP>90550003</CEP>
        </enderEmit>
        <IE>0241586302</IE><CRT>3</CRT>
      </emit>
      <dest>
        <CNPJ>12345678000190</CNPJ>
        <xNome>DISTRIBUIDORA AURORA LTDA</xNome>
        <enderDest>
          <xLgr>AV PAULISTA</xLgr><nro>1500</nro>
          <xBairro>BELA VISTA</xBairro><cMun>3550308</cMun>
          <xMun>SAO PAULO</xMun><UF>SP</UF><CEP>01310100</CEP>
        </enderDest>
        <indIEDest>1</indIEDest><IE>987654321098</IE>
      </dest>
      <det nItem="1">
        <prod>
          <cProd>BEB-COL-2L</cProd>
          <xProd>REFRIGERANTE COLA 2L</xProd>
          <NCM>22021000</NCM><CFOP>6102</CFOP>
          <uCom>CX</uCom><qCom>30</qCom><vUnCom>120.0000</vUnCom>
          <vProd>3600.00</vProd><indTot>1</indTot>
        </prod>
        <imposto>
          <ICMS><ICMS00><orig>0</orig><CST>00</CST><modBC>3</modBC>
          <vBC>3600.00</vBC><pICMS>12.00</pICMS><vICMS>432.00</vICMS></ICMS00></ICMS>
          <PIS><PISAliq><CST>01</CST><vBC>3600.00</vBC>
          <pPIS>1.65</pPIS><vPIS>59.40</vPIS></PISAliq></PIS>
          <COFINS><COFINSAliq><CST>01</CST><vBC>3600.00</vBC>
          <pCOFINS>7.60</pCOFINS><vCOFINS>273.60</vCOFINS></COFINSAliq></COFINS>
        </imposto>
      </det>
      <det nItem="2">
        <prod>
          <cProd>BEB-GUARANA-2L</cProd>
          <xProd>REFRIGERANTE GUARANA 2L</xProd>
          <NCM>22021000</NCM><CFOP>6102</CFOP>
          <uCom>CX</uCom><qCom>20</qCom><vUnCom>110.0000</vUnCom>
          <vProd>2200.00</vProd><indTot>1</indTot>
        </prod>
        <imposto>
          <ICMS><ICMS00><orig>0</orig><CST>00</CST><modBC>3</modBC>
          <vBC>2200.00</vBC><pICMS>12.00</pICMS><vICMS>264.00</vICMS></ICMS00></ICMS>
          <PIS><PISAliq><CST>01</CST><vBC>2200.00</vBC>
          <pPIS>1.65</pPIS><vPIS>36.30</vPIS></PISAliq></PIS>
          <COFINS><COFINSAliq><CST>01</CST><vBC>2200.00</vBC>
          <pCOFINS>7.60</pCOFINS><vCOFINS>167.20</vCOFINS></COFINSAliq></COFINS>
        </imposto>
      </det>
      <total><ICMSTot>
        <vBC>5800.00</vBC><vICMS>696.00</vICMS>
        <vBCST>0.00</vBCST><vST>0.00</vST><vProd>5800.00</vProd>
        <vFrete>0.00</vFrete><vSeg>0.00</vSeg><vDesc>0.00</vDesc>
        <vPIS>95.70</vPIS><vCOFINS>440.80</vCOFINS>
        <vNF>5800.00</vNF>
      </ICMSTot></total>
    </infNFe>
  </NFe>
</nfeProc>`,
  },
  {
    nome: "nfe-higiene-001.xml",
    conteudo: `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
  <NFe>
    <infNFe Id="NFe35260544556677000122550010000045671000004567" versao="4.00">
      <ide>
        <cUF>35</cUF><cNF>00004567</cNF>
        <natOp>VENDA DE MERCADORIA</natOp>
        <mod>55</mod><serie>1</serie><nNF>4567</nNF>
        <dhEmi>2026-05-24T16:45:00-03:00</dhEmi>
        <tpNF>0</tpNF><idDest>1</idDest>
        <cMunFG>3550308</cMunFG><tpImp>1</tpImp><tpEmis>1</tpEmis>
        <cDV>7</cDV><tpAmb>1</tpAmb><finNFe>1</finNFe>
      </ide>
      <emit>
        <CNPJ>44556677000122</CNPJ>
        <xNome>HIGIENE TROPICAL INDUSTRIA LTDA</xNome>
        <enderEmit>
          <xLgr>RUA DOS PERFUMES</xLgr><nro>800</nro>
          <xBairro>VILA INDUSTRIAL</xBairro><cMun>3550308</cMun>
          <xMun>SAO PAULO</xMun><UF>SP</UF><CEP>03001000</CEP>
        </enderEmit>
        <IE>112233445566</IE><CRT>3</CRT>
      </emit>
      <dest>
        <CNPJ>12345678000190</CNPJ>
        <xNome>DISTRIBUIDORA AURORA LTDA</xNome>
        <enderDest>
          <xLgr>AV PAULISTA</xLgr><nro>1500</nro>
          <xBairro>BELA VISTA</xBairro><cMun>3550308</cMun>
          <xMun>SAO PAULO</xMun><UF>SP</UF><CEP>01310100</CEP>
        </enderDest>
        <indIEDest>1</indIEDest><IE>987654321098</IE>
      </dest>
      <det nItem="1">
        <prod>
          <cProd>HIG-SAB-LIQ</cProd>
          <xProd>SABONETE LIQUIDO 1L PET</xProd>
          <NCM>33049910</NCM><CFOP>5102</CFOP>
          <uCom>UN</uCom><qCom>150</qCom><vUnCom>12.0000</vUnCom>
          <vProd>1800.00</vProd><indTot>1</indTot>
        </prod>
        <imposto>
          <ICMS><ICMS00><orig>0</orig><CST>00</CST><modBC>3</modBC>
          <vBC>1800.00</vBC><pICMS>18.00</pICMS><vICMS>324.00</vICMS></ICMS00></ICMS>
          <PIS><PISAliq><CST>01</CST><vBC>1800.00</vBC>
          <pPIS>1.65</pPIS><vPIS>29.70</vPIS></PISAliq></PIS>
          <COFINS><COFINSAliq><CST>01</CST><vBC>1800.00</vBC>
          <pCOFINS>7.60</pCOFINS><vCOFINS>136.80</vCOFINS></COFINSAliq></COFINS>
        </imposto>
      </det>
      <total><ICMSTot>
        <vBC>1800.00</vBC><vICMS>324.00</vICMS>
        <vBCST>0.00</vBCST><vST>0.00</vST><vProd>1800.00</vProd>
        <vFrete>0.00</vFrete><vSeg>0.00</vSeg><vDesc>0.00</vDesc>
        <vPIS>29.70</vPIS><vCOFINS>136.80</vCOFINS>
        <vNF>1800.00</vNF>
      </ICMSTot></total>
    </infNFe>
  </NFe>
</nfeProc>`,
  },
];
