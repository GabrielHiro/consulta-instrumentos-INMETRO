# 🛣️ Consulta Instrumentos INMETRO - Medidores de Velocidade

Sistema completo para consulta e análise de dados de medidores de velocidade do RBMLQ-I (INMETRO), com dashboard interativo, filtros avançados e armazenamento local.

## ✨ Características Principais

- **Dashboard Interativo**: Visualizações em tempo real com gráficos e métricas
- **Filtros Avançados**: Busca por estado, cidade, tipo, velocidade, período e texto livre
- **Armazenamento Local**: Dados persistem localmente usando IndexedDB
- **Database Estática**: Sistema de dados otimizado com índices para performance
- **Painel Administrativo**: Interface para gerenciamento completo dos dados
- **Design Responsivo**: Interface adaptável para desktop e mobile
- **Performance Otimizada**: Paginação, lazy loading e índices para grandes datasets

## 🚀 Como Usar

### Uso Simples
1. Abra `index.html` no navegador
2. O sistema carrega automaticamente os dados de exemplo
3. Use os filtros para explorar os dados
4. Visualize estatísticas no dashboard

### Painel Administrativo
1. Acesse `admin.html` para gerenciar dados
2. Carregue dados de exemplo ou da API do INMETRO
3. Monitore estatísticas e logs do sistema

## 📊 Funcionalidades do Dashboard

### Métricas Principais
- Total de medidores cadastrados
- Taxa de aprovação/reprovação
- Distribuição por estados e regiões
- Velocidade média dos instrumentos
- Status de validade dos certificados

### Visualizações
- **Gráfico de Estados**: Distribuição geográfica dos medidores
- **Status dos Medidores**: Taxa de aprovação vs reprovação
- **Tipos de Medidor**: Distribuição entre fixos e móveis
- **Velocidades Nominais**: Faixas de velocidade mais comuns
- **Verificações por Ano**: Tendência temporal

### Rankings
- Top 5 estados com mais medidores
- Top 5 cidades com mais instrumentos
- Top 5 proprietários por volume

## 🔍 Sistema de Filtros

### Filtros Rápidos
- Todos os instrumentos
- Apenas aprovados
- Apenas reprovados
- Instrumentos vencidos
- Verificações recentes

### Filtros Detalhados
- **Localização**: Região, estado, cidade
- **Status**: Resultado da verificação
- **Tipo**: Medidor fixo ou móvel
- **Velocidade**: Faixa de velocidade nominal
- **Período**: Data de verificação
- **Busca Textual**: Local, proprietário, certificado

## 💾 Sistema de Dados

### Arquitetura em Camadas
1. **StaticDatabase**: Base de dados estática otimizada com índices
2. **IndexedDB**: Armazenamento persistente local
3. **Dados Embutidos**: Fallback para demonstração

### Características da StaticDatabase
- **Índices Automáticos**: Por estado, cidade, tipo, resultado e proprietário
- **Consultas Otimizadas**: Performance superior para grandes datasets
- **Estatísticas em Tempo Real**: Cálculos eficientes de métricas
- **Busca Avançada**: Busca textual rápida em todos os campos

## 🛠️ Estrutura do Projeto

```
consulta-instrumentos-INMETRO/
├── index.html                 # Interface principal
├── admin.html                 # Painel administrativo
├── assets/
│   ├── css/
│   │   └── style.css         # Estilos principais
│   └── js/
│       ├── dados-exemplo.js   # Dados de exemplo embutidos
│       ├── database-static.js # Sistema de database estática
│       ├── database.js        # Interface IndexedDB
│       └── script.js          # Lógica principal da aplicação
└── README.md                  # Esta documentação
```

## 🎯 Casos de Uso

### Para Gestores Públicos
- Monitoramento da rede de medidores de velocidade
- Análise de cobertura por região
- Acompanhamento de taxa de aprovação
- Identificação de equipamentos vencidos

### Para Empresas de Medição
- Gestão do portfólio de instrumentos
- Planejamento de verificações
- Análise de desempenho regional
- Controle de validade dos certificados

### Para Auditores e Técnicos
- Consulta rápida de instrumentos
- Validação de certificados
- Análise de tendências de aprovação
- Relatórios detalhados por critério

## 📱 Compatibilidade

- **Navegadores**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Dispositivos**: Desktop, tablet e smartphone
- **Offline**: Funciona completamente offline após primeiro carregamento
- **Performance**: Otimizado para datasets com milhares de registros

## 🔧 Instalação e Deploy

### Local
```bash
# Clone ou baixe os arquivos
# Abra index.html no navegador
```

### Servidor Web
```bash
# Copie todos os arquivos para o servidor
# Configure HTTPS se necessário
# Acesse via navegador
```

### GitHub Pages
```bash
# Faça push para repositório GitHub
# Ative GitHub Pages nas configurações
# Acesse via URL do GitHub Pages
```

## 📈 Performance e Escalabilidade

### Otimizações Implementadas
- **Lazy Loading**: Carregamento sob demanda de dados
- **Paginação**: Exibição eficiente de grandes listas
- **Índices**: Consultas otimizadas por campos chave
- **Debouncing**: Filtros responsivos sem sobrecarga
- **Caching**: Armazenamento inteligente de resultados

### Limites Testados
- ✅ 10.000 registros: Performance excelente
- ✅ 50.000 registros: Performance boa
- ⚠️ 100.000+ registros: Considerar paginação server-side

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 🔗 Links Úteis

- [RBMLQ-I - INMETRO](http://www.rbmlq.gov.br/)
- [Documentação da API](http://www.rbmlq.gov.br/api-docs)
- [Chart.js Documentation](https://www.chartjs.org/docs/)

---

**Desenvolvido para facilitar o acesso e análise dos dados de instrumentos de medição de velocidade do INMETRO** 🇧🇷
