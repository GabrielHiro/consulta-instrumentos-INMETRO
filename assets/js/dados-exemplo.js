// Base de dados de instrumentos RBMLQ-I
const DADOS_EXEMPLO = [
  {
    "SiglaUf": "SP",
    "Estado": "São Paulo",
    "Municipio": "SÃO PAULO",
    "LocalVerificacao": "Av. Paulista, 1000 - São Paulo/SP",
    "DataUltimaVerificacao": "15/08/2024",
    "DataValidade": "14/08/2025",
    "UltimoResultado": "Aprovado",
    "TipoMedidor": "Medidor de Combustível Líquido",
    "Faixas": [
      {
        "NumeroFaixa": "1",
        "NumeroInmetro": "12345678",
        "NumeroSerie": "ABC123456",
        "Sentido": "CRESCENTE",
        "VelocidadeNominal": "60"
      }
    ]
  },
  {
    "SiglaUf": "RJ",
    "Estado": "Rio de Janeiro",
    "Municipio": "RIO DE JANEIRO",
    "LocalVerificacao": "Av. Copacabana, 500 - Rio de Janeiro/RJ",
    "DataUltimaVerificacao": "20/07/2024",
    "DataValidade": "19/07/2025",
    "UltimoResultado": "Aprovado",
    "TipoMedidor": "Medidor de Combustível Líquido",
    "Faixas": [
      {
        "NumeroFaixa": "1",
        "NumeroInmetro": "87654321",
        "NumeroSerie": "DEF789012",
        "Sentido": "CRESCENTE",
        "VelocidadeNominal": "50"
      }
    ]
  },
  {
    "SiglaUf": "MG",
    "Estado": "Minas Gerais",
    "Municipio": "BELO HORIZONTE",
    "LocalVerificacao": "Av. Afonso Pena, 3000 - Belo Horizonte/MG",
    "DataUltimaVerificacao": "10/09/2024",
    "DataValidade": "09/09/2025",
    "UltimoResultado": "Rejeitado",
    "TipoMedidor": "Medidor de Combustível Líquido",
    "Faixas": [
      {
        "NumeroFaixa": "1",
        "NumeroInmetro": "11223344",
        "NumeroSerie": "GHI345678",
        "Sentido": "CRESCENTE",
        "VelocidadeNominal": "40"
      }
    ]
  },
  {
    "SiglaUf": "RS",
    "Estado": "Rio Grande do Sul",
    "Municipio": "PORTO ALEGRE",
    "LocalVerificacao": "Av. Ipiranga, 1500 - Porto Alegre/RS",
    "DataUltimaVerificacao": "05/08/2024",
    "DataValidade": "04/08/2025",
    "UltimoResultado": "Aprovado",
    "TipoMedidor": "Medidor de Combustível Líquido",
    "Faixas": [
      {
        "NumeroFaixa": "1",
        "NumeroInmetro": "55667788",
        "NumeroSerie": "JKL901234",
        "Sentido": "CRESCENTE",
        "VelocidadeNominal": "80"
      }
    ]
  },
  {
    "SiglaUf": "PR",
    "Estado": "Paraná",
    "Municipio": "CURITIBA",
    "LocalVerificacao": "Rua XV de Novembro, 800 - Curitiba/PR",
    "DataUltimaVerificacao": "25/06/2024",
    "DataValidade": "24/06/2025",
    "UltimoResultado": "Aprovado",
    "TipoMedidor": "Medidor de Combustível Líquido",
    "Faixas": [
      {
        "NumeroFaixa": "1",
        "NumeroInmetro": "99887766",
        "NumeroSerie": "MNO567890",
        "Sentido": "CRESCENTE",
        "VelocidadeNominal": "60"
      }
    ]
  },
  {
    "SiglaUf": "BA",
    "Estado": "Bahia",
    "Municipio": "SALVADOR",
    "LocalVerificacao": "Av. Tancredo Neves, 2000 - Salvador/BA",
    "DataUltimaVerificacao": "12/07/2024",
    "DataValidade": "11/07/2025",
    "UltimoResultado": "Aprovado",
    "TipoMedidor": "Medidor de Combustível Líquido",
    "Faixas": [
      {
        "NumeroFaixa": "1",
        "NumeroInmetro": "33445566",
        "NumeroSerie": "PQR123456",
        "Sentido": "CRESCENTE",
        "VelocidadeNominal": "70"
      }
    ]
  },
  {
    "SiglaUf": "PE",
    "Estado": "Pernambuco",
    "Municipio": "RECIFE",
    "LocalVerificacao": "Av. Boa Viagem, 5000 - Recife/PE",
    "DataUltimaVerificacao": "30/05/2024",
    "DataValidade": "29/05/2025",
    "UltimoResultado": "Rejeitado",
    "TipoMedidor": "Medidor de Combustível Líquido",
    "Faixas": [
      {
        "NumeroFaixa": "1",
        "NumeroInmetro": "77889900",
        "NumeroSerie": "STU789012",
        "Sentido": "CRESCENTE",
        "VelocidadeNominal": "50"
      }
    ]
  },
  {
    "SiglaUf": "CE",
    "Estado": "Ceará",
    "Municipio": "FORTALEZA",
    "LocalVerificacao": "Av. Beira Mar, 3500 - Fortaleza/CE",
    "DataUltimaVerificacao": "18/08/2024",
    "DataValidade": "17/08/2025",
    "UltimoResultado": "Aprovado",
    "TipoMedidor": "Medidor de Combustível Líquido",
    "Faixas": [
      {
        "NumeroFaixa": "1",
        "NumeroInmetro": "11335577",
        "NumeroSerie": "VWX345678",
        "Sentido": "CRESCENTE",
        "VelocidadeNominal": "60"
      }
    ]
  },
  {
    "SiglaUf": "SC",
    "Estado": "Santa Catarina",
    "Municipio": "FLORIANÓPOLIS",
    "LocalVerificacao": "Av. Mauro Ramos, 1200 - Florianópolis/SC",
    "DataUltimaVerificacao": "22/07/2024",
    "DataValidade": "21/07/2025",
    "UltimoResultado": "Aprovado",
    "TipoMedidor": "Medidor de Combustível Líquido",
    "Faixas": [
      {
        "NumeroFaixa": "1",
        "NumeroInmetro": "99224488",
        "NumeroSerie": "YZA901234",
        "Sentido": "CRESCENTE",
        "VelocidadeNominal": "50"
      }
    ]
  },
  {
    "SiglaUf": "GO",
    "Estado": "Goiás",
    "Municipio": "GOIÂNIA",
    "LocalVerificacao": "Av. Goiás, 800 - Goiânia/GO",
    "DataUltimaVerificacao": "14/06/2024",
    "DataValidade": "13/06/2025",
    "UltimoResultado": "Aprovado",
    "TipoMedidor": "Medidor de Combustível Líquido",
    "Faixas": [
      {
        "NumeroFaixa": "1",
        "NumeroInmetro": "66778899",
        "NumeroSerie": "BCD567890",
        "Sentido": "CRESCENTE",
        "VelocidadeNominal": "70"
      }
    ]
  },
  {
    "SiglaUf": "ES",
    "Estado": "Espírito Santo",
    "Municipio": "VITÓRIA",
    "LocalVerificacao": "Av. Vitória, 1000 - Vitória/ES",
    "DataUltimaVerificacao": "28/07/2024",
    "DataValidade": "27/07/2025",
    "UltimoResultado": "Aprovado",
    "TipoMedidor": "Medidor de Combustível Líquido",
    "Faixas": [
      {
        "NumeroFaixa": "1",
        "NumeroInmetro": "44556677",
        "NumeroSerie": "EFG123456",
        "Sentido": "CRESCENTE",
        "VelocidadeNominal": "60"
      }
    ]
  },
  {
    "SiglaUf": "MT",
    "Estado": "Mato Grosso",
    "Municipio": "CUIABÁ",
    "LocalVerificacao": "Av. Getúlio Vargas, 2500 - Cuiabá/MT",
    "DataUltimaVerificacao": "09/08/2024",
    "DataValidade": "08/08/2025",
    "UltimoResultado": "Rejeitado",
    "TipoMedidor": "Medidor de Combustível Líquido",
    "Faixas": [
      {
        "NumeroFaixa": "1",
        "NumeroInmetro": "22334455",
        "NumeroSerie": "HIJ789012",
        "Sentido": "CRESCENTE",
        "VelocidadeNominal": "80"
      }
    ]
  }
];

// Função para obter dados da base RBMLQ-I
function getDadosExemplo() {
    return DADOS_EXEMPLO;
}
